jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { Prisma } from '@prisma/client';
import { PoolService } from '../src/services/pool.service';
import { PoolSessionRepository } from '../src/repositories/poolSession.repository';
import { PoolTicketTypeRepository } from '../src/repositories/poolTicketType.repository';
import { PoolTicketRepository } from '../src/repositories/poolTicket.repository';
import { SiteSettingRepository } from '../src/repositories/siteSetting.repository';
import { PaymentService } from '../src/services/payment.service';

const TIERS = [
  { minQty: 15, percent: 10 },
  { minQty: 30, percent: 12.5 },
  { minQty: 50, percent: 20 },
];

const mockSessions = () =>
  ({
    listUpcoming: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    acquireLock: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<PoolSessionRepository>);

const mockTicketTypes = () =>
  ({
    listActive: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<PoolTicketTypeRepository>);

const mockTickets = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findManyByUser: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<PoolTicketRepository>);

const mockPayments = () =>
  ({ createPayment: jest.fn() } as unknown as jest.Mocked<PaymentService>);

const mockSettings = () =>
  ({
    findByKey: jest.fn().mockResolvedValue({ value: { tiers: TIERS } }),
  } as unknown as jest.Mocked<SiteSettingRepository>);

function build() {
  const sessions = mockSessions();
  const ticketTypes = mockTicketTypes();
  const tickets = mockTickets();
  const payments = mockPayments();
  const settings = mockSettings();
  return {
    service: new PoolService(sessions, ticketTypes, tickets, payments, settings),
    sessions,
    ticketTypes,
    tickets,
    payments,
    settings,
  };
}

const openSession = {
  id: 's1',
  status: 'open',
  capacity: 10,
  booked_count: 4,
  session_date: new Date('2999-06-20'),
};

const ticketType = { id: 'tt1', price: new Prisma.Decimal(50000) };

const buyInput = { userId: 'u1', sessionId: 's1', ticketTypeId: 'tt1', quantity: 2 };

describe('PoolService.buyTicket', () => {
  it('reservasi tiket, naikkan booked_count, lalu buat payment dummy', async () => {
    const { service, sessions, ticketTypes, tickets, payments } = build();
    (sessions.findById as jest.Mock).mockResolvedValue(openSession);
    (ticketTypes.findActiveById as jest.Mock).mockResolvedValue(ticketType);
    (tickets.create as jest.Mock).mockResolvedValue({ id: 't1', quantity: 2, unit_price: new Prisma.Decimal(50000) });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });

    const result = await service.buyTicket(buyInput);

    // booked_count 4 + 2 = 6 (< 10 → tetap open)
    expect(sessions.update).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ booked_count: 6, status: 'open' }),
      expect.anything()
    );
    expect(payments.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ itemType: 'pool_ticket', itemId: 't1' })],
      })
    );
    expect(result).toEqual({ ticket: expect.objectContaining({ id: 't1' }), payment: { id: 'pay1' } });
  });

  it('set status full ketika kuota tepat penuh', async () => {
    const { service, sessions, ticketTypes, tickets, payments } = build();
    (sessions.findById as jest.Mock).mockResolvedValue({ ...openSession, booked_count: 8 });
    (ticketTypes.findActiveById as jest.Mock).mockResolvedValue(ticketType);
    (tickets.create as jest.Mock).mockResolvedValue({ id: 't1', quantity: 2, unit_price: new Prisma.Decimal(50000) });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });

    await service.buyTicket(buyInput);

    expect(sessions.update).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ booked_count: 10, status: 'full' }),
      expect.anything()
    );
  });

  it('menolak (422) jika kuota tidak mencukupi', async () => {
    const { service, sessions, ticketTypes, tickets } = build();
    (sessions.findById as jest.Mock).mockResolvedValue({ ...openSession, booked_count: 9 });
    (ticketTypes.findActiveById as jest.Mock).mockResolvedValue(ticketType);

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 422 });
    expect(tickets.create).not.toHaveBeenCalled();
  });

  it('menolak (422) jika sesi tidak open', async () => {
    const { service, sessions } = build();
    (sessions.findById as jest.Mock).mockResolvedValue({ ...openSession, status: 'closed' });

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (404) jika sesi tidak ada', async () => {
    const { service, sessions } = build();
    (sessions.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('PoolService.checkout (diskon grup)', () => {
  const bigSession = { id: 's1', status: 'open', capacity: 100, booked_count: 0, session_date: new Date('2999-06-20') };
  const htm = { id: 'tt1', name: 'HTM Kolam Renang', price: new Prisma.Decimal(50000) };

  function setup(qty: number) {
    const b = build();
    (b.sessions.findById as jest.Mock).mockResolvedValue(bigSession);
    (b.ticketTypes.findActiveById as jest.Mock).mockResolvedValue(htm);
    (b.tickets.create as jest.Mock).mockResolvedValue({ id: 't1', quantity: qty, unit_price: new Prisma.Decimal(50000) });
    (b.payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });
    return b;
  }

  it('10 orang → tanpa diskon (discount_amount 0)', async () => {
    const b = setup(10);
    const res = await b.service.checkout({ userId: 'u1', sessionId: 's1', items: [{ ticketTypeId: 'tt1', quantity: 10 }] });
    const arg = (b.payments.createPayment as jest.Mock).mock.calls[0][0];
    expect(arg.discountAmount).toBe(0);
    expect(res.discount).toEqual({ percent: 0, amount: 0, totalQty: 10 });
    expect(b.sessions.update).toHaveBeenCalledWith('s1', expect.objectContaining({ booked_count: 10, status: 'open' }), expect.anything());
  });

  it('30 orang → diskon 12,5% (Rp187.500 dari Rp1.500.000)', async () => {
    const b = setup(30);
    const res = await b.service.checkout({ userId: 'u1', sessionId: 's1', items: [{ ticketTypeId: 'tt1', quantity: 30 }] });
    const arg = (b.payments.createPayment as jest.Mock).mock.calls[0][0];
    expect(arg.discountAmount).toBe(187500); // 30×50.000×12,5%
    expect(res.discount.percent).toBe(12.5);
    expect(arg.items[0]).toEqual(expect.objectContaining({ itemType: 'pool_ticket', itemId: 't1', quantity: 30 }));
  });

  it('50 orang → diskon 20%', async () => {
    const b = setup(50);
    await b.service.checkout({ userId: 'u1', sessionId: 's1', items: [{ ticketTypeId: 'tt1', quantity: 50 }] });
    const arg = (b.payments.createPayment as jest.Mock).mock.calls[0][0];
    expect(arg.discountAmount).toBe(500000); // 50×50.000×20%
  });

  it('menolak (422) jika kuota tidak mencukupi', async () => {
    const b = build();
    (b.sessions.findById as jest.Mock).mockResolvedValue({ ...bigSession, capacity: 10, booked_count: 5 });
    (b.ticketTypes.findActiveById as jest.Mock).mockResolvedValue(htm);
    await expect(
      b.service.checkout({ userId: 'u1', sessionId: 's1', items: [{ ticketTypeId: 'tt1', quantity: 10 }] })
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(b.tickets.create).not.toHaveBeenCalled();
    expect(b.payments.createPayment).not.toHaveBeenCalled();
  });
});

describe('PoolService.cancelTicket', () => {
  it('membatalkan tiket & mengembalikan kuota', async () => {
    const { service, sessions, tickets } = build();
    (tickets.findById as jest.Mock)
      .mockResolvedValueOnce({ id: 't1', user_id: 'u1', status: 'active', session_id: 's1', quantity: 2 })
      .mockResolvedValueOnce({ id: 't1', status: 'cancelled' });
    (sessions.findById as jest.Mock).mockResolvedValue({ id: 's1', booked_count: 6, status: 'full' });

    await service.cancelTicket({ id: 't1', userId: 'u1' });

    expect(tickets.update).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ status: 'cancelled' }),
      expect.anything()
    );
    expect(sessions.update).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ booked_count: 4, status: 'open' }),
      expect.anything()
    );
  });

  it('menolak (403) jika tiket milik user lain', async () => {
    const { service, tickets } = build();
    (tickets.findById as jest.Mock).mockResolvedValue({ id: 't1', user_id: 'other', status: 'active' });

    await expect(service.cancelTicket({ id: 't1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 403 });
  });

  it('menolak (422) jika tiket sudah tidak active', async () => {
    const { service, tickets } = build();
    (tickets.findById as jest.Mock).mockResolvedValue({ id: 't1', user_id: 'u1', status: 'used' });

    await expect(service.cancelTicket({ id: 't1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 422 });
  });
});
