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
 * Create booking. booking_type menentukan field wajib:
 * - insidentil: tidak butuh abonemen_id
 * - abonemen  : abonemen_id wajib
 * CHECK chk_booking_time (end > start) dijaga di sini juga.
 */
export const createBookingSchema = z
  .object({
    court_id: uuid,
    booking_type: z.enum(['insidentil', 'abonemen']).default('insidentil'),
    abonemen_id: uuid.optional(),
    booking_date: dateStr,
    start_time: timeStr,
    end_time: timeStr,
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: 'end_time harus lebih besar dari start_time',
    path: ['end_time'],
  })
  .refine((d) => d.booking_type !== 'abonemen' || !!d.abonemen_id, {
    message: 'abonemen_id wajib diisi untuk booking_type abonemen',
    path: ['abonemen_id'],
  });

export const listBookingQuerySchema = z.object({
  court_id: uuid.optional(),
  status: z.nativeEnum(booking_status).optional(),
  booking_date: dateStr.optional(),
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
