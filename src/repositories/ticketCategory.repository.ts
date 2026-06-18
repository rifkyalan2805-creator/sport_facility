import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class TicketCategoryRepository {
  listActive(db: DbClient = prisma) {
    return db.ticket_categories.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  listAll(db: DbClient = prisma) {
    return db.ticket_categories.findMany({ orderBy: { sort_order: 'asc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.ticket_categories.findUnique({ where: { id } });
  }

  create(data: Prisma.ticket_categoriesUncheckedCreateInput, db: DbClient = prisma) {
    return db.ticket_categories.create({ data });
  }

  update(
    id: string,
    data: Prisma.ticket_categoriesUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.ticket_categories.update({ where: { id }, data });
  }

  /** Advisory lock per kategori — serialkan penjualan agar kuota tidak oversell. */
  async acquireLock(categoryId: string, db: DbClient) {
    await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${categoryId}))`;
  }
}

export const ticketCategoryRepository = new TicketCategoryRepository();
