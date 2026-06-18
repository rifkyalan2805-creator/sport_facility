import { Prisma, PrismaClient } from '@prisma/client';
import { env } from './env';

// Single PrismaClient instance (connection pooling ditangani Prisma).
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Tipe client yang bisa berupa PrismaClient utama ATAU transaction client.
 * Dipakai repository agar method yang sama bisa dipanggil di dalam
 * maupun di luar transaksi (dependency injection sederhana via argumen).
 */
export type DbClient = PrismaClient | Prisma.TransactionClient;
