import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { AppError } from '../utils/AppError';
import { storageService, StorageService } from '../services/storage.service';

export class UploadController {
  constructor(private readonly storage: StorageService = storageService) {}

  /** Unggah foto member card ke Supabase Storage → balas URL publik absolut. */
  memberPhoto = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.unprocessable('File foto wajib diunggah (field "photo")');
    }
    const url = await this.storage.uploadMemberPhoto(req.file);
    res.status(HttpStatus.CREATED).json({ success: true, data: { url } });
  });

  /**
   * Unggah foto profil akun → balas URL publik absolut.
   * URL-nya belum tersimpan di sini; klien mengirimkannya lewat PATCH /auth/me.
   */
  avatar = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.unprocessable('File foto wajib diunggah (field "photo")');
    }
    const url = await this.storage.uploadAvatar(req.file);
    res.status(HttpStatus.CREATED).json({ success: true, data: { url } });
  });

  /**
   * Unggah gambar konten CMS (cover berita, foto galeri, banner) → URL publik.
   * Seperti avatar: URL-nya belum tersimpan, admin mengirimkannya lewat
   * POST/PATCH resource CMS terkait.
   */
  contentImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.unprocessable('File gambar wajib diunggah (field "photo")');
    }
    const url = await this.storage.uploadContentImage(req.file);
    res.status(HttpStatus.CREATED).json({ success: true, data: { url } });
  });
}

export const uploadController = new UploadController();
