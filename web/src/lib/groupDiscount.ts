export interface DiscountTier {
  minQty: number;
  percent: number;
}

/**
 * Preview diskon grup di sisi klien (harus konsisten dengan util backend).
 * Pilih tier tertinggi yang totalQty >= minQty. Nilai final tetap dihitung server.
 */
export function resolveGroupDiscount(
  totalQty: number,
  amount: number,
  tiers: DiscountTier[],
): { percent: number; discount: number } {
  const satisfied = tiers.filter((t) => totalQty >= t.minQty);
  if (satisfied.length === 0) return { percent: 0, discount: 0 };
  const top = satisfied.reduce((a, b) => (b.minQty > a.minQty ? b : a));
  const discount = Math.min(Math.round((amount * top.percent) / 100), Math.max(0, amount));
  return { percent: top.percent, discount };
}
