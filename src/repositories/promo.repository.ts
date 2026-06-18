import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PromoRepository {
  findByCode(code: string, db: DbClient = prisma) {
    return db.promos.findUnique({ where: { code } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.promos.findUnique({ where: { id } });
  }

  listAll(db: DbClient = prisma) {
    return db.promos.findMany({ orderBy: { created_at: 'desc' } });
  }

  create(data: Prisma.promosUncheckedCreateInput, db: DbClient = prisma) {
    return db.promos.create({ data });
  }

  update(id: string, data: Prisma.promosUncheckedUpdateInput, db: DbClient = prisma) {
    return db.promos.update({ where: { id }, data });
  }

  incrementUsed(id: string, db: DbClient = prisma) {
    return db.promos.update({ where: { id }, data: { used_count: { increment: 1 } } });
  }
}

export const promoRepository = new PromoRepository();
