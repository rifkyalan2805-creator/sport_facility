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
import { PaymentService } from '../src/services/payment.service';

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

function build() {
  const sessions = mockSessions();
  const ticketTypes = mockTicketTypes();
  const tickets = mockTickets();
  const payments = mockPayments();
  return { service: new PoolService(sessions, ticketTypes, tickets, payments), sessions, ticketTypes, tickets, payments };
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
