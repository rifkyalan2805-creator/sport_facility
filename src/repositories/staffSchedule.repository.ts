import { prisma, DbClient } from '../config/prisma';

export class StaffScheduleRepository {
  listByStaff(staffId: string, db: DbClient = prisma) {
    return db.staff_schedules.findMany({
      where: { staff_id: staffId },
      orderBy: { work_date: 'asc' },
    });
  }

  upsert(
    staffId: string,
    workDate: Date,
    data: { shift_start: Date; shift_end: Date; notes: string | null },
    db: DbClient = prisma
  ) {
    return db.staff_schedules.upsert({
      where: { staff_id_work_date: { staff_id: staffId, work_date: workDate } },
      create: { staff_id: staffId, work_date: workDate, ...data },
      update: data,
    });
  }
}

export const staffScheduleRepository = new StaffScheduleRepository();
