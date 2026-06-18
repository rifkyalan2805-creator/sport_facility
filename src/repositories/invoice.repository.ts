import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class InvoiceRepository {
  /** Hitung invoice yang sudah ada dengan prefix tertentu (untuk nomor urut). */
  countWithPrefix(prefix: string, db: DbClient = prisma) {
    return db.invoices.count({
      where: { invoice_number: { startsWith: prefix } },
    });
  }

  create(data: Prisma.invoicesUncheckedCreateInput, db: DbClient = prisma) {
    return db.invoices.create({ data });
  }

  findByPaymentId(paymentId: string, db: DbClient = prisma) {
    return db.invoices.findUnique({ where: { payment_id: paymentId } });
  }
}

export const invoiceRepository = new InvoiceRepository();
