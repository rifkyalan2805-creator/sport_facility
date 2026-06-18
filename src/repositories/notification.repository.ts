import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class NotificationRepository {
  create(data: Prisma.notificationsUncheckedCreateInput, db: DbClient = prisma) {
    return db.notifications.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.notifications.findUnique({ where: { id } });
  }

  findManyByUser(userId: string, unreadOnly: boolean, db: DbClient = prisma) {
    return db.notifications.findMany({
      where: { user_id: userId, ...(unreadOnly ? { is_read: false } : {}) },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  update(id: string, data: Prisma.notificationsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.notifications.update({ where: { id }, data });
  }

  markAllRead(userId: string, db: DbClient = prisma) {
    return db.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
  }
}

export const notificationRepository = new NotificationRepository();
