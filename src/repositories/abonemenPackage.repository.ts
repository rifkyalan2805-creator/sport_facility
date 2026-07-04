import { prisma, DbClient } from '../config/prisma';

/**
 * AbonemenPackageRepository — query paket abonemen (abonemen_packages).
 * Query-only, tanpa business logic.
 */
export class AbonemenPackageRepository {
  /** Daftar paket aktif (untuk dropdown registrasi & tampilan publik). */
  listActive(db: DbClient = prisma) {
    return db.abonemen_packages.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.abonemen_packages.findUnique({ where: { id } });
  }
}

export const abonemenPackageRepository = new AbonemenPackageRepository();
