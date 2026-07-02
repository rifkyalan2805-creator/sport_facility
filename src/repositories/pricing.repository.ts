import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

/**
 * PricingRepository — query harga per-sport (tennis_prices & padel_prices).
 * Query-only, tanpa business logic.
 */
export class PricingRepository {
  // ---- Tennis ----
  listTennis(db: DbClient = prisma) {
    return db.tennis_prices.findMany({ orderBy: { sort_order: 'asc' } });
  }
  findTennis(id: string, db: DbClient = prisma) {
    return db.tennis_prices.findUnique({ where: { id } });
  }
  createTennis(data: Prisma.tennis_pricesUncheckedCreateInput, db: DbClient = prisma) {
    return db.tennis_prices.create({ data });
  }
  updateTennis(id: string, data: Prisma.tennis_pricesUncheckedUpdateInput, db: DbClient = prisma) {
    return db.tennis_prices.update({ where: { id }, data });
  }
  deleteTennis(id: string, db: DbClient = prisma) {
    return db.tennis_prices.delete({ where: { id } });
  }

  // ---- Padel ----
  listPadel(db: DbClient = prisma) {
    return db.padel_prices.findMany({ orderBy: { sort_order: 'asc' } });
  }
  findPadel(id: string, db: DbClient = prisma) {
    return db.padel_prices.findUnique({ where: { id } });
  }
  createPadel(data: Prisma.padel_pricesUncheckedCreateInput, db: DbClient = prisma) {
    return db.padel_prices.create({ data });
  }
  updatePadel(id: string, data: Prisma.padel_pricesUncheckedUpdateInput, db: DbClient = prisma) {
    return db.padel_prices.update({ where: { id }, data });
  }
  deletePadel(id: string, db: DbClient = prisma) {
    return db.padel_prices.delete({ where: { id } });
  }
}

export const pricingRepository = new PricingRepository();
