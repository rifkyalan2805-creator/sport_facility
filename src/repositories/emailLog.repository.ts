import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class EmailLogRepository {
  create(data: Prisma.email_logsUncheckedCreateInput, db: DbClient = prisma) {
    return db.email_logs.create({ data });
  }

  listAll(db: DbClient = prisma) {
    return db.email_logs.findMany({ orderBy: { created_at: 'desc' }, take: 200 });
  }
}

export const emailLogRepository = new EmailLogRepository();
