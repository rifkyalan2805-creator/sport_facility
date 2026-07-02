import { Prisma, booking_type } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { timeToDate } from '../utils/time';
import { PricingRepository, pricingRepository } from '../repositories/pricing.repository';

interface TennisInput {
  bookingType?: booking_type;
  withLight?: boolean;
  price?: number;
  isActive?: boolean;
  sortOrder?: number;
}
interface PadelInput {
  label?: string;
  price?: number;
  timeStart?: string | null;
  timeEnd?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export class PricingService {
  constructor(private readonly repo: PricingRepository = pricingRepository) {}

  /** Semua harga per-sport untuk ditampilkan frontend. */
  async getAll() {
    const [tennis, padel] = await Promise.all([this.repo.listTennis(), this.repo.listPadel()]);
    return { tennis, padel };
  }

  // ---- Tennis ----
  createTennis(input: TennisInput) {
    const data: Prisma.tennis_pricesUncheckedCreateInput = {
      booking_type: input.bookingType!,
      with_light: input.withLight!,
      price: new Prisma.Decimal(input.price ?? 0),
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    };
    // UNIQUE(booking_type, with_light) dijaga DB → P2002 dipetakan 409.
    return this.repo.createTennis(data);
  }

  async updateTennis(id: string, input: TennisInput) {
    if (!(await this.repo.findTennis(id))) throw AppError.notFound('Harga tenis tidak ditemukan');
    const data: Prisma.tennis_pricesUncheckedUpdateInput = {};
    if (input.bookingType !== undefined) data.booking_type = input.bookingType;
    if (input.withLight !== undefined) data.with_light = input.withLight;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.isActive !== undefined) data.is_active = input.isActive;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;
    return this.repo.updateTennis(id, data);
  }

  async deleteTennis(id: string) {
    if (!(await this.repo.findTennis(id))) throw AppError.notFound('Harga tenis tidak ditemukan');
    await this.repo.deleteTennis(id);
  }

  // ---- Padel ----
  createPadel(input: PadelInput) {
    const data: Prisma.padel_pricesUncheckedCreateInput = {
      label: input.label!,
      price: new Prisma.Decimal(input.price ?? 0),
      time_start: input.timeStart ? timeToDate(input.timeStart) : null,
      time_end: input.timeEnd ? timeToDate(input.timeEnd) : null,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    };
    return this.repo.createPadel(data);
  }

  async updatePadel(id: string, input: PadelInput) {
    if (!(await this.repo.findPadel(id))) throw AppError.notFound('Harga padel tidak ditemukan');
    const data: Prisma.padel_pricesUncheckedUpdateInput = {};
    if (input.label !== undefined) data.label = input.label;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.timeStart !== undefined)
      data.time_start = input.timeStart ? timeToDate(input.timeStart) : null;
    if (input.timeEnd !== undefined)
      data.time_end = input.timeEnd ? timeToDate(input.timeEnd) : null;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;
    return this.repo.updatePadel(id, data);
  }

  async deletePadel(id: string) {
    if (!(await this.repo.findPadel(id))) throw AppError.notFound('Harga padel tidak ditemukan');
    await this.repo.deletePadel(id);
  }
}

export const pricingService = new PricingService();
