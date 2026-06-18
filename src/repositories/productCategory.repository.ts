import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class ProductCategoryRepository {
  listAll(db: DbClient = prisma) {
    return db.product_categories.findMany({ orderBy: { sort_order: 'asc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.product_categories.findUnique({ where: { id } });
  }

  create(data: Prisma.product_categoriesUncheckedCreateInput, db: DbClient = prisma) {
    return db.product_categories.create({ data });
  }

  update(
    id: string,
    data: Prisma.product_categoriesUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.product_categories.update({ where: { id }, data });
  }
}

export const productCategoryRepository = new ProductCategoryRepository();
