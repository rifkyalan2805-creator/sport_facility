import { z } from 'zod';
import { booking_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');
const timeStr = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm (24 jam)');

/**
 * Create booking.
 * - `abonemen_id` (opsional): jika diisi → pakai paket prabayar (total 0).
 * - Tanpa `abonemen_id` → harga dari tabel per-sport:
 *     tenis = booking_type × with_light; padel = jam (off-peak); lainnya = fallback.
 * - `with_light` hanya berpengaruh untuk lapangan tenis.
 * CHECK chk_booking_time (end > start) dijaga di sini juga.
 */
export const createBookingSchema = z
  .object({
    court_id: uuid,
    booking_type: z.enum(['insidentil', 'abonemen']).default('insidentil'),
    with_light: z.boolean().default(true),
    abonemen_id: uuid.optional(),
    booking_date: dateStr,
    start_time: timeStr,
    end_time: timeStr,
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: 'end_time harus lebih besar dari start_time',
    path: ['end_time'],
  });

export const listBookingQuerySchema = z.object({
  court_id: uuid.optional(),
  status: z.nativeEnum(booking_status).optional(),
  booking_date: dateStr.optional(),
  // scope=all hanya dihormati untuk admin (dicek di controller).
  scope: z.enum(['me', 'all']).default('me'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const bookingIdParamSchema = z.object({
  id: uuid,
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>;
export type ListBookingQuery = z.infer<typeof listBookingQuerySchema>;
