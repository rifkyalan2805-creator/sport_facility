/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');

/**
 * Global setup integration test.
 * PERINGATAN: menjalankan `prisma db push --accept-data-loss` → DB yang
 * ditunjuk DATABASE_URL akan disesuaikan dengan schema (DATA BISA HILANG).
 * Arahkan DATABASE_URL ke database TEST yang disposable, bukan production.
 */
module.exports = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL belum di-set. Arahkan ke database TEST sebelum menjalankan test:integration.'
    );
  }

  // Extension uuid-ossp harus ada sebelum tabel dibuat (default uuid_generate_v4()).
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  } finally {
    await prisma.$disconnect();
  }

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
  });
};
