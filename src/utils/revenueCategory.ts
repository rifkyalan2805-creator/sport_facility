import { court_type, item_type } from '@prisma/client';

/**
 * Resolusi kategori revenue (Fase 0 — Opsi C Hybrid).
 * Lihat docs/revenue-analytics-spec.md. Satu-satunya logika domain baru:
 * memetakan sebuah payment_item ke tepat satu label tampilan untuk donut.
 */

export const FALLBACK_LABEL = 'Lainnya';

// booking → dipetakan lewat courts.type. Catatan: enum DB memakai `paddle`,
// label tampilannya "Padel".
export const COURT_TYPE_LABEL: Record<court_type, string> = {
  paddle: 'Padel',
  tennis: 'Tennis',
  badminton: 'Badminton',
  basketball: 'Basket',
  futsal: 'Futsal',
  other: 'Lapangan Lain',
};

// non-booking → dipetakan langsung dari item_type.
const ITEM_TYPE_LABEL: Partial<Record<item_type, string>> = {
  pool_ticket: 'Kolam',
  abonemen: 'Abonemen',
  membership: 'Membership',
  event: 'Event',
  ticket: 'Tiket Masuk',
  product: 'Retail',
};

/**
 * Kembalikan label kategori untuk satu item.
 * - booking: butuh `courtType` (hasil lookup bookings→courts.type).
 * - lainnya: cukup `itemType`.
 * Nilai tak dikenal → FALLBACK_LABEL (defensif, tidak melempar error).
 */
export function resolveCategory(input: {
  itemType: item_type;
  courtType?: court_type | null;
}): string {
  if (input.itemType === 'booking') {
    return (input.courtType && COURT_TYPE_LABEL[input.courtType]) || FALLBACK_LABEL;
  }
  return ITEM_TYPE_LABEL[input.itemType] ?? FALLBACK_LABEL;
}
