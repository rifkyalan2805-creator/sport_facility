import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class EventRepository {
  /** Event yang published & belum lewat (publik). */
  listPublished(db: DbClient = prisma) {
    return db.events.findMany({
      where: { status: 'published', event_date: { gte: new Date() } },
      orderBy: { event_date: 'asc' },
      include: { event_categories: { select: { name: true, slug: true, color: true } } },
    });
  }

  listAll(db: DbClient = prisma) {
    return db.events.findMany({ orderBy: { event_date: 'desc' } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.events.findUnique({ where: { id } });
  }

  create(data: Prisma.eventsUncheckedCreateInput, db: DbClient = prisma) {
    return db.events.create({ data });
  }

  update(id: string, data: Prisma.eventsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.events.update({ where: { id }, data });
  }

  /** Advisory lock per event — serialkan registrasi agar kuota tidak oversell. */
  async acquireLock(eventId: string, db: DbClient) {
    await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${eventId}))`;
  }
}

export const eventRepository = new EventRepository();
