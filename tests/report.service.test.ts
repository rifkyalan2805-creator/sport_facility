jest.mock('../src/config/prisma', () => ({
  prisma: {
    payments: { findMany: jest.fn() },
    bookings: { findMany: jest.fn() },
  },
}));

import { prisma } from '../src/config/prisma';
import { ReportService } from '../src/services/report.service';

const service = new ReportService();
const today = new Date();

describe('ReportService.getRevenueBreakdown', () => {
  beforeEach(() => jest.clearAllMocks());

  it('alokasi NET & Σ komposisi = total = Σ tren (konsistensi angka / DoD)', async () => {
    (prisma.payments.findMany as jest.Mock).mockResolvedValue([
      {
        paid_at: today,
        final_amount: 100000,
        payment_items: [{ item_type: 'booking', item_id: 'b1', subtotal: 100000 }],
      },
      {
        // ada diskon: final 90000 dari subtotal 100000 → faktor 0.9 dialokasikan proporsional
        paid_at: today,
        final_amount: 90000,
        payment_items: [
          { item_type: 'booking', item_id: 'b2', subtotal: 60000 },
          { item_type: 'pool_ticket', item_id: 'pt1', subtotal: 40000 },
        ],
      },
    ]);
    (prisma.bookings.findMany as jest.Mock).mockResolvedValue([
      { id: 'b1', courts: { type: 'paddle' } },
      { id: 'b2', courts: { type: 'tennis' } },
    ]);

    const res = await service.getRevenueBreakdown('7d');

    const compTotal = res.composition.reduce((s, c) => s + c.amount, 0);
    const trendTotal = res.trend.reduce((s, t) => s + t.revenue, 0);
    expect(res.total).toBe(190000);
    expect(compTotal).toBe(res.total); // DoD: Σ pie = total
    expect(trendTotal).toBe(res.total); // DoD: Σ tren = total

    const byLabel = Object.fromEntries(res.composition.map((c) => [c.label, c.amount]));
    expect(byLabel['Padel']).toBe(100000);
    expect(byLabel['Tennis']).toBe(54000); // 60000/100000 * 90000
    expect(byLabel['Kolam']).toBe(36000); // 40000/100000 * 90000
    // pembulatan pct
    expect(res.composition.find((c) => c.label === 'Padel')?.pct).toBeCloseTo(52.6, 1);
  });

  it('range 7d → 7 bucket; tanpa item booking, bookings.findMany tak dipanggil', async () => {
    (prisma.payments.findMany as jest.Mock).mockResolvedValue([]);
    const res = await service.getRevenueBreakdown('7d');
    expect(res.trend).toHaveLength(7);
    expect(res.composition).toEqual([]);
    expect(res.total).toBe(0);
    expect(prisma.bookings.findMany).not.toHaveBeenCalled();
  });

  it('range 30d → 30 bucket', async () => {
    (prisma.payments.findMany as jest.Mock).mockResolvedValue([]);
    const res = await service.getRevenueBreakdown('30d');
    expect(res.trend).toHaveLength(30);
  });
});
