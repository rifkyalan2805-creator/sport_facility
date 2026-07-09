import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';
import { ListPaymentFilter } from '../types/payment.types';

const detailInclude = {
  payment_items: true,
  invoices: true,
  payment_methods: { select: { name: true, code: true, type: true } },
  users: { select: { full_name: true, email: true } },
} satisfies Prisma.paymentsInclude;

/**
 * PaymentRepository — HANYA query DB. Tidak ada aturan bisnis di sini.
 */
export class PaymentRepository {
  create(data: Prisma.paymentsUncheckedCreateInput, db: DbClient = prisma) {
    return db.payments.create({ data, include: detailInclude });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.payments.findUnique({ where: { id }, include: detailInclude });
  }

  findByIdempotencyKey(key: string, db: DbClient = prisma) {
    return db.payments.findUnique({
      where: { idempotency_key: key },
      include: detailInclude,
    });
  }

  async findMany(filter: ListPaymentFilter, db: DbClient = prisma) {
    const where: Prisma.paymentsWhereInput = {
      ...(filter.userId ? { user_id: filter.userId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [data, total] = await Promise.all([
      db.payments.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: detailInclude,
      }),
      db.payments.count({ where }),
    ]);

    return { data, total };
  }

  update(id: string, data: Prisma.paymentsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.payments.update({ where: { id }, data, include: detailInclude });
  }
}

export const paymentRepository = new PaymentRepository();
