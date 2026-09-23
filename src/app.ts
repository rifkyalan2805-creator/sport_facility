import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimit';
import { UPLOADS_ROOT, ensureUploadDirs } from './config/upload';

/** Pecah CORS_ORIGINS (dipisah koma) menjadi array origin yang bersih. */
const parseOrigins = (raw?: string): string[] =>
  (raw ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

/**
 * Ubah 1 entri CORS_ORIGINS jadi matcher. Entri tanpa "*" dicocokkan persis;
 * entri dengan "*" (mis. untuk preview deployment Vercel yang subdomainnya
 * acak per-deploy: https://sport-facility-*-tim.vercel.app) dicocokkan lewat
 * regex, di mana "*" hanya boleh mewakili satu segmen alfanumerik/hyphen
 * (tidak boleh lompat "." ke domain lain).
 */
const originToMatcher = (raw: string): string | RegExp => {
  if (!raw.includes('*')) return raw;
  const pattern = raw
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[a-z0-9-]+');
  return new RegExp(`^${pattern}$`, 'i');
};

/**
 * Whitelist CORS. Origin yang tidak terdaftar tidak mendapat header CORS
 * (browser memblokir), tanpa melempar 500. Request tanpa header Origin
 * (same-origin, curl, server-to-server, health check) selalu diizinkan.
 */
const buildCorsOptions = (): CorsOptions => {
  let origins = parseOrigins(env.CORS_ORIGINS);
  if (origins.length === 0) {
    if (env.NODE_ENV === 'production') {
      console.warn(
        '[CORS] CORS_ORIGINS kosong di production — semua request lintas-origin akan ditolak. Set CORS_ORIGINS.'
      );
    } else {
      origins = ['http://localhost:3001']; // fallback DX untuk dev/test
    }
  }
  const matchers = origins.map(originToMatcher);

  return {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = matchers.some((m) => (typeof m === 'string' ? m === origin : m.test(origin)));
      return cb(null, allowed);
    },
    credentials: true,
  };
};

export const createApp = () => {
  const app = express();

  // Di belakang reverse proxy (production): percayai 1 hop agar req.ip = IP asli
  // klien — dipakai rate limiter & disimpan sebagai ip_address di session.
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json());

  // LEGACY — foto member sebelum migrasi ke Supabase Storage masih dilayani dari
  // disk agar member card lama tidak rusak. Upload baru langsung ke bucket.
  // CORP cross-origin agar <img> dari frontend (port beda) tidak diblokir helmet.
  ensureUploadDirs();
  app.use(
    '/uploads',
    express.static(UPLOADS_ROOT, {
      setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
    })
  );

  // Dokumentasi API
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

  // Rate limit global hanya untuk API (statis /uploads & /api/docs tidak dibatasi).
  app.use('/api/v1', globalLimiter, routes);

  // 404 + error handler global selalu terakhir.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
