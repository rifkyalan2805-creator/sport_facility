import { court_type } from '@prisma/client';
import { prisma } from '../config/prisma';
import {
  OccupancyLogRepository,
  occupancyLogRepository,
} from '../repositories/occupancyLog.repository';
import { resolveCategory } from '../utils/revenueCategory';

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

  /**
   * Breakdown revenue untuk chart admin: tren (combo) + komposisi (donut).
   * Basis NET — final_amount dialokasikan proporsional ke tiap item berdasarkan
   * subtotal (Fase 0, lihat docs/revenue-analytics-spec.md). Invarian:
   * Σ composition.amount === total === Σ trend.revenue.
   */
  async getRevenueBreakdown(range: '7d' | '30d') {
    const DAYS = range === '30d' ? 30 : 7;
    const todayStart = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
    const since = new Date(todayStart);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    const payments = await prisma.payments.findMany({
      where: { status: 'paid', paid_at: { gte: since } },
      select: {
        paid_at: true,
        final_amount: true,
        payment_items: { select: { item_type: true, item_id: true, subtotal: true } },
      },
    });

    // Anti-N+1: satu query untuk resolusi court type semua item booking.
    const bookingIds = [
      ...new Set(
        payments.flatMap((p) =>
          p.payment_items.filter((it) => it.item_type === 'booking').map((it) => it.item_id)
        )
      ),
    ];
    const courtTypeByBooking = new Map<string, court_type>();
    if (bookingIds.length) {
      const bookings = await prisma.bookings.findMany({
        where: { id: { in: bookingIds } },
        select: { id: true, courts: { select: { type: true } } },
      });
      for (const b of bookings) courtTypeByBooking.set(b.id, b.courts.type);
    }

    // Rangka 7/30 bucket harian (isi 0 untuk hari tanpa transaksi).
    const buckets = new Map<string, { revenue: number; count: number }>();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      buckets.set(d.toISOString().slice(0, 10), { revenue: 0, count: 0 });
    }

    // Akumulasi: tren (final_amount/hari) + komposisi NET (alokasi proporsional).
    const compFloat = new Map<string, number>();
    for (const p of payments) {
      if (!p.paid_at) continue;
      const bucket = buckets.get(p.paid_at.toISOString().slice(0, 10));
      const final = Number(p.final_amount);
      if (bucket) {
        bucket.revenue += final;
        bucket.count += 1;
      }
      const sumSub = p.payment_items.reduce((s, it) => s + Number(it.subtotal), 0);
      if (sumSub > 0) {
        for (const it of p.payment_items) {
          const label = resolveCategory({
            itemType: it.item_type,
            courtType: it.item_type === 'booking' ? courtTypeByBooking.get(it.item_id) : undefined,
          });
          compFloat.set(label, (compFloat.get(label) ?? 0) + (Number(it.subtotal) / sumSub) * final);
        }
      } else if (final > 0) {
        // Σ subtotal = 0 tapi ada nilai → tak bisa dialokasikan, jaga rekonsiliasi.
        compFloat.set('Lainnya', (compFloat.get('Lainnya') ?? 0) + final);
      }
    }

    const trend = [...buckets.entries()].map(([date, v]) => ({
      date,
      revenue: Math.round(v.revenue),
      count: v.count,
    }));
    const total = trend.reduce((s, t) => s + t.revenue, 0);

    // Bulatkan komposisi ke rupiah + rekonsiliasi agar Σ = total (residu ke slice terbesar).
    let rows = [...compFloat.entries()]
      .map(([label, amount]) => ({ label, amount: Math.round(amount) }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    const diff = total - rows.reduce((s, c) => s + c.amount, 0);
    if (rows.length && diff !== 0) rows[0].amount += diff;

    // Konsolidasi: 6 slice terbesar, sisanya digabung "Lainnya".
    if (rows.length > 6) {
      const top = rows.slice(0, 6);
      const restSum = rows.slice(6).reduce((s, c) => s + c.amount, 0);
      const existing = top.find((c) => c.label === 'Lainnya');
      if (existing) existing.amount += restSum;
      else top.push({ label: 'Lainnya', amount: restSum });
      rows = top.sort((a, b) => b.amount - a.amount);
    }

    const composition = rows.map((c) => ({
      label: c.label,
      amount: c.amount,
      pct: total > 0 ? Math.round((c.amount / total) * 1000) / 10 : 0,
    }));

    return { range, trend, composition, total };
  }
}

export const reportService = new ReportService();
