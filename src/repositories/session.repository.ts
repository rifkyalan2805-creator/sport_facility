import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class SessionRepository {
  create(data: Prisma.sessionsUncheckedCreateInput, db: DbClient = prisma) {
    return db.sessions.create({ data });
  }

  /** Cari session berdasarkan hash refresh token, sertakan user. */
  findByTokenHash(tokenHash: string, db: DbClient = prisma) {
    return db.sessions.findUnique({
      where: { refresh_token: tokenHash },
      include: { users: true },
    });
  }

  revoke(id: string, db: DbClient = prisma) {
    return db.sessions.update({ where: { id }, data: { is_revoked: true } });
  }

  revokeAllForUser(userId: string, db: DbClient = prisma) {
    return db.sessions.updateMany({
      where: { user_id: userId, is_revoked: false },
      data: { is_revoked: true },
    });
  }
}

export const sessionRepository = new SessionRepository();
