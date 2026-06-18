import { createHash, randomBytes } from 'crypto';

/** Refresh token plain (dikirim ke client). */
export const generateRefreshToken = (): string => randomBytes(48).toString('hex');

/** Hash refresh token (disimpan di DB, bukan plain text). */
export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
