jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { Prisma } from '@prisma/client';
import { TicketService } from '../src/services/ticket.service';
import { TicketCategoryRepository } from '../src/repositories/ticketCategory.repository';
import { TicketRepository } from '../src/repositories/ticket.repository';
import { TicketUsageRepository } from '../src/repositories/ticketUsage.repository';
import { PaymentService } from '../src/services/payment.service';

const mockCategories = () =>
  ({
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    acquireLock: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<TicketCategoryRepository>);

const mockTickets = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findByQr: jest.fn(),
    findManyByUser: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<TicketRepository>);

const mockUsages = () =>
  ({ create: jest.fn(), findManyByTicket: jest.fn() } as unknown as jest.Mocked<TicketUsageRepository>);

const mockPayments = () =>
  ({ createPayment: jest.fn() } as unknown as jest.Mocked<PaymentService>);

function build() {
  const categories = mockCategories();
  const tickets = mockTickets();
  const usages = mockUsages();
  const payments = mockPayments();
  return { service: new TicketService(categories, tickets, usages, payments), categories, tickets, usages, payments };
}

const activeCategory = {
  id: 'cat1',
  is_active: true,
  price: new Prisma.Decimal(25000),
  quota: 100,
  sold_count: 10,
  valid_until: new Date('2999-12-31'),
};

const buyInput = { userId: 'u1', categoryId: 'cat1', quantity: 2 };

describe('TicketService.buyTicket', () => {
  it('reservasi kuota (sold_count) + buat payment dummy', async () => {
    const { service, categories, tickets, payments } = build();
    (categories.findById as jest.Mock).mockResolvedValue(activeCategory);
    (tickets.create as jest.Mock).mockResolvedValue({ id: 'tk1', quantity: 2, unit_price: new Prisma.Decimal(25000) });
    (payments.createPayment as jest.Mock).mockResolvedValue({ id: 'pay1' });

    const result = await service.buyTicket(buyInput);

    expect(categories.update).toHaveBeenCalledWith('cat1', { sold_count: 12 }, expect.anything());
    expect(payments.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ items: [expect.objectContaining({ itemType: 'ticket', itemId: 'tk1' })] })
    );
    expect(result).toEqual({ ticket: expect.objectContaining({ id: 'tk1' }), payment: { id: 'pay1' } });
  });

  it('menolak (422) jika kuota tidak mencukupi', async () => {
    const { service, categories, tickets } = build();
    (categories.findById as jest.Mock).mockResolvedValue({ ...activeCategory, sold_count: 99 });

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 422 });
    expect(tickets.create).not.toHaveBeenCalled();
  });

  it('menolak (422) jika kategori sudah tidak berlaku', async () => {
    const { service, categories } = build();
    (categories.findById as jest.Mock).mockResolvedValue({ ...activeCategory, valid_until: new Date('2000-01-01') });

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (404) jika kategori tidak ada', async () => {
    const { service, categories } = build();
    (categories.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.buyTicket(buyInput)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('TicketService.scanTicket', () => {
  it('menandai tiket used + mencatat log scan', async () => {
    const { service, tickets, usages } = build();
    (tickets.findByQr as jest.Mock).mockResolvedValue({ id: 'tk1', status: 'active', expired_at: null });
    (tickets.update as jest.Mock).mockResolvedValue({ id: 'tk1', status: 'used' });
    (usages.create as jest.Mock).mockResolvedValue({ id: 'log1' });

    const result = await service.scanTicket({ qrCode: 'HTM-x', scannedBy: 'staff1', location: 'Gate A' });

    expect(tickets.update).toHaveBeenCalledWith('tk1', { status: 'used' }, expect.anything());
    expect(usages.create).toHaveBeenCalledWith(
      expect.objectContaining({ ticket_id: 'tk1', scanned_by: 'staff1', location: 'Gate A' }),
      expect.anything()
    );
    expect(result).toEqual({ ticket: { id: 'tk1', status: 'used' }, usage: { id: 'log1' } });
  });

  it('menolak (422) jika tiket tidak active', async () => {
    const { service, tickets } = build();
    (tickets.findByQr as jest.Mock).mockResolvedValue({ id: 'tk1', status: 'used' });

    await expect(service.scanTicket({ qrCode: 'x', scannedBy: 's1' })).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (422) jika tiket kadaluarsa', async () => {
    const { service, tickets } = build();
    (tickets.findByQr as jest.Mock).mockResolvedValue({
      id: 'tk1',
      status: 'active',
      expired_at: new Date('2000-01-01'),
    });

    await expect(service.scanTicket({ qrCode: 'x', scannedBy: 's1' })).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (404) jika qr tidak ditemukan', async () => {
    const { service, tickets } = build();
    (tickets.findByQr as jest.Mock).mockResolvedValue(null);

    await expect(service.scanTicket({ qrCode: 'x', scannedBy: 's1' })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('TicketService.cancelTicket', () => {
  it('membatalkan tiket & mengembalikan kuota', async () => {
    const { service, categories, tickets } = build();
    (tickets.findById as jest.Mock)
      .mockResolvedValueOnce({ id: 'tk1', user_id: 'u1', status: 'active', category_id: 'cat1', quantity: 2 })
      .mockResolvedValueOnce({ id: 'tk1', status: 'cancelled' });
    (categories.findById as jest.Mock).mockResolvedValue({ id: 'cat1', sold_count: 12 });

    await service.cancelTicket({ id: 'tk1', userId: 'u1' });

    expect(categories.update).toHaveBeenCalledWith('cat1', { sold_count: 10 }, expect.anything());
  });

  it('menolak (403) jika tiket milik user lain', async () => {
    const { service, tickets } = build();
    (tickets.findById as jest.Mock).mockResolvedValue({ id: 'tk1', user_id: 'other', status: 'active' });

    await expect(service.cancelTicket({ id: 'tk1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 403 });
  });
});
