import { Prisma, users } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken } from '../utils/jwt';
import { generateRefreshToken, hashToken } from '../utils/token';
import {
  AuthResult,
  AuthTokens,
  LoginInput,
  RegisterInput,
  SafeUser,
  UpdateProfileInput,
} from '../types/auth.types';
import { UserRepository, userRepository } from '../repositories/user.repository';
import { SessionRepository, sessionRepository } from '../repositories/session.repository';
import { DbClient } from '../config/prisma';

export class AuthService {
  constructor(
    private readonly users: UserRepository = userRepository,
    private readonly sessions: SessionRepository = sessionRepository
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    if (await this.users.findByEmail(input.email)) {
      throw AppError.conflict('Email sudah terdaftar');
    }
    if (await this.users.findByPhone(input.phone)) {
      throw AppError.conflict('Nomor telepon sudah terdaftar');
    }

    const password_hash = await hashPassword(input.password);
    const user = await this.users.create({
      email: input.email,
      phone: input.phone,
      full_name: input.fullName,
      nickname: input.nickname,
      password_hash,
    });

    const tokens = await this.issueTokens(user, input.ip, input.userAgent);
    return { user: toSafeUser(user), ...tokens };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    // Pesan generik agar tidak membocorkan eksistensi akun.
    if (!user) throw new AppError(401, 'Email atau password salah');
    if (!user.is_active) throw new AppError(403, 'Akun tidak aktif');

    const ok = await verifyPassword(input.password, user.password_hash);
    if (!ok) throw new AppError(401, 'Email atau password salah');

    const tokens = await this.issueTokens(user, input.ip, input.userAgent);
    return { user: toSafeUser(user), ...tokens };
  }

  /** Rotasi refresh token: revoke yang lama, terbitkan yang baru. */
  async refresh(refreshToken: string, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.sessions.findByTokenHash(tokenHash);

    if (!session || session.is_revoked) {
      throw new AppError(401, 'Refresh token tidak valid');
    }
    if (session.expired_at.getTime() < Date.now()) {
      throw new AppError(401, 'Refresh token kedaluwarsa');
    }

    return prisma.$transaction(async (tx) => {
      await this.sessions.revoke(session.id, tx);
      return this.issueTokens(session.users, ip, userAgent, tx);
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessions.findByTokenHash(hashToken(refreshToken));
    if (session && !session.is_revoked) {
      await this.sessions.revoke(session.id);
    }
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.users.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    return toSafeUser(user);
  }

  /**
   * Ubah profil sendiri. Hanya field yang dikirim yang disentuh, jadi
   * mengirim { nickname } tidak mengosongkan yang lain.
   */
  async updateMe(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const current = await this.users.findById(userId);
    if (!current) throw AppError.notFound('User tidak ditemukan');

    // Cek duplikat nomor hanya bila benar-benar berganti — kalau tidak, user
    // yang menyimpan form tanpa mengubah telepon akan bentrok dgn dirinya sendiri.
    if (input.phone !== undefined && input.phone !== current.phone) {
      const taken = await this.users.findByPhone(input.phone);
      if (taken) throw AppError.conflict('Nomor telepon sudah terdaftar');
    }

    const data: Prisma.usersUncheckedUpdateInput = {
      // Kolom users.updated_at tidak memakai @updatedAt, jadi diisi manual.
      updated_at: new Date(),
    };
    if (input.fullName !== undefined) data.full_name = input.fullName;
    if (input.nickname !== undefined) data.nickname = input.nickname;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.photoUrl !== undefined) data.photo_url = input.photoUrl;

    try {
      return toSafeUser(await this.users.update(userId, data));
    } catch (err) {
      // Pengaman balapan: dua request menyimpan nomor sama secara bersamaan
      // lolos pengecekan di atas, unique constraint DB yang menangkapnya.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw AppError.conflict('Nomor telepon sudah terdaftar');
      }
      throw err;
    }
  }

  // ---- helpers ----

  private async issueTokens(
    user: users,
    ip?: string,
    userAgent?: string,
    db?: DbClient
  ): Promise<AuthTokens> {
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken();
    const expiredAt = new Date(
      Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    await this.sessions.create(
      {
        user_id: user.id,
        refresh_token: hashToken(refreshToken),
        ip_address: ip ?? null,
        user_agent: userAgent ?? null,
        expired_at: expiredAt,
      },
      db
    );

    return { accessToken, refreshToken };
  }
}

export function toSafeUser(user: users): SafeUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    full_name: user.full_name,
    nickname: user.nickname,
    photo_url: user.photo_url,
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };
}

export const authService = new AuthService();
