import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';
import { ExpiryGroup, expiryGroupWhere } from '../utils/expiry';

/** Opsi daftar abonemen berjalan untuk panel admin. */
export interface ListAbonemenOptions {
  group?: ExpiryGroup;
  status?: string;
  /** Cari pada nama panggilan, nama lengkap, email, atau nama paket. */
  search?: string;
  page: number;
  limit: number;
}

/**
 * UserAbonemenRepository — query tabel user_abonemen.
 */
export class UserAbonemenRepository {
  findById(id: string, db: DbClient = prisma) {
    return db.user_abonemen.findUnique({ where: { id } });
  }

  /**
   * Daftar abonemen yang sudah berjalan (hasil approval registrasi),
   * lengkap dengan pemilik akun + paketnya. Untuk reception & manajemen.
   */
  async listForAdmin(opts: ListAbonemenOptions, db: DbClient = prisma) {
    const and: Prisma.user_abonemenWhereInput[] = [];

    if (opts.group) {
      and.push(expiryGroupWhere(opts.group) as Prisma.user_abonemenWhereInput);
    }
    if (opts.status) {
      and.push({ status: opts.status as Prisma.Enumabonemen_statusFilter['equals'] });
    }
    if (opts.search) {
      const contains = opts.search;
      and.push({
        OR: [
          { users: { nickname: { contains, mode: 'insensitive' } } },
          { users: { full_name: { contains, mode: 'insensitive' } } },
          { users: { email: { contains, mode: 'insensitive' } } },
          { abonemen_packages: { name: { contains, mode: 'insensitive' } } },
        ],
      });
    }

    const where: Prisma.user_abonemenWhereInput = and.length ? { AND: and } : {};

    const [data, total] = await Promise.all([
      db.user_abonemen.findMany({
        where,
        // Yang paling dekat berakhir tampil lebih dulu.
        orderBy: [{ end_date: 'asc' }, { created_at: 'desc' }],
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        include: {
          users: {
            select: { id: true, nickname: true, full_name: true, email: true, phone: true },
          },
          abonemen_packages: {
            select: {
              id: true,
              name: true,
              price: true,
              sessions_per_week: true,
              duration_weeks: true,
            },
          },
        },
      }),
      db.user_abonemen.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Abonemen milik satu user, untuk dashboard pengunjung.
   * Tanpa paginasi — seorang member hanya punya segelintir baris.
   */
  listForUser(userId: string, db: DbClient = prisma) {
    return db.user_abonemen.findMany({
      where: { user_id: userId },
      // Yang masih berjalan (berakhir paling belakang) tampil lebih dulu.
      orderBy: [{ end_date: 'desc' }, { created_at: 'desc' }],
      include: {
        abonemen_packages: {
          select: {
            id: true,
            name: true,
            price: true,
            sessions_per_week: true,
            duration_weeks: true,
          },
        },
      },
    });
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
