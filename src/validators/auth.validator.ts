import { z } from 'zod';
import { AVATAR_URL_PREFIX } from '../services/storage.service';

const phone = z
  .string()
  .regex(/^[0-9+()\-\s]{8,20}$/, 'Nomor telepon tidak valid')
  .max(20);

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid').max(255),
  phone,
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(150),
  // Nama panggilan — dipakai sbg keterangan subject di tabel-tabel admin.
  nickname: z
    .string()
    .trim()
    .min(2, 'Nama panggilan minimal 2 karakter')
    .max(60, 'Nama panggilan maksimal 60 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token wajib diisi'),
});

/**
 * Ubah profil sendiri (PATCH /auth/me). Semua field opsional — kirim hanya
 * yang berubah — tapi minimal satu harus ada.
 *
 * `email` & `password` sengaja TIDAK bisa diubah lewat sini: ganti email
 * menuntut verifikasi ulang (belum ada alurnya) dan ganti password butuh
 * endpoint sendiri yang memverifikasi password lama.
 */
export const updateMeSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(150).optional(),
    nickname: z
      .string()
      .trim()
      .min(2, 'Nama panggilan minimal 2 karakter')
      .max(60, 'Nama panggilan maksimal 60 karakter')
      .optional(),
    phone: phone.optional(),
    // Hanya terima URL dari endpoint unggah kami: bucket avatar (baru) atau
    // /uploads/ (legacy, hasil backfill foto member lama). URL luar ditolak.
    // null = hapus foto profil.
    photo_url: z
      .string()
      .refine(
        (v) => v.startsWith(AVATAR_URL_PREFIX) || v.startsWith('/uploads/'),
        'photo_url harus hasil unggah dari endpoint /uploads/avatar'
      )
      .nullable()
      .optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: 'Minimal satu field untuk diubah',
  });

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;
export type UpdateMeBody = z.infer<typeof updateMeSchema>;
