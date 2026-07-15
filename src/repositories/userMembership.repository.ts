import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

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
