export interface DiscountTier {
  minQty: number;
  percent: number;
}

export interface GroupDiscountResult {
  percent: number;
  discount: number; // rupiah, dibulatkan, tak melebihi amount
}

/**
 * Diskon grup berbasis jumlah orang: pilih **tier tertinggi** yang
 * `totalQty >= minQty`. discount = round(amount * percent / 100),
 * dibatasi maksimal sebesar amount.
 */
export function resolveGroupDiscount(
  totalQty: number,
  amount: number,
  tiers: DiscountTier[]
): GroupDiscountResult {
  const satisfied = tiers.filter((t) => totalQty >= t.minQty);
  if (satisfied.length === 0) return { percent: 0, discount: 0 };

  // Tier tertinggi = ambang (minQty) terbesar yang terpenuhi.
  const top = satisfied.reduce((a, b) => (b.minQty > a.minQty ? b : a));
  const raw = (amount * top.percent) / 100;
  const discount = Math.min(Math.round(raw), Math.max(0, amount));
  return { percent: top.percent, discount };
}
