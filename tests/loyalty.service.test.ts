jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { LoyaltyService } from '../src/services/loyalty.service';
import { LoyaltyPointsRepository } from '../src/repositories/loyaltyPoints.repository';
import { PointsTransactionRepository } from '../src/repositories/pointsTransaction.repository';
import { SiteSettingRepository } from '../src/repositories/siteSetting.repository';

const mockPoints = () =>
  ({ findByUser: jest.fn(), create: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<LoyaltyPointsRepository>);
const mockTxs = () =>
  ({ create: jest.fn(), findManyByUser: jest.fn() } as unknown as jest.Mocked<PointsTransactionRepository>);
const mockSettings = () =>
  ({ findByKey: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<SiteSettingRepository>);

function build() {
  const points = mockPoints();
  const txs = mockTxs();
  const settings = mockSettings();
  return { service: new LoyaltyService(points, txs, settings), points, txs, settings };
}

describe('LoyaltyService.earn', () => {
  it('user baru: 1 poin per Rp10.000 (default rate)', async () => {
    const { service, points, txs } = build();
    (points.findByUser as jest.Mock).mockResolvedValue(null);

    await service.earn('u1', 200000, 'pay1');

    // 200000/10000 * 1 = 20 poin
    expect(points.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', total_points: 20 }),
      expect.anything()
    );
    expect(txs.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'earn', points: 20, balance: 20, ref_id: 'pay1' }),
      expect.anything()
    );
  });

  it('user lama: menambah ke total & hitung balance', async () => {
    const { service, points, txs } = build();
    (points.findByUser as jest.Mock).mockResolvedValue({
      id: 'lp1',
      total_points: 100,
      used_points: 30,
      expired_points: 0,
    });

    await service.earn('u1', 100000, 'pay2'); // +10 poin → total 110, balance 110-30 = 80

    expect(points.update).toHaveBeenCalledWith('lp1', { total_points: 110 }, expect.anything());
    expect(txs.create).toHaveBeenCalledWith(
      expect.objectContaining({ points: 10, balance: 80 }),
      expect.anything()
    );
  });

  it('tidak membuat transaksi jika poin = 0 (amount < 10.000)', async () => {
    const { service, points, txs } = build();
    (points.findByUser as jest.Mock).mockResolvedValue(null);

    await service.earn('u1', 5000, 'pay3');

    expect(txs.create).not.toHaveBeenCalled();
    expect(points.create).not.toHaveBeenCalled();
  });

  it('menghormati rate dari site_settings', async () => {
    const { service, points, settings } = build();
    (settings.findByKey as jest.Mock).mockResolvedValue({ value: { per_10000: 2 } });
    (points.findByUser as jest.Mock).mockResolvedValue(null);

    await service.earn('u1', 100000, 'pay4'); // 10 * 2 = 20 poin

    expect(points.create).toHaveBeenCalledWith(
      expect.objectContaining({ total_points: 20 }),
      expect.anything()
    );
  });
});
