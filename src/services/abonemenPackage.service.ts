import {
  AbonemenPackageRepository,
  abonemenPackageRepository,
} from '../repositories/abonemenPackage.repository';

/**
 * AbonemenPackageService — paket abonemen sebagai sumber pilihan layanan
 * pada form registrasi abonemen.
 */
export class AbonemenPackageService {
  constructor(private readonly repo: AbonemenPackageRepository = abonemenPackageRepository) {}

  /** Daftar paket aktif untuk ditampilkan frontend. */
  listActive() {
    return this.repo.listActive();
  }
}

export const abonemenPackageService = new AbonemenPackageService();
