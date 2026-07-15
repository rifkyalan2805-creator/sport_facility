import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { AppError } from '../utils/AppError';

export class UploadController {
  /** Balas URL relatif file yang tersimpan (disajikan via /uploads). */
  memberPhoto = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.unprocessable('File foto wajib diunggah (field "photo")');
    }
    const url = `/uploads/member-photos/${req.file.filename}`;
    res.status(HttpStatus.CREATED).json({ success: true, data: { url } });
  });
}

export const uploadController = new UploadController();
