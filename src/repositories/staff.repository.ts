import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class StaffRepository {
  findById(id: string, db: DbClient = prisma) {
    return db.staff.findUnique({ where: { id } });
  }

  findByUserId(userId: string, db: DbClient = prisma) {
    return db.staff.findUnique({ where: { user_id: userId } });
  }

  listAll(db: DbClient = prisma) {
    return db.staff.findMany({
      orderBy: { created_at: 'desc' },
      include: { users: { select: { full_name: true, email: true } } },
    });
  }

  create(data: Prisma.staffUncheckedCreateInput, db: DbClient = prisma) {
    return db.staff.create({ data });
  }

  update(id: string, data: Prisma.staffUncheckedUpdateInput, db: DbClient = prisma) {
    return db.staff.update({ where: { id }, data });
  }
}

export const staffRepository = new StaffRepository();
