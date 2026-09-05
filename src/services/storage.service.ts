import { nanoid } from 'nanoid';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { EXT_BY_MIME } from '../config/upload';
import { AppError } from '../utils/AppError';

/**
 * Prefix URL publik sebuah bucket — dipakai juga validator untuk memverifikasi
 * asal foto. Nama bucket ikut disertakan agar URL dari bucket publik LAIN di
 * project ini tidak ikut lolos validasi.
 *
 * Memakai encodeURI (bukan encodeURIComponent) supaya persis sama dengan cara
 * getPublicUrl() menyusun URL-nya; keduanya berbeda untuk nama bucket yang
 * mengandung karakter seperti & = + $ , : ; @ yang diizinkan Supabase.
 */
export function publicUrlPrefix(bucket: string): string {
  return encodeURI(`${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/`);
}

/** Prefix bucket foto member card (dipakai membership.validator). */
export const PUBLIC_URL_PREFIX = publicUrlPrefix(env.SUPABASE_STORAGE_BUCKET);

/** Prefix bucket foto profil akun (dipakai auth.validator). */
export const AVATAR_URL_PREFIX = publicUrlPrefix(env.SUPABASE_AVATAR_BUCKET);

/**
 * Penyimpanan file di Supabase Storage.
 * Bucket bersifat publik, jadi URL yang dikembalikan permanen dan bisa langsung
 * dipakai di <img> tanpa perlu signed URL.
 */
export class StorageService {
  constructor(
    private readonly client = supabase,
    private readonly bucket = env.SUPABASE_STORAGE_BUCKET,
    private readonly avatarBucket = env.SUPABASE_AVATAR_BUCKET
  ) {}

  /** Unggah foto member card → URL publik absolut. */
  async uploadMemberPhoto(file: Express.Multer.File): Promise<string> {
    return this.upload(this.bucket, file);
  }

  /** Unggah foto profil akun → URL publik absolut. */
  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    return this.upload(this.avatarBucket, file);
  }

  /**
   * Unggah buffer multer ke bucket → URL publik absolut.
   * Nama objek diacak (nanoid) supaya nama file asli tidak bocor & tidak bentrok.
   *
   * Bucket sudah khusus per jenis foto, jadi objek diletakkan di root tanpa
   * prefix folder (kalau tidak, URL jadi .../avatar/avatar/x.png).
   */
  private async upload(bucket: string, file: Express.Multer.File): Promise<string> {
    const objectPath = `${nanoid()}${EXT_BY_MIME[file.mimetype] ?? '.img'}`;

    const { error } = await this.client.storage.from(bucket).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000', // 1 tahun — nama objek unik, jadi aman di-cache lama
      upsert: false,
    });

    if (error) {
      // Kegagalan storage = dependensi eksternal bermasalah, bukan salah klien.
      throw new AppError(502, `Gagal menyimpan foto ke storage: ${error.message}`);
    }

    const { data } = this.client.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }
}

export const storageService = new StorageService();
