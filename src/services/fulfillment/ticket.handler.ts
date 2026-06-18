import { Prisma } from '@prisma/client';
import { TicketRepository, ticketRepository } from '../../repositories/ticket.repository';
import {
  TicketCategoryRepository,
  ticketCategoryRepository,
} from '../../repositories/ticketCategory.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

/**
 * Tiket HTM: saat lunas → tidak ada aksi (tiket sudah active).
 * Saat gagal → batalkan tiket & kembalikan kuota kategori.
 */
export class TicketFulfillmentHandler implements FulfillmentHandler {
  readonly itemType = 'ticket' as const;

  constructor(
    private readonly tickets: TicketRepository = ticketRepository,
    private readonly categories: TicketCategoryRepository = ticketCategoryRepository
  ) {}

  async onPaid(): Promise<void> {
    // Tidak ada aksi.
  }

  async onFailed(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const ticket = await this.tickets.findById(item.itemId, tx);
    if (!ticket || ticket.status !== 'active') return;

    await this.tickets.update(ticket.id, { status: 'cancelled' }, tx);

    const category = await this.categories.findById(ticket.category_id, tx);
    if (category) {
      const newSold = Math.max(0, category.sold_count - ticket.quantity);
      await this.categories.update(category.id, { sold_count: newSold }, tx);
    }
  }
}
