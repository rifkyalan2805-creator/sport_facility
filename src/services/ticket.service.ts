import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  BuyTicketInput,
  CancelTicketInput,
  CreateCategoryInput,
  ScanTicketInput,
  UpdateCategoryInput,
} from '../types/ticket.types';
import {
  TicketCategoryRepository,
  ticketCategoryRepository,
} from '../repositories/ticketCategory.repository';
import { TicketRepository, ticketRepository } from '../repositories/ticket.repository';
import {
  TicketUsageRepository,
  ticketUsageRepository,
} from '../repositories/ticketUsage.repository';
import { PaymentService, paymentService } from './payment.service';

export class TicketService {
  constructor(
    private readonly categories: TicketCategoryRepository = ticketCategoryRepository,
    private readonly tickets: TicketRepository = ticketRepository,
    private readonly usages: TicketUsageRepository = ticketUsageRepository,
    private readonly payments: PaymentService = paymentService
  ) {}

  // ---- Categories (read publik) ----
  listActiveCategories() {
    return this.categories.listActive();
  }

  listAllCategories() {
    return this.categories.listAll();
  }

  async getCategory(id: string) {
    const cat = await this.categories.findById(id);
    if (!cat) throw AppError.notFound('Kategori tiket tidak ditemukan');
    return cat;
  }

  // ---- Categories (admin) ----
  createCategory(input: CreateCategoryInput) {
    const data: Prisma.ticket_categoriesUncheckedCreateInput = {
      name: input.name,
      description: input.description ?? null,
      price: new Prisma.Decimal(input.price),
      quota: input.quota,
      valid_from: new Date(input.validFrom),
      valid_until: new Date(input.validUntil),
      is_active: input.isActive,
      sort_order: input.sortOrder,
    };
    return this.categories.create(data);
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    await this.getCategory(id);
    const data: Prisma.ticket_categoriesUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.quota !== undefined) data.quota = input.quota;
    if (input.validFrom !== undefined) data.valid_from = new Date(input.validFrom);
    if (input.validUntil !== undefined) data.valid_until = new Date(input.validUntil);
    if (input.isActive !== undefined) data.is_active = input.isActive;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;
    return this.categories.update(id, data);
  }

  async deactivateCategory(id: string) {
    await this.getCategory(id);
    return this.categories.update(id, { is_active: false });
  }

  // ---- Tickets (user) ----
  listMyTickets(userId: string) {
    return this.tickets.findManyByUser(userId);
  }

  /**
   * Reservasi kuota + buat tiket (transaksi, advisory lock per kategori),
   * lalu buat pembayaran dummy.
   */
  async buyTicket(input: BuyTicketInput) {
    const ticket = await prisma.$transaction(
      async (tx) => {
        await this.categories.acquireLock(input.categoryId, tx);

        const cat = await this.categories.findById(input.categoryId, tx);
        if (!cat) throw AppError.notFound('Kategori tiket tidak ditemukan');
        if (!cat.is_active) throw AppError.unprocessable('Kategori tiket tidak aktif');

        const todayStr = new Date().toISOString().slice(0, 10);
        if (cat.valid_until.toISOString().slice(0, 10) < todayStr) {
          throw AppError.unprocessable('Kategori tiket sudah tidak berlaku');
        }

        const newSold = cat.sold_count + input.quantity;
        if (newSold > cat.quota) {
          throw AppError.unprocessable(
            `Kuota tidak mencukupi (tersisa ${cat.quota - cat.sold_count})`
          );
        }

        const unit = new Prisma.Decimal(cat.price);
        // Tiket berlaku sampai akhir hari valid_until.
        const expiredAt = new Date(`${cat.valid_until.toISOString().slice(0, 10)}T23:59:59.000Z`);

        const created = await this.tickets.create(
          {
            user_id: input.userId,
            category_id: input.categoryId,
            quantity: input.quantity,
            unit_price: unit,
            total_price: unit.mul(input.quantity),
            qr_code: `HTM-${randomUUID()}`,
            status: 'active',
            expired_at: expiredAt,
          },
          tx
        );

        await this.categories.update(input.categoryId, { sold_count: newSold }, tx);
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    const payment = await this.payments.createPayment({
      userId: input.userId,
      items: [
        {
          itemType: 'ticket',
          itemId: ticket.id,
          itemName: `Tiket HTM x${ticket.quantity}`,
          quantity: ticket.quantity,
          unitPrice: ticket.unit_price.toNumber(),
        },
      ],
    });

    return { ticket, payment };
  }

  async cancelTicket(input: CancelTicketInput) {
    const ticket = await this.tickets.findById(input.id);
    if (!ticket) throw AppError.notFound('Tiket tidak ditemukan');
    if (ticket.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan tiket ini');
    }
    if (ticket.status !== 'active') {
      throw AppError.unprocessable(`Tiket berstatus "${ticket.status}" tidak bisa dibatalkan`);
    }

    return prisma.$transaction(async (tx) => {
      await this.tickets.update(ticket.id, { status: 'cancelled' }, tx);
      const cat = await this.categories.findById(ticket.category_id, tx);
      if (cat) {
        const newSold = Math.max(0, cat.sold_count - ticket.quantity);
        await this.categories.update(cat.id, { sold_count: newSold }, tx);
      }
      return this.tickets.findById(ticket.id, tx);
    });
  }

  /** Scan tiket di pintu masuk (staff/admin). Tiket → used + catat log. */
  async scanTicket(input: ScanTicketInput) {
    const ticket = await this.tickets.findByQr(input.qrCode);
    if (!ticket) throw AppError.notFound('Tiket tidak ditemukan');
    if (ticket.status !== 'active') {
      throw AppError.unprocessable(`Tiket tidak valid (status "${ticket.status}")`);
    }
    if (ticket.expired_at && ticket.expired_at.getTime() < Date.now()) {
      throw AppError.unprocessable('Tiket sudah kadaluarsa');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await this.tickets.update(ticket.id, { status: 'used' }, tx);
      const usage = await this.usages.create(
        {
          ticket_id: ticket.id,
          scanned_by: input.scannedBy,
          location: input.location ?? null,
          notes: input.notes ?? null,
        },
        tx
      );
      return { ticket: updated, usage };
    });
  }
}

export const ticketService = new TicketService();
