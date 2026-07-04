import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';
import { ListRegistrationFilter } from '../types/abonemenRegistration.types';

// Paket kecil untuk ditampilkan bersama pengajuan.
const packageSelect = { select: { id: true, name: true, price: true } } as const;

/**
 * AbonemenRegistrationRepository — HANYA query DB (tanpa aturan bisnis).
 */
export class AbonemenRegistrationRepository {
  create(data: Prisma.abonemen_registrationsUncheckedCreateInput, db: DbClient = prisma) {
    return db.abonemen_registrations.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.abonemen_registrations.findUnique({
      where: { id },
      include: { abonemen_packages: packageSelect },
    });
  }

  /** Pengajuan milik satu user (terbaru dulu). */
  findByUser(userId: string, db: DbClient = prisma) {
    return db.abonemen_registrations.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { abonemen_packages: packageSelect },
    });
  }

  /** Pengajuan aktif (pending/approved) user untuk sebuah paket — cek duplikat. */
  findActiveByUserAndPackage(userId: string, packageId: string, db: DbClient = prisma) {
    return db.abonemen_registrations.findFirst({
      where: { user_id: userId, package_id: packageId, status: { in: ['pending', 'approved'] } },
    });
  }

  /** Ada minimal satu registrasi approved untuk user (dipakai gating booking di 3c). */
  findApprovedForUser(userId: string, db: DbClient = prisma) {
    return db.abonemen_registrations.findFirst({
      where: { user_id: userId, status: 'approved' },
    });
  }

  /** List untuk admin dengan paginasi + filter status. */
  async findMany(filter: ListRegistrationFilter, db: DbClient = prisma) {
    const where: Prisma.abonemen_registrationsWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [data, total] = await Promise.all([
      db.abonemen_registrations.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { abonemen_packages: packageSelect },
      }),
      db.abonemen_registrations.count({ where }),
    ]);

    return { data, total };
  }

  updateStatus(
    id: string,
    data: Prisma.abonemen_registrationsUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.abonemen_registrations.update({ where: { id }, data });
  }
}

export const abonemenRegistrationRepository = new AbonemenRegistrationRepository();
