jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { Prisma } from '@prisma/client';
import { EventService } from '../src/services/event.service';
import { EventCategoryRepository } from '../src/repositories/eventCategory.repository';
import { EventRepository } from '../src/repositories/event.repository';
import { EventRegistrationRepository } from '../src/repositories/eventRegistration.repository';
import { PaymentService } from '../src/services/payment.service';

const mockCategories = () =>
  ({ listAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<EventCategoryRepository>);

const mockEvents = () =>
  ({
    listPublished: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    acquireLock: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<EventRepository>);

const mockRegistrations = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findByQr: jest.fn(),
    findByUserAndEvent: jest.fn(),
    findManyByUser: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<EventRegistrationRepository>);

const mockPayments = () =>
  ({ createPayment: jest.fn() } as unknown as jest.Mocked<PaymentService>);

function build() {
  const categories = mockCategories();
  const events = mockEvents();
  const registrations = mockRegistrations();
  const payments = mockPayments();
  return { service: new EventService(categories, events, registrations, payments), categories, events, registrations, payments };
}

const futureDate = new Date('2999-06-20T10:00:00Z');
const paidEvent = {
  id: 'e1',
  status: 'published',
  event_date: futureDate,
  registration_deadline: null,
  quota: 100,
  registered_count: 10,
  price: new Prisma.Decimal(50000),
  title: 'Turnamen',
};
const freeEvent = { ...paidEvent, id: 'e2', price: new Prisma.Decimal(0) };

const input = { userId: 'u1', eventId: 'e1' };

describe('EventService.register', () => {
  it('event berbayar → registrasi registered + buat payment dummy', async () => {
    const { service, events, registrations, payments } = build();
    (events.findById as jest.Mock).mockResolvedValue(paidEvent);
    (registrations.findByUserAndEvent as jest.Mock).mockResolvedValue(null);
    (registrations.create as jest.Mock).mockResolvedValue({ id: 'r1', status: 'registered' });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });

    const result = await service.register(input);

    expect(registrations.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'registered' }),
      expect.anything()
    );
    expect(events.update).toHaveBeenCalledWith('e1', { registered_count: 11 }, expect.anything());
    expect(payments.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ items: [expect.objectContaining({ itemType: 'event', itemId: 'r1' })] })
    );
    expect(result).toEqual({ registration: { id: 'r1', status: 'registered' }, payment: { id: 'pay1' } });
  });

  it('event gratis → langsung confirmed tanpa payment', async () => {
    const { service, events, registrations, payments } = build();
    (events.findById as jest.Mock).mockResolvedValue(freeEvent);
    (registrations.findByUserAndEvent as jest.Mock).mockResolvedValue(null);
    (registrations.create as jest.Mock).mockResolvedValue({ id: 'r2', status: 'confirmed' });

    const result = await service.register({ userId: 'u1', eventId: 'e2' });

    expect(registrations.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'confirmed' }),
      expect.anything()
    );
    expect(payments.createPayment).not.toHaveBeenCalled();
    expect(result.payment).toBeNull();
  });

  it('menolak (409) jika sudah terdaftar', async () => {
    const { service, events, registrations } = build();
    (events.findById as jest.Mock).mockResolvedValue(paidEvent);
    (registrations.findByUserAndEvent as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(service.register(input)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('menolak (422) jika kuota penuh', async () => {
    const { service, events, registrations } = build();
    (events.findById as jest.Mock).mockResolvedValue({ ...paidEvent, registered_count: 100 });
    (registrations.findByUserAndEvent as jest.Mock).mockResolvedValue(null);

    await expect(service.register(input)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (422) jika event belum published', async () => {
    const { service, events } = build();
    (events.findById as jest.Mock).mockResolvedValue({ ...paidEvent, status: 'draft' });

    await expect(service.register(input)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (404) jika event tidak ada', async () => {
    const { service, events } = build();
    (events.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.register(input)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('EventService.scanRegistration', () => {
  it('check-in registrasi confirmed', async () => {
    const { service, registrations } = build();
    (registrations.findByQr as jest.Mock).mockResolvedValue({ id: 'r1', status: 'confirmed' });
    (registrations.update as jest.Mock).mockResolvedValue({ id: 'r1', status: 'checked_in' });

    await service.scanRegistration({ qrCode: 'EVT-x' });

    expect(registrations.update).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ status: 'checked_in' })
    );
  });

  it('menolak (422) jika registrasi belum confirmed', async () => {
    const { service, registrations } = build();
    (registrations.findByQr as jest.Mock).mockResolvedValue({ id: 'r1', status: 'registered' });

    await expect(service.scanRegistration({ qrCode: 'x' })).rejects.toMatchObject({ statusCode: 422 });
  });
});

describe('EventService.cancelRegistration', () => {
  it('menolak (403) jika registrasi milik user lain', async () => {
    const { service, registrations } = build();
    (registrations.findById as jest.Mock).mockResolvedValue({ id: 'r1', user_id: 'other', status: 'confirmed' });

    await expect(service.cancelRegistration({ id: 'r1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 403 });
  });
});
