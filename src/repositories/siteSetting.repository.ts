import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class SiteSettingRepository {
  findByKey(key: string, db: DbClient = prisma) {
    return db.site_settings.findUnique({ where: { key } });
  }

  listAll(db: DbClient = prisma) {
    return db.site_settings.findMany({ orderBy: { key: 'asc' } });
  }

  upsert(
    key: string,
    value: Prisma.InputJsonValue,
    updatedBy: string | null,
    db: DbClient = prisma
  ) {
    return db.site_settings.upsert({
      where: { key },
      create: { key, value, updated_by: updatedBy },
      update: { value, updated_by: updatedBy, updated_at: new Date() },
    });
  }
}

export const siteSettingRepository = new SiteSettingRepository();
