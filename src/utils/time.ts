import { AppError } from './AppError';

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Validasi & normalisasi string jam "HH:mm". */
export function assertTimeString(value: string, field: string): string {
  if (!HH_MM.test(value)) {
    throw AppError.badRequest(`Field "${field}" harus berformat HH:mm (24 jam).`);
  }
  return value;
}

/** Konversi "HH:mm" menjadi total menit sejak 00:00. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Konversi "HH:mm" -> Date pada 1970-01-01 (sesuai mapping Prisma @db.Time). */
export function timeToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

/** Konversi Date (kolom TIME) -> "HH:mm". */
export function dateToTime(d: Date): string {
  return d.toISOString().slice(11, 16);
}

/** Durasi dalam jam (2 desimal) dari dua "HH:mm". */
export function durationHours(start: string, end: string): number {
  return Math.round(((toMinutes(end) - toMinutes(start)) / 60) * 100) / 100;
}
