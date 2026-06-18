jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { Prisma } from '@prisma/client';
import { MembershipService } from '../src/services/membership.service';
import { MembershipPlanRepository } from '../src/repositories/membershipPlan.repository';
import { UserMembershipRepository } from '../src/repositories/userMembership.repository';
import { PaymentService } from '../src/services/payment.service';

const mockPlans = () =>
  ({
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<MembershipPlanRepository>);

const mockMemberships = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findManyByUser: jest.fn(),
    findActiveOrPending: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<UserMembershipRepository>);

const mockPayments = () =>
  ({ createPayment: jest.fn() } as unknown as jest.Mocked<PaymentService>);

function build() {
  const plans = mockPlans();
  const memberships = mockMemberships();
  const payments = mockPayments();
  return { service: new MembershipService(plans, memberships, payments), plans, memberships, payments };
}

const plan = {
  id: 'plan1',
  name: 'Gold',
  price: new Prisma.Decimal(650000),
  duration_days: 30,
};

describe('MembershipService.createPlan', () => {
  it('auto-generate slug dari name jika slug kosong & simpan Decimal', async () => {
    const { service, plans } = build();
    (plans.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createPlan({
      name: 'Gold Plan',
      price: 650000,
      durationDays: 30,
      maxBookingsMonth: 15,
      discountPercent: 15,
      benefits: ['Diskon 15%'],
      isActive: true,
      sortOrder: 0,
    });

    const arg = (plans.create as jest.Mock).mock.calls[0][0];
    expect(arg.slug).toBe('gold-plan');
    expect(arg.price.toString()).toBe('650000');
  });
});

describe('MembershipService.subscribe', () => {
  it('membuat membership pending + payment dummy', async () => {
    const { service, plans, memberships, payments } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);
    (memberships.findActiveOrPending as jest.Mock).mockResolvedValue(null);
    (memberships.create as jest.Mock).mockResolvedValue({ id: 'um1' });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1', status: 'pending' });

    const result = await service.subscribe({ userId: 'u1', planId: 'plan1', autoRenew: false });

    const createArg = (memberships.create as jest.Mock).mock.calls[0][0];
    expect(createArg.status).toBe('pending');
    expect(payments.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        items: [expect.objectContaining({ itemType: 'membership', itemId: 'um1', unitPrice: 650000 })],
      })
    );
    expect(result).toEqual({ membership: { id: 'um1' }, payment: { id: 'pay1', status: 'pending' } });
  });

  it('menolak (404) jika plan tidak ada/aktif', async () => {
    const { service, plans } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.subscribe({ userId: 'u1', planId: 'x', autoRenew: false })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('menolak (409) jika sudah ada membership aktif/pending', async () => {
    const { service, plans, memberships } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);
    (memberships.findActiveOrPending as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(
      service.subscribe({ userId: 'u1', planId: 'plan1', autoRenew: false })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('MembershipService.cancel', () => {
  it('menolak (403) jika membership milik user lain', async () => {
    const { service, memberships } = build();
    (memberships.findById as jest.Mock).mockResolvedValue({ id: 'm1', user_id: 'other', status: 'active' });

    await expect(service.cancel({ id: 'm1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 403 });
  });

  it('menolak (422) jika status sudah expired', async () => {
    const { service, memberships } = build();
    (memberships.findById as jest.Mock).mockResolvedValue({ id: 'm1', user_id: 'u1', status: 'expired' });

    await expect(service.cancel({ id: 'm1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 422 });
  });
});
