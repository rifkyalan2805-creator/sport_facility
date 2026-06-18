import { HttpStatus } from './httpStatus';

/**
 * Error operasional yang sudah diketahui (bukan bug).
 * Error handler global memetakan ini ke response yang sesuai.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, details?: unknown) {
    return new AppError(HttpStatus.BAD_REQUEST, msg, details);
  }
  static notFound(msg: string) {
    return new AppError(HttpStatus.NOT_FOUND, msg);
  }
  static conflict(msg: string) {
    return new AppError(HttpStatus.CONFLICT, msg);
  }
  static unprocessable(msg: string, details?: unknown) {
    return new AppError(HttpStatus.UNPROCESSABLE_ENTITY, msg, details);
  }
}
