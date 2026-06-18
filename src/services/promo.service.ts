import { Prisma, promos } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { DbClient } from '../config/prisma';
import {
  CreatePromoInput,
  UpdatePromoInput,
  ValidatePromoResult,
} from '../types/promo.types';
import { PromoRepository, promoRepository } from '../repositories/promo.repository';

export class PromoService {
  constructor(private readonly promos: PromoRepository = promoRepository) {}

  // ---- Admin CRUD ----
  listPromos() {
    return this.promos.listAll();
  }

  async getPromo(id: string) {
    const promo = await this.promos.findById(id);
    if (!promo) throw AppError.notFound('Promo tidak ditemukan');
    return promo;
  }

  createPromo(input: CreatePromoInput) {
    const data: Prisma.promosUncheckedCreateInput = {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      discount_value: new Prisma.Decimal(input.discountValue),
      min_purchase: new Prisma.Decimal(input.minPurchase),
      max_discount: input.maxDiscount != null ? new Prisma.Decimal(input.maxDiscount) : null,
      quota: input.quota,
      applicable_to: input.applicableTo as Prisma.InputJsonValue,
      valid_from: input.validFrom,
      valid_until: input.validUntil,
      is_active: input.isActive,
    };
    return this.promos.create(data);
  }

  async updatePromo(id: string, input: UpdatePromoInput) {
    await this.getPromo(id);
    const data: Prisma.promosUncheckedUpdateInput = {};
    if (input.code !== undefined) data.code = input.code.toUpperCase();
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.type !== undefined) data.type = input.type;
    if (input.discountValue !== undefined)
      data.discount_value = new Prisma.Decimal(input.discountValue);
    if (input.minPurchase !== undefined)
      data.min_purchase = new Prisma.Decimal(input.minPurchase);
    if (input.maxDiscount !== undefined)
      data.max_discount = input.maxDiscount != null ? new Prisma.Decimal(input.maxDiscount) : null;
    if (input.quota !== undefined) data.quota = input.quota;
    if (input.applicableTo !== undefined)
      data.applicable_to = input.applicableTo as Prisma.InputJsonValue;
    if (input.validFrom !== undefined) data.valid_from = input.validFrom;
    if (input.validUntil !== undefined) data.valid_until = input.validUntil;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    return this.promos.update(id, data);
  }

  /**
   * Validasi promo terhadap nominal & jenis item, lalu hitung diskon.
   * Dipakai endpoint preview maupun PaymentService.createPayment.
   */
  async validate(
    code: string,
    amount: number,
    itemTypes: string[] = []
  ): Promise<ValidatePromoResult> {
    const promo = await this.promos.findByCode(code.toUpperCase());
    if (!promo || !promo.is_active) throw AppError.unprocessable('Kode promo tidak valid');

    const now = new Date();
    if (now < promo.valid_from || now > promo.valid_until) {
      throw AppError.unprocessable('Promo di luar masa berlaku');
    }
    if (promo.used_count >= promo.quota) {
      throw AppError.unprocessable('Kuota promo sudah habis');
    }
    if (new Prisma.Decimal(amount).lessThan(promo.min_purchase)) {
      throw AppError.unprocessable(`Minimal pembelian Rp${promo.min_purchase.toString()}`);
    }

    const applicable = Array.isArray(promo.applicable_to)
      ? (promo.applicable_to as string[])
      : ['all'];
    if (!applicable.includes('all') && !itemTypes.some((t) => applicable.includes(t))) {
      throw AppError.unprocessable('Promo tidak berlaku untuk item ini');
    }

    return { promo, discountAmount: this.computeDiscount(promo, amount) };
  }

  /** Tandai promo terpakai (increment used_count). */
  consume(promoId: string, db?: DbClient) {
    return this.promos.incrementUsed(promoId, db);
  }

  private computeDiscount(promo: promos, amount: number): number {
    if (promo.type === 'percentage') {
      let d = (amount * Number(promo.discount_value)) / 100;
      if (promo.max_discount != null) d = Math.min(d, Number(promo.max_discount));
      return Math.min(Math.round(d), amount);
    }
    if (promo.type === 'fixed_amount') {
      return Math.min(Number(promo.discount_value), amount);
    }
    return 0; // free_item: tidak memotong nominal pembayaran
  }
}

export const promoService = new PromoService();
