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

const fullSub = (o: Record<string, unknown> = {}) => ({
  userId: 'u1',
  planId: 'plan1',
  autoRenew: false,
  memberName: 'Budi',
  birthDate: '1990-05-01',
  gender: 'laki_laki' as const,
  city: 'Jakarta',
  photoUrl: '/uploads/member-photos/x.png',
  medicalNotes: undefined,
  startDate: '2999-01-10', // masa depan → lolos guard tanggal lampau
  termsAccepted: true,
  marketingOptIn: false,
  ...o,
});

describe('MembershipService.subscribe', () => {
  it('membuat membership pending + simpan data member + payment dummy', async () => {
    const { service, plans, memberships, payments } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);
    (memberships.findActiveOrPending as jest.Mock).mockResolvedValue(null);
    (memberships.create as jest.Mock).mockResolvedValue({ id: 'um1' });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1', status: 'pending' });

    const result = await service.subscribe(fullSub());

    const createArg = (memberships.create as jest.Mock).mock.calls[0][0];
    expect(createArg.status).toBe('pending');
    expect(createArg.member_name).toBe('Budi');
    expect(createArg.photo_url).toBe('/uploads/member-photos/x.png');
    expect(createArg.terms_accepted_at).toBeInstanceOf(Date);
    expect(createArg.marketing_opt_in_at).toBeNull(); // opt-out → null
    // end = start + durasi paket (30 hari)
    expect(createArg.end_date.getTime() - createArg.start_date.getTime()).toBe(30 * 86400000);
    expect(payments.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        items: [expect.objectContaining({ itemType: 'membership', itemId: 'um1', unitPrice: 650000 })],
      })
    );
    expect(result).toEqual({ membership: { id: 'um1' }, payment: { id: 'pay1', status: 'pending' } });
  });

  it('mengisi marketing_opt_in_at saat opt-in', async () => {
    const { service, plans, memberships, payments } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);
    (memberships.findActiveOrPending as jest.Mock).mockResolvedValue(null);
    (memberships.create as jest.Mock).mockResolvedValue({ id: 'um1' });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });

    await service.subscribe(fullSub({ marketingOptIn: true }));
    const createArg = (memberships.create as jest.Mock).mock.calls[0][0];
    expect(createArg.marketing_opt_in).toBe(true);
    expect(createArg.marketing_opt_in_at).toBeInstanceOf(Date);
  });

  it('menolak (422) jika consent S&K tidak disetujui', async () => {
    const { service, plans } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);

    await expect(service.subscribe(fullSub({ termsAccepted: false }))).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it('menolak (400) jika start_date di masa lalu', async () => {
    const { service, plans } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);

    await expect(service.subscribe(fullSub({ startDate: '2000-01-01' }))).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('menolak (404) jika plan tidak ada/aktif', async () => {
    const { service, plans } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(null);

    await expect(service.subscribe(fullSub({ planId: 'x' }))).rejects.toMatchObject({ statusCode: 404 });
  });

  it('menolak (409) jika sudah ada membership aktif/pending', async () => {
    const { service, plans, memberships } = build();
    (plans.findActiveById as jest.Mock).mockResolvedValue(plan);
    (memberships.findActiveOrPending as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(service.subscribe(fullSub())).rejects.toMatchObject({ statusCode: 409 });
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
