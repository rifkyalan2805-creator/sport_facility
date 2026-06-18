import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PoolTicketRepository {
  create(data: Prisma.pool_ticketsUncheckedCreateInput, db: DbClient = prisma) {
    return db.pool_tickets.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.pool_tickets.findUnique({ where: { id } });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.pool_tickets.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        pool_sessions: { select: { name: true, session_date: true } },
        pool_ticket_types: { select: { name: true } },
      },
    });
  }

  update(id: string, data: Prisma.pool_ticketsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.pool_tickets.update({ where: { id }, data });
  }
}

export const poolTicketRepository = new PoolTicketRepository();
