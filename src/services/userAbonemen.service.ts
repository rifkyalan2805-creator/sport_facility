import {
  ListAbonemenOptions,
  UserAbonemenRepository,
  userAbonemenRepository,
} from '../repositories/userAbonemen.repository';
import { expiryGroupOf } from '../utils/expiry';

/**
 * UserAbonemenService — pembacaan abonemen yang sudah BERJALAN
 * (hasil approval registrasi), untuk panel admin.
 *
 * Berbeda dari AbonemenRegistrationService yang menangani PENGAJUAN.
 */
export class UserAbonemenService {
  constructor(private readonly repo: UserAbonemenRepository = userAbonemenRepository) {}

  /**
   * Abonemen milik user yang sedang login (dashboard pengunjung).
   * `expiry_group` & `total_sessions` dihitung di sini supaya kartu sisa sesi
   * di UI tidak perlu menghitung ulang aturan yang sama.
   */
  async listMine(userId: string) {
    const rows = await this.repo.listForUser(userId);
    return rows.map((a) => {
      const pkg = a.abonemen_packages;
      return {
        ...a,
        expiry_group: expiryGroupOf(a.status, a.end_date),
        // Kuota awal paket = sesi/minggu × jumlah minggu. Dipakai sebagai
        // penyebut progress bar "sisa X dari Y sesi".
        total_sessions: pkg ? pkg.sessions_per_week * pkg.duration_weeks : null,
      };
    });
  }

  /**
   * Daftar abonemen berjalan. Tiap baris dilengkapi `expiry_group`
   * agar badge di UI memakai perhitungan yang sama dengan filternya.
   */
  async listAll(opts: ListAbonemenOptions) {
    const { data, total } = await this.repo.listForAdmin(opts);
    return {
      data: data.map((a) => ({
        ...a,
        expiry_group: expiryGroupOf(a.status, a.end_date),
      })),
      meta: {
        page: opts.page,
        limit: opts.limit,
        total,
        totalPages: Math.ceil(total / opts.limit),
      },
    };
  }
}

export const userAbonemenService = new UserAbonemenService();
