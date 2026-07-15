import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { AppError } from '../utils/AppError';

// Folder penyimpanan file upload (disk). Disajikan statis via /uploads.
export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
export const MEMBER_PHOTOS_DIR = path.join(UPLOADS_ROOT, 'member-photos');

/** Pastikan folder upload ada (dipanggil saat boot). */
export function ensureUploadDirs(): void {
  fs.mkdirSync(MEMBER_PHOTOS_DIR, { recursive: true });
}

// Mime yang diizinkan → ekstensi file.
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MEMBER_PHOTOS_DIR),
  filename: (_req, file, cb) => cb(null, `${nanoid()}${EXT_BY_MIME[file.mimetype] ?? '.img'}`),
});

/** Multer untuk foto member: 1 gambar, ≤2 MB, hanya JPG/PNG/WebP. */
export const memberPhotoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (EXT_BY_MIME[file.mimetype]) cb(null, true);
    else cb(new AppError(422, 'Hanya file gambar JPG, PNG, atau WebP'));
  },
});
