import { prisma } from '../config/prisma';
import {
  OccupancyLogRepository,
  occupancyLogRepository,
} from '../repositories/occupancyLog.repository';

interface RecordOccupancyInput {
  courtId: string;
  logDate: string;
  hourSlot: number;
  isOccupied: boolean;
  bookingId?: string;
}

export class ReportService {
  constructor(private readonly occupancy: OccupancyLogRepository = occupancyLogRepository) {}

  recordOccupancy(input: RecordOccupancyInput) {
    return this.occupancy.upsert(input.courtId, new Date(input.logDate), input.hourSlot, {
      is_occupied: input.isOccupied,
      booking_id: input.bookingId ?? null,
    });
  }

  /** Occupancy harian satu court + ringkasan jumlah jam terpakai. */
  async getOccupancy(courtId: string, date: string) {
    const logs = await this.occupancy.listByCourtDate(courtId, new Date(date));
    const occupiedHours = logs.filter((l) => l.is_occupied).length;
    return { date, court_id: courtId, occupied_hours: occupiedHours, slots: logs };
  }

  /**
   * Ringkasan untuk dashboard admin: kartu (booking hari ini, pending abonemen,
   * total revenue, total booking) + seri revenue 7 hari terakhir untuk chart.
   */
  async getSummary() {
    const DAYS = 7;
    const todayStart = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
    const since = new Date(todayStart);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    const [bookingsToday, pendingAbonemen, totalBookings, revAgg, paidRecent] = await Promise.all([
      prisma.bookings.count({ where: { created_at: { gte: todayStart } } }),
      prisma.abonemen_registrations.count({ where: { status: 'pending' } }),
      prisma.bookings.count(),
      prisma.payments.aggregate({ _sum: { final_amount: true }, where: { status: 'paid' } }),
      prisma.payments.findMany({
        where: { status: 'paid', paid_at: { gte: since } },
        select: { paid_at: true, final_amount: true },
      }),
    ]);

    // Rangka 7 hari (isi 0 untuk hari tanpa transaksi).
    const buckets = new Map<string, { revenue: number; count: number }>();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      buckets.set(d.toISOString().slice(0, 10), { revenue: 0, count: 0 });
    }
    for (const p of paidRecent) {
      if (!p.paid_at) continue;
      const b = buckets.get(p.paid_at.toISOString().slice(0, 10));
      if (b) {
        b.revenue += Number(p.final_amount);
        b.count += 1;
      }
    }
    const revenue7d = [...buckets.entries()].map(([date, v]) => ({
      date,
      revenue: v.revenue,
      count: v.count,
    }));

    return {
      bookingsToday,
      pendingAbonemen,
      totalBookings,
      revenueTotal: Number(revAgg._sum.final_amount ?? 0),
      revenue7d,
    };
  }
}

export const reportService = new ReportService();
