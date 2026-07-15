import { Router, Request, Response, NextFunction } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth';
import { memberPhotoUpload } from '../config/upload';
import { AppError } from '../utils/AppError';

const router = Router();

/** Bungkus multer agar error (ukuran/tipe) jadi AppError yang rapi. */
function uploadMemberPhoto(req: Request, res: Response, next: NextFunction) {
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
 *       201: { description: Terunggah — kembalikan url relatif }
 *       422: { description: File wajib / tipe salah / terlalu besar }
 */
router.post('/member-photo', requireAuth, uploadMemberPhoto, uploadController.memberPhoto);

export default router;
