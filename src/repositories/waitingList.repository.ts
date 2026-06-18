import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class WaitingListRepository {
  create(data: Prisma.waiting_listUncheckedCreateInput, db: DbClient = prisma) {
    return db.waiting_list.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.waiting_list.findUnique({ where: { id } });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.waiting_list.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { courts: { select: { name: true, code: true } } },
    });
  }

  update(id: string, data: Prisma.waiting_listUncheckedUpdateInput, db: DbClient = prisma) {
    return db.waiting_list.update({ where: { id }, data });
  }
}

export const waitingListRepository = new WaitingListRepository();
