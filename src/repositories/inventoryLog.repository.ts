import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class InventoryLogRepository {
  create(data: Prisma.inventory_logsUncheckedCreateInput, db: DbClient = prisma) {
    return db.inventory_logs.create({ data });
  }

  listByProduct(productId: string, db: DbClient = prisma) {
    return db.inventory_logs.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }
}

export const inventoryLogRepository = new InventoryLogRepository();
