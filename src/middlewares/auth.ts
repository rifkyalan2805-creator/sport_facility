import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Verifikasi JWT access token dari header `Authorization: Bearer <token>`.
 * Mengisi req.userId & req.userRole untuk dipakai controller/service.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized: token tidak ada'));
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    next(new AppError(401, 'Unauthorized: token tidak valid atau kedaluwarsa'));
  }
};

/**
 * Versi longgar dari requireAuth: mengisi req.userId/req.userRole bila ada
 * token yang valid, dan MEMBIARKAN request lanjut kalau tidak ada / tidak
 * valid. Dipakai endpoint yang publik tapi perlu tahu apakah pemanggilnya
 * admin — mis. list CMS: publik hanya dapat konten aktif/published,
 * admin dapat draft juga.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length).trim());
    req.userId = payload.sub;
    req.userRole = payload.role;
  } catch {
    // Token busuk/kedaluwarsa diperlakukan sama dengan tanpa token — endpoint
    // ini memang publik, jadi jangan menolak; cukup jangan beri hak admin.
  }
  next();
};

/** Guard berbasis role (opsional). */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError(403, 'Forbidden: role tidak diizinkan'));
    }
    next();
  };
