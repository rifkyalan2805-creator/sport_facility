import { AppError } from '../utils/AppError';
import {
  AbonemenRegistrationRepository,
  abonemenRegistrationRepository,
} from '../repositories/abonemenRegistration.repository';
import {
  AbonemenPackageRepository,
  abonemenPackageRepository,
} from '../repositories/abonemenPackage.repository';
import {
  CreateRegistrationInput,
  ListRegistrationFilter,
  ReviewRegistrationInput,
} from '../types/abonemenRegistration.types';

/**
 * AbonemenRegistrationService — aturan bisnis registrasi abonemen:
 * user mengajukan (pending) → admin approve/reject.
 */
export class AbonemenRegistrationService {
  constructor(
    private readonly repo: AbonemenRegistrationRepository = abonemenRegistrationRepository,
    private readonly packages: AbonemenPackageRepository = abonemenPackageRepository
  ) {}

  /** User mengajukan registrasi (status awal = pending). */
  async register(input: CreateRegistrationInput) {
    const pkg = await this.packages.findById(input.packageId);
    if (!pkg || !pkg.is_active) {
      throw AppError.notFound('Paket abonemen tidak ditemukan atau tidak aktif');
    }

    const existing = await this.repo.findActiveByUserAndPackage(input.userId, input.packageId);
    if (existing) {
      throw AppError.conflict(
        'Anda sudah memiliki pengajuan aktif (pending/approved) untuk paket ini'
      );
    }

    return this.repo.create({
      user_id: input.userId,
      package_id: input.packageId,
      full_name: input.fullName,
      phone: input.phone,
      communication_email: input.communicationEmail,
      notes: input.notes ?? null,
      status: 'pending',
    });
  }

  /** Daftar pengajuan milik user yang login. */
  listMine(userId: string) {
    return this.repo.findByUser(userId);
  }

  /** Daftar seluruh pengajuan (admin) dengan paginasi. */
  async listAll(filter: ListRegistrationFilter) {
    const { data, total } = await this.repo.findMany(filter);
    return {
      data,
      meta: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  /** Admin approve/reject sebuah pengajuan (hanya yang masih pending). */
  async review(input: ReviewRegistrationInput) {
    const reg = await this.repo.findById(input.registrationId);
    if (!reg) throw AppError.notFound('Pengajuan tidak ditemukan');
    if (reg.status !== 'pending') {
      throw AppError.unprocessable(
        `Pengajuan berstatus "${reg.status}" tidak bisa direview ulang`
      );
    }

    return this.repo.updateStatus(reg.id, {
      status: input.action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: input.adminId,
      reviewed_at: new Date(),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
  }
}

export const abonemenRegistrationService = new AbonemenRegistrationService();
