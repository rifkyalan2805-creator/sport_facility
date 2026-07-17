export function formatRupiah(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Angka rupiah ringkas untuk label sumbu chart: 1_500_000 → "1.5jt", 2e9 → "2M". */
export function shortRupiah(v: number): string {
  if (v >= 1_000_000_000) return `${Math.round((v / 1_000_000_000) * 10) / 10}M`;
  if (v >= 1_000_000) return `${Math.round((v / 1_000_000) * 10) / 10}jt`;
  if (v >= 1_000) return `${Math.round(v / 1000)}rb`;
  return `${v}`;
}

/** "YYYY-MM-DD" → "DD/MM" untuk tick sumbu-X chart. */
export function shortDayMonth(d: string): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

/** Kolom TIME (ISO "1970-01-01THH:mm:...Z") → "HH:mm". */
export function formatTimeISO(iso: string): string {
  return iso.slice(11, 16);
}

/** Tanggal ("YYYY-MM-DD" atau ISO) → "Sen, 6 Jul 2026" tanpa geser zona waktu. */
export function formatDateID(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface DatePill {
  iso: string; // "2026-07-10"
  dayShort: string; // "Sen"
  dayNum: string; // "10"
  month: string; // "Jul"
  weekend: boolean;
  isToday: boolean;
}

/** Tanggal lokal → "YYYY-MM-DD" (hindari pergeseran zona waktu dari toISOString). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deret tanggal mulai hari ini untuk pill date-picker. */
export function buildDatePills(count = 14, from = new Date()): DatePill[] {
  const todayISO = toLocalISODate(from);
  const pills: DatePill[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const day = d.getDay();
    pills.push({
      iso: toLocalISODate(d),
      dayShort: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dayNum: String(d.getDate()),
      month: d.toLocaleDateString("id-ID", { month: "short" }),
      weekend: day === 0 || day === 6,
      isToday: toLocalISODate(d) === todayISO,
    });
  }
  return pills;
}
