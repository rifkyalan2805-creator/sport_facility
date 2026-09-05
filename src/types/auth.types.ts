export interface RegisterInput {
  email: string;
  phone: string;
  fullName: string;
  nickname: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  /** Nama panggilan; null utk akun lama yg belum mengisi. */
  nickname: string | null;
  /** Foto profil: URL publik bucket avatar, atau path legacy "/uploads/...". */
  photo_url: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

/**
 * Field profil yang boleh diubah user sendiri.
 * `email` & `password` SENGAJA tidak ada di sini — mengubah email menuntut
 * alur verifikasi ulang yang belum tersedia, dan ganti password butuh
 * endpoint tersendiri (verifikasi password lama + revoke sesi lain).
 */
export interface UpdateProfileInput {
  fullName?: string;
  nickname?: string;
  phone?: string;
  /** null = hapus foto profil. */
  photoUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SafeUser;
}
