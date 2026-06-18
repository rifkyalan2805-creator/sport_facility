import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

/**
 * CourtRepository — HANYA query ke tabel courts & court_schedules.
 * Tidak ada business logic di sini.
 */
export class CourtRepository {
  // ---- READ (dipakai juga oleh modul Booking) ----
  findActiveById(id: string, db: DbClient = prisma) {
    return db.courts.findFirst({ where: { id, is_active: true } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.courts.findUnique({ where: { id } });
  }

  /** Jadwal operasional court untuk hari tertentu (0=Minggu .. 6=Sabtu). */
  findScheduleForDay(courtId: string, dayOfWeek: number, db: DbClient = prisma) {
    return db.court_schedules.findUnique({
      where: { court_id_day_of_week: { court_id: courtId, day_of_week: dayOfWeek } },
    });
  }

  listActive(db: DbClient = prisma) {
    return db.courts.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  listAll(db: DbClient = prisma) {
    return db.courts.findMany({ orderBy: { sort_order: 'asc' } });
  }

  // ---- WRITE (admin) ----
  create(data: Prisma.courtsUncheckedCreateInput, db: DbClient = prisma) {
    return db.courts.create({ data });
  }

  update(id: string, data: Prisma.courtsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.courts.update({ where: { id }, data });
  }

  // ---- SCHEDULES ----
  listSchedules(courtId: string, db: DbClient = prisma) {
    return db.court_schedules.findMany({
      where: { court_id: courtId },
      orderBy: { day_of_week: 'asc' },
    });
  }

  findScheduleById(id: string, db: DbClient = prisma) {
    return db.court_schedules.findUnique({ where: { id } });
  }

  /** Upsert berdasarkan UNIQUE(court_id, day_of_week). */
  upsertSchedule(
    courtId: string,
    dayOfWeek: number,
    data: { open_time: Date; close_time: Date; is_holiday_closed: boolean },
    db: DbClient = prisma
  ) {
    return db.court_schedules.upsert({
      where: { court_id_day_of_week: { court_id: courtId, day_of_week: dayOfWeek } },
      create: { court_id: courtId, day_of_week: dayOfWeek, ...data },
      update: data,
    });
  }

  deleteSchedule(id: string, db: DbClient = prisma) {
    return db.court_schedules.delete({ where: { id } });
  }
}

export const courtRepository = new CourtRepository();
