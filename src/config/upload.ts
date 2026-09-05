import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AppError } from '../utils/AppError';

// LEGACY — foto lama (sebelum migrasi ke Supabase Storage) masih tersimpan di
// folder ini dan disajikan statis via /uploads agar member card lama tidak rusak.
// Upload BARU tidak lagi menulis ke sini; lihat services/storage.service.ts.
export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
export const MEMBER_PHOTOS_DIR = path.join(UPLOADS_ROOT, 'member-photos');

/** Pastikan folder upload legacy ada (dipanggil saat boot). */
export function ensureUploadDirs(): void {
  fs.mkdirSync(MEMBER_PHOTOS_DIR, { recursive: true });
}

// Mime yang diizinkan → ekstensi file.
export const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * Multer untuk foto member: 1 gambar, ≤2 MB, hanya JPG/PNG/WebP.
 * Memakai memoryStorage — file diteruskan sebagai buffer ke Supabase Storage
 * dan tidak pernah menyentuh disk (disk container hilang tiap redeploy).
 */
export const memberPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (EXT_BY_MIME[file.mimetype]) cb(null, true);
    else cb(new AppError(422, 'Hanya file gambar JPG, PNG, atau WebP'));
  },
});
