import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PushTokenRepository {
  findByToken(token: string, db: DbClient = prisma) {
    return db.push_tokens.findUnique({ where: { token } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.push_tokens.findUnique({ where: { id } });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.push_tokens.findMany({ where: { user_id: userId, is_active: true } });
  }

  create(data: Prisma.push_tokensUncheckedCreateInput, db: DbClient = prisma) {
    return db.push_tokens.create({ data });
  }

  update(id: string, data: Prisma.push_tokensUncheckedUpdateInput, db: DbClient = prisma) {
    return db.push_tokens.update({ where: { id }, data });
  }
}

export const pushTokenRepository = new PushTokenRepository();
