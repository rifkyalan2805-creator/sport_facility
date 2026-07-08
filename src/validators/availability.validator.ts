import { z } from 'zod';
import { booking_type } from '@prisma/client';

/**
 * Query availability. `booking_type` & `with_light` hanya berpengaruh untuk tenis
 * (menentukan tarif dari tennis_prices). Padel mengabaikannya.
 *
 * Catatan: `z.coerce.boolean()` TIDAK dipakai karena Boolean("false") === true.
 */
export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD'),
  booking_type: z.nativeEnum(booking_type).default('insidentil'),
  with_light: z
    .enum(['true', 'false'], { errorMap: () => ({ message: 'with_light harus "true" atau "false"' }) })
    .default('true')
    .transform((v) => v === 'true'),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
