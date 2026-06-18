import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../utils/httpStatus';
import { env } from '../config/env';

// 404 untuk route yang tidak terdaftar.
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
};

// Error handler global — satu-satunya tempat membentuk error response.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Map error Prisma yang umum ke HTTP yang tepat.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'Data melanggar unique constraint',
        meta: err.meta,
      });
    }
    if (err.code === 'P2003') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Foreign key tidak valid',
        meta: err.meta,
      });
    }
    if (err.code === 'P2025') {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Record tidak ditemukan',
      });
    }
  }

  // Unknown / programmer error.
  console.error('[UNHANDLED ERROR]', err);
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Terjadi kesalahan internal',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
