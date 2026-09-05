/**
 * Pengelompokan masa berlaku (dipakai badge & filter warna di panel admin).
 *
 *   safe     → hijau  : aktif, masih lama (> WARNING_DAYS hari lagi)
 *   warning  → kuning : aktif, hampir jatuh tempo (0 … WARNING_DAYS hari lagi)
 *   expired  → merah  : sudah lewat tanggal, atau status DB sudah `expired`
 *   inactive → abu-abu: belum/tidak berjalan (pending, cancelled)
 *
 * Ambang batas dipusatkan di sini agar UI, filter query, dan badge tidak
 * pernah berbeda pendapat soal "hampir habis".
 */
export const WARNING_DAYS = 7;

export type ExpiryGroup = 'safe' | 'warning' | 'expired' | 'inactive';

export const EXPIRY_GROUPS: readonly ExpiryGroup[] = [
  'safe',
  'warning',
  'expired',
  'inactive',
];

/** Tengah malam hari ini (UTC) — batas bawah perbandingan kolom `date`. */
export function startOfToday(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

/** Tengah malam H+`days` (UTC). */
export function startOfTodayPlus(days: number): Date {
  const d = startOfToday();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Hitung kelompok sebuah baris dari status + tanggal berakhirnya.
 * `activeStatus` adalah nilai status yang dianggap "sedang berjalan".
 */
export function expiryGroupOf(
  status: string,
  endDate: Date,
  activeStatus = 'active'
): ExpiryGroup {
  if (status !== activeStatus) {
    return status === 'expired' ? 'expired' : 'inactive';
  }
  const end = new Date(endDate).getTime();
  if (end < startOfToday().getTime()) return 'expired';
  return end <= startOfTodayPlus(WARNING_DAYS).getTime() ? 'warning' : 'safe';
}

/**
 * Filter Prisma untuk sebuah kelompok, pada model apa pun yang punya
 * kolom `status` + `end_date`. Dipakai agar paginasi tetap benar
 * (penyaringan terjadi di database, bukan setelah halaman diambil).
 */
export function expiryGroupWhere(group: ExpiryGroup, activeStatus = 'active') {
  switch (group) {
    case 'safe':
      return { status: activeStatus, end_date: { gt: startOfTodayPlus(WARNING_DAYS) } };
    case 'warning':
      return {
        status: activeStatus,
        end_date: { gte: startOfToday(), lte: startOfTodayPlus(WARNING_DAYS) },
      };
    case 'expired':
      return {
        OR: [
          { status: 'expired' },
          { status: activeStatus, end_date: { lt: startOfToday() } },
        ],
      };
    case 'inactive':
      // Semua status selain "berjalan" dan "expired" (pending, cancelled, …).
      return { status: { notIn: [activeStatus, 'expired'] } };
  }
}
