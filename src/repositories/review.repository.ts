import { Prisma, item_type } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class ReviewRepository {
  create(data: Prisma.reviewsUncheckedCreateInput, db: DbClient = prisma) {
    return db.reviews.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.reviews.findUnique({ where: { id } });
  }

  findByUserItem(userId: string, itemType: item_type, itemId: string, db: DbClient = prisma) {
    return db.reviews.findUnique({
      where: {
        user_id_item_type_item_id: { user_id: userId, item_type: itemType, item_id: itemId },
      },
    });
  }

  listPublishedByItem(itemType: item_type, itemId: string, db: DbClient = prisma) {
    return db.reviews.findMany({
      where: { item_type: itemType, item_id: itemId, is_published: true },
      orderBy: { created_at: 'desc' },
    });
  }

  update(id: string, data: Prisma.reviewsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.reviews.update({ where: { id }, data });
  }

  delete(id: string, db: DbClient = prisma) {
    return db.reviews.delete({ where: { id } });
  }
}

export const reviewRepository = new ReviewRepository();
