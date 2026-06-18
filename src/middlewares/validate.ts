import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Source = 'body' | 'query' | 'params';

/**
 * Middleware factory: memvalidasi salah satu bagian request dengan skema Zod.
 * Hasil parse (tertyped & dengan default) ditulis kembali ke req[source].
 */
export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        AppError.badRequest('Validasi gagal', result.error.flatten().fieldErrors)
      );
    }
    // query/params bersifat read-only di beberapa versi Express → assign aman.
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
