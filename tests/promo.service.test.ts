jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { Prisma } from '@prisma/client';
import { PromoService } from '../src/services/promo.service';
import { PromoRepository } from '../src/repositories/promo.repository';

const mockPromos = () =>
  ({
    findByCode: jest.fn(),
    findById: jest.fn(),
    listAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    incrementUsed: jest.fn(),
  } as unknown as jest.Mocked<PromoRepository>);

function build() {
  const promos = mockPromos();
  return { service: new PromoService(promos), promos };
}

const basePromo = {
  id: 'promo1',
  code: 'HEMAT20',
  type: 'percentage',
  discount_value: new Prisma.Decimal(20),
  max_discount: null,
  min_purchase: new Prisma.Decimal(0),
  quota: 10,
  used_count: 0,
  applicable_to: ['all'],
  is_active: true,
  valid_from: new Date('2000-01-01'),
  valid_until: new Date('2999-12-31'),
};

describe('PromoService.validate', () => {
  it('percentage: menghitung diskon = amount * value%', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue(basePromo);

    const res = await service.validate('HEMAT20', 200000, ['booking']);
    expect(res.discountAmount).toBe(40000);
  });

  it('percentage: dibatasi max_discount', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue({ ...basePromo, max_discount: new Prisma.Decimal(25000) });

    const res = await service.validate('HEMAT20', 200000, ['booking']);
    expect(res.discountAmount).toBe(25000);
  });

  it('fixed_amount: diskon nilai tetap (tidak melebihi amount)', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue({
      ...basePromo,
      type: 'fixed_amount',
      discount_value: new Prisma.Decimal(50000),
    });

    const res = await service.validate('HEMAT20', 30000, ['booking']);
    expect(res.discountAmount).toBe(30000);
  });

  it('menolak (422) jika kuota habis', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue({ ...basePromo, used_count: 10 });

    await expect(service.validate('HEMAT20', 200000)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (422) jika di bawah min_purchase', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue({ ...basePromo, min_purchase: new Prisma.Decimal(100000) });

    await expect(service.validate('HEMAT20', 50000)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (422) jika tidak berlaku untuk item_type', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue({ ...basePromo, applicable_to: ['membership'] });

    await expect(service.validate('HEMAT20', 200000, ['booking'])).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (422) jika promo tidak aktif / tidak ada', async () => {
    const { service, promos } = build();
    (promos.findByCode as jest.Mock).mockResolvedValue(null);

    await expect(service.validate('XXX', 200000)).rejects.toMatchObject({ statusCode: 422 });
  });
});
