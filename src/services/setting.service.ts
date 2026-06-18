import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import {
  SiteSettingRepository,
  siteSettingRepository,
} from '../repositories/siteSetting.repository';

export class SettingService {
  constructor(private readonly settings: SiteSettingRepository = siteSettingRepository) {}

  listAll() {
    return this.settings.listAll();
  }

  async getByKey(key: string) {
    const setting = await this.settings.findByKey(key);
    if (!setting) throw AppError.notFound('Setting tidak ditemukan');
    return setting;
  }

  upsert(key: string, value: unknown, updatedBy: string) {
    return this.settings.upsert(key, value as Prisma.InputJsonValue, updatedBy);
  }
}

export const settingService = new SettingService();
