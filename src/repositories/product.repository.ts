import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class ProductRepository {
  listActive(db: DbClient = prisma) {
    return db.products.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      include: { product_categories: { select: { name: true } } },
    });
  }

  listAll(db: DbClient = prisma) {
    return db.products.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.products.findUnique({ where: { id } });
  }

  create(data: Prisma.productsUncheckedCreateInput, db: DbClient = prisma) {
    return db.products.create({ data });
  }

  update(id: string, data: Prisma.productsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.products.update({ where: { id }, data });
  }
}

export const productRepository = new ProductRepository();
