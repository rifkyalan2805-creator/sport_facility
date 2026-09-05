import { z } from 'zod';

/** Query daftar abonemen berjalan di panel admin (reception & manajemen). */
export const listAbonemenQuerySchema = z.object({
  // Kelompok masa berlaku; kosong = semua.
  group: z.enum(['safe', 'warning', 'expired', 'inactive']).optional(),
  status: z.enum(['active', 'expired', 'cancelled']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListAbonemenQuery = z.infer<typeof listAbonemenQuerySchema>;
