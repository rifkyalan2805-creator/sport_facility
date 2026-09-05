import { Router, Request, Response, NextFunction } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth';
import { memberPhotoUpload } from '../config/upload';
import { AppError } from '../utils/AppError';

const router = Router();

/**
 * Bungkus multer agar error (ukuran/tipe) jadi AppError yang rapi.
 * Dipakai bersama oleh foto member card dan foto profil — batasannya sama
 * (1 gambar, ≤2 MB, JPG/PNG/WebP); yang berbeda hanya bucket tujuannya.
 */
function uploadImage(req: Request, res: Response, next: NextFunction) {
  memberPhotoUpload.single('photo')(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    const msg = err instanceof Error ? err.message : 'Upload gagal';
    if (msg === 'File too large') return next(new AppError(422, 'Foto maksimal 2 MB'));
    next(new AppError(422, `Upload gagal: ${msg}`));
  });
}

/**
 * @openapi
 * /api/v1/uploads/member-photo:
 *   post:
 *     tags: [Uploads]
 *     summary: Unggah foto member (JPG/PNG/WebP, ≤2 MB) → { url }
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       201: { description: Terunggah — kembalikan url publik absolut }
 *       422: { description: File wajib / tipe salah / terlalu besar }
 */
router.post('/member-photo', requireAuth, uploadImage, uploadController.memberPhoto);

/**
 * @openapi
 * /api/v1/uploads/avatar:
 *   post:
 *     tags: [Uploads]
 *     summary: Unggah foto profil akun (JPG/PNG/WebP, ≤2 MB) → { url }
 *     description: >
 *       Hanya mengunggah berkasnya. Simpan URL yang dikembalikan ke profil
 *       dengan PATCH /api/v1/auth/me { photo_url }.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       201: { description: Terunggah — kembalikan url publik absolut }
 *       422: { description: File wajib / tipe salah / terlalu besar }
 *       502: { description: Supabase Storage gagal (mis. bucket tidak ada) }
 */
router.post('/avatar', requireAuth, uploadImage, uploadController.avatar);

export default router;
