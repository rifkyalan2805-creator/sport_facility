import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class MembershipPlanRepository {
  listActive(db: DbClient = prisma) {
    return db.membership_plans.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  listAll(db: DbClient = prisma) {
    return db.membership_plans.findMany({ orderBy: { sort_order: 'asc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.membership_plans.findUnique({ where: { id } });
  }

  findActiveById(id: string, db: DbClient = prisma) {
    return db.membership_plans.findFirst({ where: { id, is_active: true } });
  }

  create(data: Prisma.membership_plansUncheckedCreateInput, db: DbClient = prisma) {
    return db.membership_plans.create({ data });
  }

  update(
    id: string,
    data: Prisma.membership_plansUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.membership_plans.update({ where: { id }, data });
  }
}

export const membershipPlanRepository = new MembershipPlanRepository();
