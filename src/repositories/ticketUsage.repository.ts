import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class TicketUsageRepository {
  create(data: Prisma.ticket_usageUncheckedCreateInput, db: DbClient = prisma) {
    return db.ticket_usage.create({ data });
  }

  findManyByTicket(ticketId: string, db: DbClient = prisma) {
    return db.ticket_usage.findMany({
      where: { ticket_id: ticketId },
      orderBy: { used_at: 'desc' },
    });
  }
}

export const ticketUsageRepository = new TicketUsageRepository();
