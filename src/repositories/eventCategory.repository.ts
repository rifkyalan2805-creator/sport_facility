import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class EventCategoryRepository {
  listAll(db: DbClient = prisma) {
    return db.event_categories.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.event_categories.findUnique({ where: { id } });
  }

  create(data: Prisma.event_categoriesUncheckedCreateInput, db: DbClient = prisma) {
    return db.event_categories.create({ data });
  }

  update(
    id: string,
    data: Prisma.event_categoriesUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.event_categories.update({ where: { id }, data });
  }
}

export const eventCategoryRepository = new EventCategoryRepository();
