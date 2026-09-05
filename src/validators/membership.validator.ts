import { z } from 'zod';
import { PUBLIC_URL_PREFIX } from '../services/storage.service';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative(),
  duration_days: z.coerce.number().int().positive(),
  max_bookings_month: z.coerce.number().int().min(0).default(0),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  benefits: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const updatePlanSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().nonnegative().optional(),
    duration_days: z.coerce.number().int().positive().optional(),
    max_bookings_month: z.coerce.number().int().min(0).optional(),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    benefits: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: 'Minimal satu field untuk diupdate',
  });

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');

export const subscribeSchema = z.object({
  plan_id: uuid,
  auto_renew: z.boolean().default(false),
  // Data member (untuk member card)
  member_name: z.string().min(1).max(150),
  birth_date: dateStr,
  gender: z.enum(['laki_laki', 'perempuan', 'lainnya']),
  city: z.string().min(1).max(120),
  // Hanya terima URL dari endpoint unggah kami: bucket Supabase (baru) atau
  // /uploads/ (legacy, foto sebelum migrasi). URL luar ditolak.
  photo_url: z
    .string()
    .refine(
      (v) => v.startsWith(PUBLIC_URL_PREFIX) || v.startsWith('/uploads/'),
      'photo_url harus hasil unggah dari endpoint /uploads/member-photo'
    ),
  medical_notes: z.string().max(2000).optional(),
  start_date: dateStr, // end_date dihitung server = start + durasi paket
  terms_accepted: z.boolean().default(false), // wajib true — ditegakkan di service (422)
  marketing_opt_in: z.boolean().default(false),
});

export const planIdParamSchema = z.object({ id: uuid });
export const membershipIdParamSchema = z.object({ id: uuid });

/** Query daftar member kolam di panel admin (reception & manajemen). */
export const listMembershipsQuerySchema = z.object({
  // Kelompok warna masa berlaku; kosong = semua.
  group: z.enum(['safe', 'warning', 'expired', 'inactive']).optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'pending']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePlanBody = z.infer<typeof createPlanSchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanSchema>;
export type SubscribeBody = z.infer<typeof subscribeSchema>;
export type ListMembershipsQuery = z.infer<typeof listMembershipsQuerySchema>;
