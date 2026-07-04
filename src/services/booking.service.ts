import { Prisma, booking_type } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { dateToTime, durationHours, timeToDate } from '../utils/time';
import {
  CancelBookingInput,
  CreateBookingInput,
  ListBookingFilter,
} from '../types/booking.types';
import { BookingRepository, bookingRepository } from '../repositories/booking.repository';
import { CourtRepository, courtRepository } from '../repositories/court.repository';
import {
  UserAbonemenRepository,
  userAbonemenRepository,
} from '../repositories/userAbonemen.repository';
import {
  SiteSettingRepository,
  siteSettingRepository,
} from '../repositories/siteSetting.repository';
import { PricingRepository, pricingRepository } from '../repositories/pricing.repository';
import {
  AbonemenRegistrationRepository,
  abonemenRegistrationRepository,
} from '../repositories/abonemenRegistration.repository';

// Status yang masih boleh dibatalkan oleh user.
const CANCELLABLE: Array<'pending' | 'confirmed'> = ['pending', 'confirmed'];

export class BookingService {
  // DI sederhana lewat constructor — mudah di-mock saat unit test.
  constructor(
    private readonly bookings: BookingRepository = bookingRepository,
    private readonly courts: CourtRepository = courtRepository,
    private readonly abonemen: UserAbonemenRepository = userAbonemenRepository,
    private readonly settings: SiteSettingRepository = siteSettingRepository,
    private readonly pricing: PricingRepository = pricingRepository,
    private readonly registrations: AbonemenRegistrationRepository = abonemenRegistrationRepository
  ) {}

  /**
   * Membuat booking (insidentil atau abonemen).
   * Seluruh validasi ketersediaan + pembuatan dijalankan dalam satu
   * transaksi Serializable dengan advisory lock per court.
   */
  async createBooking(input: CreateBookingInput) {
    // 1) Court harus ada & aktif.
    const court = await this.courts.findActiveById(input.courtId);
    if (!court) throw AppError.notFound('Court tidak ditemukan atau tidak aktif');

    // 2) Tanggal tidak boleh di masa lalu.
    const today = new Date().toISOString().slice(0, 10);
    if (input.bookingDate < today) {
      throw AppError.badRequest('booking_date tidak boleh di masa lalu');
    }

    // 3) Validasi terhadap jadwal operasional court (court_schedules).
    const dayOfWeek = new Date(`${input.bookingDate}T00:00:00Z`).getUTCDay();
    const schedule = await this.courts.findScheduleForDay(input.courtId, dayOfWeek);
    if (!schedule) {
      throw AppError.unprocessable('Court tidak beroperasi pada hari tersebut');
    }
    if (schedule.is_holiday_closed) {
      throw AppError.unprocessable('Court tutup (hari libur) pada tanggal tersebut');
    }
    const open = dateToTime(schedule.open_time);
    const close = dateToTime(schedule.close_time);
    if (input.startTime < open || input.endTime > close) {
      throw AppError.unprocessable(
        `Waktu booking di luar jam operasional (${open}–${close})`
      );
    }

    const duration = durationHours(input.startTime, input.endTime);

    // Gating: tarif abonemen tenis (per-jam, tanpa paket prabayar) hanya boleh
    // dipakai user yang registrasi abonemennya sudah di-approve admin.
    if (
      !input.abonemenId &&
      input.bookingType === 'abonemen' &&
      court.type === 'tennis'
    ) {
      const approved = await this.registrations.findApprovedForUser(input.userId);
      if (!approved) {
        throw AppError.unprocessable(
          'Tarif abonemen tenis hanya untuk anggota terdaftar. Silakan registrasi abonemen dan tunggu persetujuan admin.'
        );
      }
    }

    // Harga per jam dari tabel per-sport (dilewati jika pakai paket prabayar).
    const unitPrice = input.abonemenId
      ? new Prisma.Decimal(0)
      : await this.resolveUnitPrice(
          court,
          input.bookingType,
          input.withLight ?? true,
          input.startTime
        );

    // 4) Transaksi: lock court → cek bentrok → (abonemen) → create.
    return prisma.$transaction(
      async (tx) => {
        await this.bookings.acquireCourtLock(input.courtId, tx);

        const conflict = await this.bookings.findConflicting(
          input.courtId,
          input.bookingDate,
          input.startTime,
          input.endTime,
          tx
        );
        if (conflict.length > 0) {
          throw AppError.conflict('Slot waktu pada court ini sudah dibooking');
        }

        let totalPrice = new Prisma.Decimal(0);
        let abonemenId: string | null = null;

        if (input.abonemenId) {
          // Paket prabayar → total 0 & kurangi sesi.
          abonemenId = await this.consumeAbonemen(input, tx);
        } else {
          totalPrice = unitPrice.mul(duration);
        }

        const data: Prisma.bookingsUncheckedCreateInput = {
          user_id: input.userId,
          court_id: input.courtId,
          abonemen_id: abonemenId,
          booking_type: input.bookingType,
          booking_date: new Date(input.bookingDate),
          start_time: timeToDate(input.startTime),
          end_time: timeToDate(input.endTime),
          duration_hours: new Prisma.Decimal(duration),
          total_price: totalPrice,
          status: 'pending',
          notes: input.notes ?? null,
        };

        return this.bookings.create(data, tx);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  /** Validasi & konsumsi 1 sesi abonemen di dalam transaksi. */
  private async consumeAbonemen(
    input: CreateBookingInput,
    tx: Prisma.TransactionClient
  ): Promise<string> {
    const ab = await this.abonemen.findById(input.abonemenId!, tx);
    if (!ab) throw AppError.notFound('Abonemen tidak ditemukan');
    if (ab.user_id !== input.userId) {
      throw new AppError(403, 'Abonemen bukan milik user ini');
    }
    if (ab.status !== 'active') {
      throw AppError.unprocessable('Abonemen tidak aktif');
    }
    if (ab.remaining_sessions <= 0) {
      throw AppError.unprocessable('Sisa sesi abonemen sudah habis');
    }
    const abEndDate = ab.end_date.toISOString().slice(0, 10);
    if (input.bookingDate > abEndDate) {
      throw AppError.unprocessable('Tanggal booking melewati masa berlaku abonemen');
    }
    if (input.bookingDate < ab.start_date.toISOString().slice(0, 10)) {
      throw AppError.unprocessable('Tanggal booking sebelum masa mulai abonemen');
    }

    await this.abonemen.decrementRemaining(ab.id, tx);
    return ab.id;
  }

  /**
   * Harga per jam sesuai jenis lapangan (sumber: tabel per-sport):
   * - tenis  → tennis_prices (booking_type × with_light)
   * - padel  → padel_prices (off-peak by start_time, selain itu normal)
   * - lainnya → fallback courts.price_per_hour
   */
  private async resolveUnitPrice(
    court: { type: string; price_per_hour: Prisma.Decimal },
    bookingType: booking_type,
    withLight: boolean,
    startTime: string
  ): Promise<Prisma.Decimal> {
    if (court.type === 'tennis') {
      const rows = await this.pricing.listTennis();
      const row = rows.find(
        (r) => r.is_active && r.booking_type === bookingType && r.with_light === withLight
      );
      if (row) return new Prisma.Decimal(row.price);
    } else if (court.type === 'paddle') {
      const rows = await this.pricing.listPadel();
      const offPeak = rows.find(
        (r) =>
          r.is_active &&
          r.time_start &&
          r.time_end &&
          dateToTime(r.time_start) <= startTime &&
          startTime < dateToTime(r.time_end)
      );
      const normal = rows.find((r) => r.is_active && (!r.time_start || !r.time_end));
      const chosen = offPeak ?? normal;
      if (chosen) return new Prisma.Decimal(chosen.price);
    }
    return new Prisma.Decimal(court.price_per_hour);
  }

  async getBookingById(id: string) {
    const booking = await this.bookings.findById(id);
    if (!booking) throw AppError.notFound('Booking tidak ditemukan');
    return booking;
  }

  async listBookings(filter: ListBookingFilter) {
    const { data, total } = await this.bookings.findMany(filter);
    return {
      data,
      meta: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  /**
   * Cancel booking oleh pemiliknya. Menghormati site_settings
   * `cancellation_rule.hours_before`. Jika memakai abonemen, sesi
   * dikembalikan dalam transaksi yang sama.
   */
  async cancelBooking(input: CancelBookingInput) {
    const booking = await this.bookings.findById(input.bookingId);
    if (!booking) throw AppError.notFound('Booking tidak ditemukan');
    if (booking.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan booking ini');
    }
    if (!CANCELLABLE.includes(booking.status as 'pending' | 'confirmed')) {
      throw AppError.unprocessable(
        `Booking berstatus "${booking.status}" tidak bisa dibatalkan`
      );
    }

    const hoursBefore = await this.getCancellationHoursBefore();
    const startAt = new Date(
      `${booking.booking_date.toISOString().slice(0, 10)}T${dateToTime(
        booking.start_time
      )}:00Z`
    );
    const deadline = new Date(startAt.getTime() - hoursBefore * 3600_000);
    if (new Date() > deadline) {
      throw AppError.unprocessable(
        `Pembatalan minimal ${hoursBefore} jam sebelum jadwal`
      );
    }

    return prisma.$transaction(async (tx) => {
      if (booking.abonemen_id) {
        await tx.user_abonemen.update({
          where: { id: booking.abonemen_id },
          data: { remaining_sessions: { increment: 1 } },
        });
      }
      return this.bookings.updateStatus(
        booking.id,
        {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: input.reason ?? null,
        },
        tx
      );
    });
  }

  /** Check-in saat user datang ke lapangan. */
  async checkIn(bookingId: string) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) throw AppError.notFound('Booking tidak ditemukan');
    if (booking.status !== 'confirmed') {
      throw AppError.unprocessable(
        'Hanya booking berstatus "confirmed" yang bisa check-in'
      );
    }
    return this.bookings.updateStatus(booking.id, {
      status: 'checked_in',
      checked_in_at: new Date(),
    });
  }

  private async getCancellationHoursBefore(): Promise<number> {
    const setting = await this.settings.findByKey('cancellation_rule');
    const value = setting?.value as { hours_before?: number } | null;
    return value?.hours_before ?? 2; // fallback default seed = 2 jam.
  }
}

export const bookingService = new BookingService();
