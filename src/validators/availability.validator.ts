import { z } from 'zod';

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD'),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
