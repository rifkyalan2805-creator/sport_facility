jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { Prisma } from '@prisma/client';
import { BookingFulfillmentHandler } from '../src/services/fulfillment/booking.handler';
import { MembershipFulfillmentHandler } from '../src/services/fulfillment/membership.handler';
import { PoolTicketFulfillmentHandler } from '../src/services/fulfillment/poolTicket.handler';
import { TicketFulfillmentHandler } from '../src/services/fulfillment/ticket.handler';
import { EventFulfillmentHandler } from '../src/services/fulfillment/event.handler';
import { BookingRepository } from '../src/repositories/booking.repository';
import { UserMembershipRepository } from '../src/repositories/userMembership.repository';
import { PoolTicketRepository } from '../src/repositories/poolTicket.repository';
import { PoolSessionRepository } from '../src/repositories/poolSession.repository';
import { TicketRepository } from '../src/repositories/ticket.repository';
import { TicketCategoryRepository } from '../src/repositories/ticketCategory.repository';
import { EventRegistrationRepository } from '../src/repositories/eventRegistration.repository';
import { EventRepository } from '../src/repositories/event.repository';

const tx = {} as unknown as Prisma.TransactionClient;

describe('BookingFulfillmentHandler', () => {
  it('onPaid: confirm booking yang masih pending', async () => {
    const bookings = { findById: jest.fn(), updateStatus: jest.fn() } as unknown as jest.Mocked<BookingRepository>;
    (bookings.findById as jest.Mock).mockResolvedValue({ id: 'b1', status: 'pending' });
    const h = new BookingFulfillmentHandler(bookings);

    await h.onPaid({ itemType: 'booking', itemId: 'b1', quantity: 1 }, tx);

    expect(bookings.updateStatus).toHaveBeenCalledWith('b1', { status: 'confirmed' }, tx);
  });

  it('onFailed: tidak mengubah apa pun', async () => {
    const bookings = { findById: jest.fn(), updateStatus: jest.fn() } as unknown as jest.Mocked<BookingRepository>;
    const h = new BookingFulfillmentHandler(bookings);
    await expect(h.onFailed()).resolves.toBeUndefined();
    expect(bookings.updateStatus).not.toHaveBeenCalled();
  });
});

describe('MembershipFulfillmentHandler', () => {
  it('onPaid: aktifkan + set card_number, tanpa menimpa tanggal', async () => {
    const memberships = {
      findByIdWithPlan: jest.fn(),
      findByCardNumber: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserMembershipRepository>;
    (memberships.findByIdWithPlan as jest.Mock).mockResolvedValue({
      id: 'm1',
      status: 'pending',
      membership_plans: { duration_days: 30 },
    });
    (memberships.findByCardNumber as jest.Mock).mockResolvedValue(null); // nomor unik
    const h = new MembershipFulfillmentHandler(memberships);

    await h.onPaid({ itemType: 'membership', itemId: 'm1', quantity: 1 }, tx);

    const arg = (memberships.update as jest.Mock).mock.calls[0][1];
    expect(arg.status).toBe('active');
    expect(arg.card_number).toMatch(/^MBR-[A-Z0-9]+$/);
    // Tanggal manual tidak boleh disentuh saat aktivasi.
    expect(arg.start_date).toBeUndefined();
    expect(arg.end_date).toBeUndefined();
  });

  it('onPaid: tidak menggandakan aktivasi jika sudah active', async () => {
    const memberships = {
      findByIdWithPlan: jest.fn(),
      findByCardNumber: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserMembershipRepository>;
    (memberships.findByIdWithPlan as jest.Mock).mockResolvedValue({ id: 'm1', status: 'active', membership_plans: { duration_days: 30 } });
    const h = new MembershipFulfillmentHandler(memberships);

    await h.onPaid({ itemType: 'membership', itemId: 'm1', quantity: 1 }, tx);

    expect(memberships.update).not.toHaveBeenCalled();
  });
});

describe('PoolTicketFulfillmentHandler', () => {
  it('onFailed: batalkan tiket & kembalikan kuota sesi (full→open)', async () => {
    const poolTickets = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<PoolTicketRepository>;
    const poolSessions = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<PoolSessionRepository>;
    (poolTickets.findById as jest.Mock).mockResolvedValue({ id: 't1', status: 'active', session_id: 's1', quantity: 2 });
    (poolSessions.findById as jest.Mock).mockResolvedValue({ id: 's1', booked_count: 5, status: 'full' });
    const h = new PoolTicketFulfillmentHandler(poolTickets, poolSessions);

    await h.onFailed({ itemType: 'pool_ticket', itemId: 't1', quantity: 2 }, tx);

    expect(poolTickets.update).toHaveBeenCalledWith('t1', expect.objectContaining({ status: 'cancelled' }), tx);
    expect(poolSessions.update).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ booked_count: 3, status: 'open' }),
      tx
    );
  });

  it('onPaid: tidak ada aksi', async () => {
    const poolTickets = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<PoolTicketRepository>;
    const poolSessions = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<PoolSessionRepository>;
    const h = new PoolTicketFulfillmentHandler(poolTickets, poolSessions);
    await h.onPaid();
    expect(poolTickets.update).not.toHaveBeenCalled();
  });
});

describe('TicketFulfillmentHandler', () => {
  it('onFailed: batalkan tiket & kembalikan sold_count kategori', async () => {
    const tickets = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<TicketRepository>;
    const categories = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<TicketCategoryRepository>;
    (tickets.findById as jest.Mock).mockResolvedValue({ id: 'tk1', status: 'active', category_id: 'cat1', quantity: 3 });
    (categories.findById as jest.Mock).mockResolvedValue({ id: 'cat1', sold_count: 10 });
    const h = new TicketFulfillmentHandler(tickets, categories);

    await h.onFailed({ itemType: 'ticket', itemId: 'tk1', quantity: 3 }, tx);

    expect(tickets.update).toHaveBeenCalledWith('tk1', { status: 'cancelled' }, tx);
    expect(categories.update).toHaveBeenCalledWith('cat1', { sold_count: 7 }, tx);
  });
});

describe('EventFulfillmentHandler', () => {
  it('onPaid: registrasi registered → confirmed', async () => {
    const registrations = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<EventRegistrationRepository>;
    const events = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<EventRepository>;
    (registrations.findById as jest.Mock).mockResolvedValue({ id: 'r1', status: 'registered', event_id: 'e1' });
    const h = new EventFulfillmentHandler(registrations, events);

    await h.onPaid({ itemType: 'event', itemId: 'r1', quantity: 1 }, tx);

    expect(registrations.update).toHaveBeenCalledWith('r1', { status: 'confirmed' }, tx);
  });

  it('onFailed: batalkan registrasi & kurangi registered_count', async () => {
    const registrations = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<EventRegistrationRepository>;
    const events = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<EventRepository>;
    (registrations.findById as jest.Mock).mockResolvedValue({ id: 'r1', status: 'registered', event_id: 'e1' });
    (events.findById as jest.Mock).mockResolvedValue({ id: 'e1', registered_count: 11 });
    const h = new EventFulfillmentHandler(registrations, events);

    await h.onFailed({ itemType: 'event', itemId: 'r1', quantity: 1 }, tx);

    expect(registrations.update).toHaveBeenCalledWith('r1', { status: 'cancelled' }, tx);
    expect(events.update).toHaveBeenCalledWith('e1', { registered_count: 10 }, tx);
  });
});
