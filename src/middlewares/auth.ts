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

/** Guard berbasis role (opsional). */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError(403, 'Forbidden: role tidak diizinkan'));
    }
    next();
  };
