import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class LoyaltyPointsRepository {
  findByUser(userId: string, db: DbClient = prisma) {
    return db.loyalty_points.findUnique({ where: { user_id: userId } });
  }

  create(data: Prisma.loyalty_pointsUncheckedCreateInput, db: DbClient = prisma) {
    return db.loyalty_points.create({ data });
  }

  update(
    id: string,
    data: Prisma.loyalty_pointsUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.loyalty_points.update({ where: { id }, data });
  }
}

export const loyaltyPointsRepository = new LoyaltyPointsRepository();
