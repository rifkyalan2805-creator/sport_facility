import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';
import { ExpiryGroup, expiryGroupWhere } from '../utils/expiry';

/** Opsi daftar member kolam untuk panel admin. */
export interface ListMembershipsOptions {
  group?: ExpiryGroup;
  status?: string;
  /** Cari pada nama panggilan, nama lengkap, email, atau nomor kartu. */
  search?: string;
  page: number;
  limit: number;
}

export class UserMembershipRepository {
  create(data: Prisma.user_membershipsUncheckedCreateInput, db: DbClient = prisma) {
    return db.user_memberships.create({ data, include: { membership_plans: true } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.user_memberships.findUnique({ where: { id } });
  }

  findByIdWithPlan(id: string, db: DbClient = prisma) {
    return db.user_memberships.findUnique({
      where: { id },
      include: { membership_plans: true },
    });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.user_memberships.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { membership_plans: { select: { name: true, slug: true } } },
    });
  }

  /** Membership yang masih aktif atau menunggu pembayaran. */
  findActiveOrPending(userId: string, db: DbClient = prisma) {
    return db.user_memberships.findFirst({
      where: { user_id: userId, status: { in: ['active', 'pending'] } },
    });
  }

  /**
   * Daftar seluruh member kolam untuk panel admin (reception & manajemen),
   * lengkap dengan pemilik akun + paketnya. Penyaringan kelompok warna
   * dilakukan di database agar paginasi tetap konsisten.
   */
  async listForAdmin(opts: ListMembershipsOptions, db: DbClient = prisma) {
    const and: Prisma.user_membershipsWhereInput[] = [];

    if (opts.group) {
      and.push(expiryGroupWhere(opts.group) as Prisma.user_membershipsWhereInput);
    }
    if (opts.status) {
      and.push({ status: opts.status as Prisma.Enummembership_statusFilter['equals'] });
    }
    if (opts.search) {
      const contains = opts.search;
      and.push({
        OR: [
          { member_name: { contains, mode: 'insensitive' } },
          { card_number: { contains, mode: 'insensitive' } },
          { users: { nickname: { contains, mode: 'insensitive' } } },
          { users: { full_name: { contains, mode: 'insensitive' } } },
          { users: { email: { contains, mode: 'insensitive' } } },
        ],
      });
    }

    const where: Prisma.user_membershipsWhereInput = and.length ? { AND: and } : {};

    const [data, total] = await Promise.all([
      db.user_memberships.findMany({
        where,
        // Yang paling dekat jatuh tempo tampil lebih dulu.
        orderBy: [{ end_date: 'asc' }, { created_at: 'desc' }],
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        include: {
          users: {
            select: { id: true, nickname: true, full_name: true, email: true, phone: true },
          },
          membership_plans: { select: { id: true, name: true, slug: true, price: true } },
        },
      }),
      db.user_memberships.count({ where }),
    ]);

    return { data, total };
  }

  /** Cek keunikan nomor kartu (dipakai saat generate card_number). */
  findByCardNumber(cardNumber: string, db: DbClient = prisma) {
    return db.user_memberships.findFirst({ where: { card_number: cardNumber } });
  }

  update(
    id: string,
    data: Prisma.user_membershipsUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.user_memberships.update({ where: { id }, data });
  }
}

export const userMembershipRepository = new UserMembershipRepository();
