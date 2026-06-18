import { prisma, DbClient } from '../config/prisma';

/**
 * UserAbonemenRepository — query tabel user_abonemen.
 */
export class UserAbonemenRepository {
  findById(id: string, db: DbClient = prisma) {
    return db.user_abonemen.findUnique({ where: { id } });
  }

  /** Kurangi remaining_sessions secara atomik (dipanggil dalam transaksi). */
  decrementRemaining(id: string, db: DbClient = prisma) {
    return db.user_abonemen.update({
      where: { id },
      data: { remaining_sessions: { decrement: 1 } },
    });
  }
}

export const userAbonemenRepository = new UserAbonemenRepository();
