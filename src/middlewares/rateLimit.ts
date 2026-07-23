import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env';

/**
 * Handler 429 seragam dengan envelope response aplikasi ({ success, message }),
 * bukan teks default express-rate-limit.
 */
const jsonTooMany = (message: string) => (_req: Request, res: Response) =>
  res.status(429).json({ success: false, message });

/**
 * Limiter global (longgar) — jaring pengaman anti-flood untuk seluruh API.
 * Key = IP klien (default keyGenerator; IP asli saat `trust proxy` aktif).
 */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7', // sertakan header RateLimit-* standar
  legacyHeaders: false, // matikan X-RateLimit-* lama
  handler: jsonTooMany('Terlalu banyak request. Coba lagi beberapa saat lagi.'),
});

/**
 * Limiter ketat khusus endpoint auth (login/register/refresh) — mempersempit
 * ruang brute-force password & credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonTooMany('Terlalu banyak percobaan. Coba lagi setelah beberapa saat.'),
});
