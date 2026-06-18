import { prisma, DbClient } from '../config/prisma';
import {
  LoyaltyPointsRepository,
  loyaltyPointsRepository,
} from '../repositories/loyaltyPoints.repository';
import {
  PointsTransactionRepository,
  pointsTransactionRepository,
} from '../repositories/pointsTransaction.repository';
import {
  SiteSettingRepository,
  siteSettingRepository,
} from '../repositories/siteSetting.repository';

export class LoyaltyService {
  constructor(
    private readonly points: LoyaltyPointsRepository = loyaltyPointsRepository,
    private readonly txs: PointsTransactionRepository = pointsTransactionRepository,
    private readonly settings: SiteSettingRepository = siteSettingRepository
  ) {}

  /** Ringkasan saldo poin user. */
  async getSummary(userId: string) {
    const lp = await this.points.findByUser(userId);
    const total = lp?.total_points ?? 0;
    const used = lp?.used_points ?? 0;
    const expired = lp?.expired_points ?? 0;
    return { total_points: total, used_points: used, expired_points: expired, available: total - used - expired };
  }

  listTransactions(userId: string) {
    return this.txs.findManyByUser(userId);
  }

  /**
   * Tambah poin saat pembayaran lunas. Dipanggil PaymentService di dalam
   * transaksi pembayaran (db = tx). Rate dari site_settings point_earn_rate.
   */
  async earn(userId: string, amount: number, refId: string, db: DbClient = prisma) {
    const rate = await this.getEarnRate();
    const points = Math.floor(amount / 10000) * rate;
    if (points <= 0) return; // CHECK points != 0 → lewati jika tidak dapat poin

    const existing = await this.points.findByUser(userId, db);
    const prevTotal = existing?.total_points ?? 0;
    const used = existing?.used_points ?? 0;
    const expired = existing?.expired_points ?? 0;
    const newTotal = prevTotal + points;

    if (existing) {
      await this.points.update(existing.id, { total_points: newTotal }, db);
    } else {
      await this.points.create({ user_id: userId, total_points: newTotal }, db);
    }

    const balance = newTotal - used - expired;
    await this.txs.create(
      {
        user_id: userId,
        type: 'earn',
        points,
        balance,
        description: 'Poin dari pembayaran',
        ref_id: refId,
      },
      db
    );
  }

  private async getEarnRate(): Promise<number> {
    const setting = await this.settings.findByKey('point_earn_rate');
    const value = setting?.value as { per_10000?: number } | null;
    return value?.per_10000 ?? 1;
  }
}

export const loyaltyService = new LoyaltyService();
