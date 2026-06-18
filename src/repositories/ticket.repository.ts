import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class TicketRepository {
  create(data: Prisma.ticketsUncheckedCreateInput, db: DbClient = prisma) {
    return db.tickets.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.tickets.findUnique({ where: { id } });
  }

  findByQr(qrCode: string, db: DbClient = prisma) {
    return db.tickets.findUnique({ where: { qr_code: qrCode } });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.tickets.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { ticket_categories: { select: { name: true } } },
    });
  }

  update(id: string, data: Prisma.ticketsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.tickets.update({ where: { id }, data });
  }
}

export const ticketRepository = new TicketRepository();
