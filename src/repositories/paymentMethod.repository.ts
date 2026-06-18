import { prisma, DbClient } from '../config/prisma';

export class PaymentMethodRepository {
  findActiveById(id: string, db: DbClient = prisma) {
    return db.payment_methods.findFirst({ where: { id, is_active: true } });
  }

  listActive(db: DbClient = prisma) {
    return db.payment_methods.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }
}

export const paymentMethodRepository = new PaymentMethodRepository();
