import { Prisma } from '@prisma/client';
import {
  PoolTicketRepository,
  poolTicketRepository,
} from '../../repositories/poolTicket.repository';
import {
  PoolSessionRepository,
  poolSessionRepository,
} from '../../repositories/poolSession.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

/**
 * Tiket kolam: saat lunas → tidak ada aksi (tiket sudah active = kursi dipesan).
 * Saat gagal → batalkan tiket & kembalikan kuota sesi.
 */
export class PoolTicketFulfillmentHandler implements FulfillmentHandler {
  readonly itemType = 'pool_ticket' as const;

  constructor(
    private readonly poolTickets: PoolTicketRepository = poolTicketRepository,
    private readonly poolSessions: PoolSessionRepository = poolSessionRepository
  ) {}

  async onPaid(): Promise<void> {
    // Tidak ada aksi.
  }

  async onFailed(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const ticket = await this.poolTickets.findById(item.itemId, tx);
    if (!ticket || ticket.status !== 'active') return;

    await this.poolTickets.update(
      ticket.id,
      { status: 'cancelled', cancelled_at: new Date() },
      tx
    );

    const session = await this.poolSessions.findById(ticket.session_id, tx);
    if (session) {
      const newCount = Math.max(0, session.booked_count - ticket.quantity);
      await this.poolSessions.update(
        session.id,
        {
          booked_count: newCount,
          status: session.status === 'full' ? 'open' : session.status,
        },
        tx
      );
    }
  }
}
