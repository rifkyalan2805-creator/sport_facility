import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class PoolSessionRepository {
  /** Sesi yang akan datang & masih open (publik). */
  listUpcoming(db: DbClient = prisma) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    return db.pool_sessions.findMany({
      where: { session_date: { gte: today }, status: 'open' },
      orderBy: [{ session_date: 'asc' }, { start_time: 'asc' }],
    });
  }

  listAll(db: DbClient = prisma) {
    return db.pool_sessions.findMany({
      orderBy: [{ session_date: 'desc' }, { start_time: 'asc' }],
    });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.pool_sessions.findUnique({ where: { id } });
  }

  create(data: Prisma.pool_sessionsUncheckedCreateInput, db: DbClient = prisma) {
    return db.pool_sessions.create({ data });
  }

  update(id: string, data: Prisma.pool_sessionsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.pool_sessions.update({ where: { id }, data });
  }

  /** Advisory lock per sesi — serialkan pembelian agar kuota tidak oversell. */
  async acquireLock(sessionId: string, db: DbClient) {
    await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${sessionId}))`;
  }
}

export const poolSessionRepository = new PoolSessionRepository();
