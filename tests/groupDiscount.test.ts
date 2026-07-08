import { resolveGroupDiscount } from '../src/utils/groupDiscount';

const TIERS = [
  { minQty: 15, percent: 10 },
  { minQty: 30, percent: 12.5 },
  { minQty: 50, percent: 20 },
];

describe('resolveGroupDiscount', () => {
  it('di bawah 15 orang → tanpa diskon', () => {
    expect(resolveGroupDiscount(14, 700000, TIERS)).toEqual({ percent: 0, discount: 0 });
    expect(resolveGroupDiscount(1, 50000, TIERS)).toEqual({ percent: 0, discount: 0 });
  });

  it('15 orang → 10%', () => {
    expect(resolveGroupDiscount(15, 750000, TIERS)).toEqual({ percent: 10, discount: 75000 });
  });

  it('29 orang → tetap 10% (belum capai tier 30)', () => {
    expect(resolveGroupDiscount(29, 1450000, TIERS)).toEqual({ percent: 10, discount: 145000 });
  });

  it('30 orang → 12,5%', () => {
    expect(resolveGroupDiscount(30, 1500000, TIERS)).toEqual({ percent: 12.5, discount: 187500 });
  });

  it('49 orang → tetap 12,5%', () => {
    expect(resolveGroupDiscount(49, 2450000, TIERS)).toEqual({
      percent: 12.5,
      discount: Math.round(2450000 * 0.125),
    });
  });

  it('50 orang → 20%', () => {
    expect(resolveGroupDiscount(50, 2500000, TIERS)).toEqual({ percent: 20, discount: 500000 });
  });

  it('100 orang → 20% (tier tertinggi)', () => {
    expect(resolveGroupDiscount(100, 5000000, TIERS)).toEqual({ percent: 20, discount: 1000000 });
  });

  it('tanpa tier terkonfigurasi → 0', () => {
    expect(resolveGroupDiscount(100, 5000000, [])).toEqual({ percent: 0, discount: 0 });
  });

  it('diskon tidak melebihi amount (amount 0)', () => {
    expect(resolveGroupDiscount(50, 0, TIERS)).toEqual({ percent: 20, discount: 0 });
  });

  it('membulatkan nominal pecahan', () => {
    // 12,5% dari 100001 = 12500.125 → 12500
    expect(resolveGroupDiscount(30, 100001, TIERS).discount).toBe(12500);
  });

  it('tier tidak berurutan tetap memilih ambang terpenuhi tertinggi', () => {
    const messy = [
      { minQty: 50, percent: 20 },
      { minQty: 15, percent: 10 },
      { minQty: 30, percent: 12.5 },
    ];
    expect(resolveGroupDiscount(35, 1000000, messy)).toEqual({ percent: 12.5, discount: 125000 });
  });
});
