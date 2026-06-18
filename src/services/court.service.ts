import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { timeToDate } from '../utils/time';
import { CreateCourtInput, SetScheduleInput, UpdateCourtInput } from '../types/court.types';
import { CourtRepository, courtRepository } from '../repositories/court.repository';

export class CourtService {
  constructor(private readonly courts: CourtRepository = courtRepository) {}

  listActiveCourts() {
    return this.courts.listActive();
  }

  listAllCourts() {
    return this.courts.listAll();
  }

  async getCourt(id: string) {
    const court = await this.courts.findById(id);
    if (!court) throw AppError.notFound('Court tidak ditemukan');
    return court;
  }

  createCourt(input: CreateCourtInput) {
    const data: Prisma.courtsUncheckedCreateInput = {
      name: input.name,
      code: input.code,
      type: input.type,
      price_per_hour: new Prisma.Decimal(input.pricePerHour),
      capacity: input.capacity,
      is_indoor: input.isIndoor,
      facilities: input.facilities as Prisma.InputJsonValue,
      image_url: input.imageUrl ?? null,
      description: input.description ?? null,
      is_active: input.isActive,
      sort_order: input.sortOrder,
    };
    // Unik `code` dijaga DB → P2002 dipetakan ke 409 oleh errorHandler.
    return this.courts.create(data);
  }

  async updateCourt(id: string, input: UpdateCourtInput) {
    await this.getCourt(id); // 404 jika tidak ada

    const data: Prisma.courtsUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.code !== undefined) data.code = input.code;
    if (input.type !== undefined) data.type = input.type;
    if (input.pricePerHour !== undefined)
      data.price_per_hour = new Prisma.Decimal(input.pricePerHour);
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.isIndoor !== undefined) data.is_indoor = input.isIndoor;
    if (input.facilities !== undefined)
      data.facilities = input.facilities as Prisma.InputJsonValue;
    if (input.imageUrl !== undefined) data.image_url = input.imageUrl;
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;

    return this.courts.update(id, data);
  }

  /**
   * Soft delete: courts direferensikan bookings tanpa ON DELETE CASCADE,
   * jadi court dinonaktifkan (is_active=false), bukan dihapus permanen.
   */
  async deactivateCourt(id: string) {
    await this.getCourt(id);
    return this.courts.update(id, { is_active: false });
  }

  async listSchedules(courtId: string) {
    await this.getCourt(courtId);
    return this.courts.listSchedules(courtId);
  }

  async setSchedule(courtId: string, input: SetScheduleInput) {
    await this.getCourt(courtId);
    return this.courts.upsertSchedule(courtId, input.dayOfWeek, {
      open_time: timeToDate(input.openTime),
      close_time: timeToDate(input.closeTime),
      is_holiday_closed: input.isHolidayClosed,
    });
  }

  async deleteSchedule(courtId: string, scheduleId: string) {
    const schedule = await this.courts.findScheduleById(scheduleId);
    if (!schedule || schedule.court_id !== courtId) {
      throw AppError.notFound('Jadwal tidak ditemukan untuk court ini');
    }
    await this.courts.deleteSchedule(scheduleId);
  }
}

export const courtService = new CourtService();
