import { AppError } from '../utils/AppError';
import { dateToTime, toMinutes } from '../utils/time';
import { CourtRepository, courtRepository } from '../repositories/court.repository';
import { BookingRepository, bookingRepository } from '../repositories/booking.repository';
import { PricingRepository, pricingRepository } from '../repositories/pricing.repository';

export interface AvailabilitySlot {
  id: string;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  durationMin: number;
  basePrice: number; // harga normal (dicoret bila ada diskon)
  price: number; // harga berlaku (off-peak bila cocok)
  status: 'available' | 'booked';
}

export interface AvailabilityResult {
  date: string;
  closed: boolean;
  slots: AvailabilitySlot[];
}

const SLOT_MINUTES = 60;

/** menit sejak 00:00 → "HH:mm". */
function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * AvailabilityService — menyusun jadwal slot 1 court untuk 1 tanggal:
 * jam operasional (court_schedules) → slot per jam, harga per-sport
 * (padel_prices off-peak/normal), dan status booked (bookings aktif + slot lampau).
 */
export class AvailabilityService {
  constructor(
    private readonly courts: CourtRepository = courtRepository,
    private readonly bookings: BookingRepository = bookingRepository,
    private readonly pricing: PricingRepository = pricingRepository
  ) {}

  async getAvailability(courtId: string, dateStr: string): Promise<AvailabilityResult> {
    const court = await this.courts.findActiveById(courtId);
    if (!court) throw AppError.notFound('Court tidak ditemukan atau tidak aktif');

    const dayOfWeek = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
    const schedule = await this.courts.findScheduleForDay(courtId, dayOfWeek);
    if (!schedule || schedule.is_holiday_closed) {
      return { date: dateStr, closed: true, slots: [] };
    }

    const open = dateToTime(schedule.open_time);
    const close = dateToTime(schedule.close_time);

    // Harga: padel pakai padel_prices (normal + off-peak); lainnya fallback court.
    const padelRows = court.type === 'paddle' ? await this.pricing.listPadel() : [];
    const normalRow = padelRows.find((r) => r.is_active && (!r.time_start || !r.time_end));
    const basePrice = normalRow ? Number(normalRow.price) : Number(court.price_per_hour);

    // Booking aktif pada tanggal ini → tandai slot yang sudah dipesan.
    const booked = await this.bookings.findActiveByCourtDate(courtId, dateStr);
    const bookedRanges = booked.map((b) => ({
      start: dateToTime(b.start_time),
      end: dateToTime(b.end_time),
    }));

    // Slot lampau (jam wall-clock lokal) juga dianggap tak tersedia.
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const nowHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}`;

    const openMin = toMinutes(open);
    const closeMin = toMinutes(close);
    const slots: AvailabilitySlot[] = [];

    for (let m = openMin; m + SLOT_MINUTES <= closeMin; m += SLOT_MINUTES) {
      const start = fromMinutes(m);
      const end = fromMinutes(m + SLOT_MINUTES);

      let price = basePrice;
      if (court.type === 'paddle') {
        const offPeak = padelRows.find(
          (r) =>
            r.is_active &&
            r.time_start &&
            r.time_end &&
            dateToTime(r.time_start) <= start &&
            start < dateToTime(r.time_end)
        );
        if (offPeak) price = Number(offPeak.price);
      }

      const isBooked = bookedRanges.some((r) => r.start < end && r.end > start);
      const isPast = dateStr < todayStr || (dateStr === todayStr && start <= nowHHmm);

      slots.push({
        id: `${courtId}_${dateStr}_${start}`,
        start,
        end,
        durationMin: SLOT_MINUTES,
        basePrice,
        price,
        status: isBooked || isPast ? 'booked' : 'available',
      });
    }

    return { date: dateStr, closed: false, slots };
  }
}

export const availabilityService = new AvailabilityService();
