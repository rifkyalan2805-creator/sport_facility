import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PoolTicketTypeRepository {
  listActive(db: DbClient = prisma) {
    return db.pool_ticket_types.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.pool_ticket_types.findUnique({ where: { id } });
  }

  findActiveById(id: string, db: DbClient = prisma) {
    return db.pool_ticket_types.findFirst({ where: { id, is_active: true } });
  }

  create(data: Prisma.pool_ticket_typesUncheckedCreateInput, db: DbClient = prisma) {
    return db.pool_ticket_types.create({ data });
  }

  update(
    id: string,
    data: Prisma.pool_ticket_typesUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.pool_ticket_types.update({ where: { id }, data });
  }
}

export const poolTicketTypeRepository = new PoolTicketTypeRepository();
