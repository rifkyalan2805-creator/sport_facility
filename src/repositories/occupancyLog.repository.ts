import { prisma, DbClient } from '../config/prisma';

export class OccupancyLogRepository {
  upsert(
    courtId: string,
    logDate: Date,
    hourSlot: number,
    data: { is_occupied: boolean; booking_id: string | null },
    db: DbClient = prisma
  ) {
    return db.occupancy_logs.upsert({
      where: {
        court_id_log_date_hour_slot: { court_id: courtId, log_date: logDate, hour_slot: hourSlot },
      },
      create: { court_id: courtId, log_date: logDate, hour_slot: hourSlot, ...data },
      update: data,
    });
  }

  listByCourtDate(courtId: string, logDate: Date, db: DbClient = prisma) {
    return db.occupancy_logs.findMany({
      where: { court_id: courtId, log_date: logDate },
      orderBy: { hour_slot: 'asc' },
    });
  }
}

export const occupancyLogRepository = new OccupancyLogRepository();
