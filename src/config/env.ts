import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Nilai secret yang dilarang: default lama & placeholder dari .env.example.
// Dipakai superRefine untuk menolak secret yang jelas tidak aman.
const WEAK_SECRETS = new Set<string>([
  'dev-access-secret-change-me',
  'dev-refresh-secret-change-me',
  'ganti-dengan-secret-acak-min-16-char',
  'ganti-dengan-secret-acak-lain-min-16-char',
]);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    // Auth (JWT) — WAJIB diisi, TANPA default. Pola ketat: dev pun butuh .env
    // berisi secret acak; proses gagal-cepat kalau kosong/terlalu pendek.
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET minimal 32 karakter'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET minimal 32 karakter'),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
    // CORS — daftar origin yang diizinkan, dipisah koma. Kosong = fallback dev (localhost:3001).
    CORS_ORIGINS: z.string().optional(),
    // Rate limiting — window & batas untuk limiter global dan khusus auth.
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  })
  .superRefine((val, ctx) => {
    const reject = (key: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message });

    // Kedua secret tidak boleh identik (kompromi salah satu = kompromi keduanya).
    if (val.JWT_ACCESS_SECRET === val.JWT_REFRESH_SECRET) {
      reject('JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET harus berbeda dari JWT_ACCESS_SECRET');
    }

    // Tolak placeholder/secret lemah yang diketahui — berlaku di SEMUA environment.
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (WEAK_SECRETS.has(val[key])) {
        reject(key, `${key} masih memakai nilai placeholder — ganti dengan secret acak`);
      }
    }

    // Penekanan lebih keras di production: minimal 48 karakter & tanpa kata umum.
    if (val.NODE_ENV === 'production') {
      for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
        const v = val[key];
        if (v.length < 48) reject(key, `${key} di production minimal 48 karakter`);
        if (/change|ganti|example|secret|password|123456/i.test(v)) {
          reject(key, `${key} di production terlihat lemah (mengandung kata umum)`);
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Gagal lebih awal jika konfigurasi environment tidak valid.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
