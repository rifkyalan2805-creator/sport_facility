import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreatePaymentInput,
  ListPaymentFilter,
  SimulatePaymentInput,
} from '../types/payment.types';
import { PaymentRepository, paymentRepository } from '../repositories/payment.repository';
import {
  PaymentMethodRepository,
  paymentMethodRepository,
} from '../repositories/paymentMethod.repository';
import { InvoiceRepository, invoiceRepository } from '../repositories/invoice.repository';
import {
  SiteSettingRepository,
  siteSettingRepository,
} from '../repositories/siteSetting.repository';
import { PaymentGateway, dummyPaymentGateway } from './paymentGateway';
import { FulfillmentRegistry, fulfillmentRegistry } from './fulfillment/registry';
import { PromoService, promoService } from './promo.service';
import { LoyaltyService, loyaltyService } from './loyalty.service';

export class PaymentService {
  // DI sederhana — gateway & fulfilment memakai abstraksi agar mudah diperluas.
  constructor(
    private readonly payments: PaymentRepository = paymentRepository,
    private readonly methods: PaymentMethodRepository = paymentMethodRepository,
    private readonly invoices: InvoiceRepository = invoiceRepository,
    private readonly settings: SiteSettingRepository = siteSettingRepository,
    private readonly gateway: PaymentGateway = dummyPaymentGateway,
    private readonly fulfillment: FulfillmentRegistry = fulfillmentRegistry,
    private readonly promos: PromoService = promoService,
    private readonly loyalty: LoyaltyService = loyaltyService
  ) {}

  /**
   * Membuat pembayaran berstatus PENDING beserta item-itemnya.
   * Idempoten jika `idempotencyKey` dikirim ulang.
   */
  async createPayment(input: CreatePaymentInput) {
    if (input.idempotencyKey) {
      const existing = await this.payments.findByIdempotencyKey(input.idempotencyKey);
      if (existing) return existing; // request berulang → kembalikan yang sama
    }

    // Bentuk item + hitung subtotal & total amount.
    const itemsData = input.items.map((it) => {
      const unit = new Prisma.Decimal(it.unitPrice);
      return {
        item_type: it.itemType,
        item_id: it.itemId,
        item_name: it.itemName,
        quantity: it.quantity,
        unit_price: unit,
        subtotal: unit.mul(it.quantity),
      };
    });
    const amount = itemsData.reduce(
      (sum, it) => sum.add(it.subtotal),
      new Prisma.Decimal(0)
    );

    // Fee dari metode pembayaran (jika dipilih).
    let fee = new Prisma.Decimal(0);
    let methodId: string | null = null;
    if (input.paymentMethodId) {
      const method = await this.methods.findActiveById(input.paymentMethodId);
      if (!method) {
        throw AppError.unprocessable('Metode pembayaran tidak ditemukan atau tidak aktif');
      }
      methodId = method.id;
      fee = amount.mul(method.fee_percent).div(100).add(method.fee_flat);
    }

    // Diskon: dari kode promo (server-side) bila ada, jika tidak pakai nilai manual.
    let discount = new Prisma.Decimal(input.discountAmount ?? 0);
    let promoId: string | null = input.promoId ?? null;
    if (input.promoCode) {
      const itemTypes = [...new Set(input.items.map((i) => i.itemType))];
      const result = await this.promos.validate(input.promoCode, amount.toNumber(), itemTypes);
      discount = new Prisma.Decimal(result.discountAmount);
      promoId = result.promo.id;
    }
    if (discount.greaterThan(amount)) {
      throw AppError.badRequest('discount_amount melebihi total amount');
    }
    const finalAmount = amount.sub(discount).add(fee);
    if (finalAmount.lessThan(0)) {
      throw AppError.badRequest('final_amount tidak boleh negatif');
    }

    // Charge ke gateway (dummy).
    const charge = await this.gateway.createCharge({ amount: finalAmount.toNumber() });
    const expiryMinutes = await this.getPaymentExpiryMinutes();
    const expiredAt = new Date(Date.now() + expiryMinutes * 60_000);

    const data: Prisma.paymentsUncheckedCreateInput = {
      user_id: input.userId,
      promo_id: promoId,
      payment_method_id: methodId,
      amount,
      discount_amount: discount,
      fee_amount: fee,
      final_amount: finalAmount,
      status: 'pending',
      reference_id: charge.referenceId,
      gateway_response: charge.raw as Prisma.InputJsonValue,
      expired_at: expiredAt,
      idempotency_key: input.idempotencyKey ?? null,
      payment_items: { create: itemsData },
    };

    const payment = await this.payments.create(data);
    if (input.promoCode && promoId) {
      await this.promos.consume(promoId); // tandai promo terpakai
    }
    return payment;
  }

  /**
   * SIMULASI pembayaran BERHASIL. Pada gateway asli, logika ini dijalankan
   * oleh handler webhook, bukan endpoint manual.
   * Efek: status → paid, booking terkait di-confirm, invoice dibuat.
   */
  async simulateSuccess(input: SimulatePaymentInput) {
    const payment = await this.loadOwnedPendingPayment(input);

    return prisma.$transaction(async (tx) => {
      // Fulfilment per item didelegasikan ke handler sesuai item_type.
      for (const item of payment.payment_items) {
        await this.fulfillment.get(item.item_type)?.onPaid(
          { itemType: item.item_type, itemId: item.item_id, quantity: item.quantity },
          tx
        );
      }

      const invoiceNumber = await this.generateInvoiceNumber(tx);
      await this.invoices.create(
        { payment_id: payment.id, invoice_number: invoiceNumber },
        tx
      );

      const updated = await this.payments.update(
        payment.id,
        {
          status: 'paid',
          paid_at: new Date(),
          gateway_response: { result: 'success', simulated_at: new Date().toISOString() },
        },
        tx
      );

      // Loyalty: tambah poin berdasarkan nominal yang dibayar.
      await this.loyalty.earn(payment.user_id, payment.final_amount.toNumber(), payment.id, tx);

      return updated;
    });
  }

  /**
   * SIMULASI pembayaran GAGAL. Status → failed. Booking TIDAK diubah
   * (tetap pada status sebelumnya, sesuai requirement).
   */
  async simulateFailure(input: SimulatePaymentInput) {
    const payment = await this.loadOwnedPendingPayment(input);

    return prisma.$transaction(async (tx) => {
      // Lepas reservasi per item (mis. kuota tiket kolam / HTM) via handler.
      for (const item of payment.payment_items) {
        await this.fulfillment.get(item.item_type)?.onFailed(
          { itemType: item.item_type, itemId: item.item_id, quantity: item.quantity },
          tx
        );
      }

      return this.payments.update(
        payment.id,
        {
          status: 'failed',
          gateway_response: {
            result: 'failed',
            reason: input.reason ?? 'Disimulasikan gagal',
            simulated_at: new Date().toISOString(),
          },
        },
        tx
      );
    });
  }

  async getPaymentById(id: string, userId: string) {
    const payment = await this.payments.findById(id);
    if (!payment) throw AppError.notFound('Pembayaran tidak ditemukan');
    if (payment.user_id !== userId) {
      throw new AppError(403, 'Anda tidak berhak mengakses pembayaran ini');
    }
    return payment;
  }

  async listPayments(filter: ListPaymentFilter) {
    const { data, total } = await this.payments.findMany(filter);
    return {
      data,
      meta: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  // ---- helpers ----

  private async loadOwnedPendingPayment(input: SimulatePaymentInput) {
    const payment = await this.payments.findById(input.paymentId);
    if (!payment) throw AppError.notFound('Pembayaran tidak ditemukan');
    if (payment.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak memproses pembayaran ini');
    }
    if (payment.status !== 'pending') {
      throw AppError.unprocessable(
        `Pembayaran sudah berstatus "${payment.status}", tidak bisa diproses ulang`
      );
    }
    return payment;
  }

  private async generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const prefix = `INV-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(
      2,
      '0'
    )}-`;
    const count = await this.invoices.countWithPrefix(prefix, tx);
    return `${prefix}${String(count + 1).padStart(5, '0')}`;
  }

  private async getPaymentExpiryMinutes(): Promise<number> {
    const setting = await this.settings.findByKey('payment_expiry');
    const value = setting?.value as { minutes?: number } | null;
    return value?.minutes ?? 30;
  }
}

export const paymentService = new PaymentService();
