import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PointsTransactionRepository {
  create(data: Prisma.points_transactionsUncheckedCreateInput, db: DbClient = prisma) {
    return db.points_transactions.create({ data });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.points_transactions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }
}

export const pointsTransactionRepository = new PointsTransactionRepository();
