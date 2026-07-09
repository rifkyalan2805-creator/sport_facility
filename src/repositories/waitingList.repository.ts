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

  /** Semua antrean (admin) — filter opsional court/tanggal, sertakan pemilik. */
  listAll(filters: { courtId?: string; date?: string }, db: DbClient = prisma) {
    return db.waiting_list.findMany({
      where: {
        ...(filters.courtId ? { court_id: filters.courtId } : {}),
        ...(filters.date ? { preferred_date: new Date(filters.date) } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: {
        courts: { select: { name: true, code: true } },
        users: { select: { full_name: true, email: true } },
      },
    });
  }

  /** Antrean 'waiting' tertua yang overlap slot yang baru bebas (untuk auto-promote). */
  async findEarliestWaiting(
    courtId: string,
    date: string,
    start: string,
    end: string,
    db: DbClient = prisma
  ): Promise<{ id: string } | null> {
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM waiting_list
      WHERE court_id = ${courtId}::uuid
        AND preferred_date = ${date}::date
        AND status = 'waiting'
        AND preferred_start < ${end}::time
        AND preferred_end   > ${start}::time
      ORDER BY created_at ASC
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  /** Tandai antrean 'notified' yang sudah lewat expired_at → 'expired' (lazy). */
  expireStale(db: DbClient = prisma) {
    return db.waiting_list.updateMany({
      where: { status: 'notified', expired_at: { lt: new Date() } },
      data: { status: 'expired' },
    });
  }

  update(id: string, data: Prisma.waiting_listUncheckedUpdateInput, db: DbClient = prisma) {
    return db.waiting_list.update({ where: { id }, data });
  }
}

export const waitingListRepository = new WaitingListRepository();
