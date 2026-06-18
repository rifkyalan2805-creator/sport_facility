import { Prisma } from '@prisma/client';

// Mock layer DB agar tidak menyentuh PostgreSQL / env asli.
jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { PaymentService } from '../src/services/payment.service';
import { PaymentRepository } from '../src/repositories/payment.repository';
import { PaymentMethodRepository } from '../src/repositories/paymentMethod.repository';
import { InvoiceRepository } from '../src/repositories/invoice.repository';
import { SiteSettingRepository } from '../src/repositories/siteSetting.repository';
import { PaymentGateway } from '../src/services/paymentGateway';
import { FulfillmentRegistry } from '../src/services/fulfillment/registry';
import { PromoService } from '../src/services/promo.service';
import { LoyaltyService } from '../src/services/loyalty.service';

const mockPayments = () =>
  ({
    findByIdempotencyKey: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>);

const mockMethods = () =>
  ({ findActiveById: jest.fn(), listActive: jest.fn() } as unknown as jest.Mocked<PaymentMethodRepository>);

const mockInvoices = () =>
  ({
    countWithPrefix: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    findByPaymentId: jest.fn(),
  } as unknown as jest.Mocked<InvoiceRepository>);

const mockSettings = () =>
  ({ findByKey: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<SiteSettingRepository>);

const mockGateway = (): jest.Mocked<PaymentGateway> => ({
  createCharge: jest.fn().mockResolvedValue({ referenceId: 'DUMMY-REF', raw: {} }),
});

// Registry tiruan: setiap item_type mengembalikan handler stub yang sama
// sehingga pemanggilan onPaid/onFailed bisa diverifikasi.
function mockFulfillment() {
  const onPaid = jest.fn();
  const onFailed = jest.fn();
  const registry = {
    get: jest.fn(() => ({ itemType: 'booking', onPaid, onFailed })),
  } as unknown as jest.Mocked<FulfillmentRegistry>;
  return { registry, onPaid, onFailed };
}

const mockPromos = () =>
  ({ validate: jest.fn(), consume: jest.fn() } as unknown as jest.Mocked<PromoService>);

const mockLoyalty = () =>
  ({ earn: jest.fn() } as unknown as jest.Mocked<LoyaltyService>);

function buildService() {
  const payments = mockPayments();
  const methods = mockMethods();
  const invoices = mockInvoices();
  const settings = mockSettings();
  const gateway = mockGateway();
  const { registry, onPaid, onFailed } = mockFulfillment();
  const promos = mockPromos();
  const loyalty = mockLoyalty();
  const service = new PaymentService(payments, methods, invoices, settings, gateway, registry, promos, loyalty);
  return { service, payments, methods, invoices, settings, gateway, registry, onPaid, onFailed, promos, loyalty };
}

describe('PaymentService.createPayment', () => {
  it('menghitung amount & final_amount tanpa metode pembayaran (fee 0)', async () => {
    const { service, payments } = buildService();
    (payments.create as jest.Mock).mockImplementation(async (data) => ({ id: 'p1', ...data }));

    await service.createPayment({
      userId: 'u1',
      items: [{ itemType: 'booking', itemId: 'b1', itemName: 'Court A', quantity: 2, unitPrice: 100000 }],
    });

    const arg = (payments.create as jest.Mock).mock.calls[0][0];
    expect(arg.amount.toString()).toBe('200000');
    expect(arg.fee_amount.toString()).toBe('0');
    expect(arg.final_amount.toString()).toBe('200000');
    expect(arg.status).toBe('pending');
    expect(arg.reference_id).toBe('DUMMY-REF');
  });

  it('menambahkan fee dari metode pembayaran (percent + flat)', async () => {
    const { service, payments, methods } = buildService();
    (methods.findActiveById as jest.Mock).mockResolvedValue({
      id: 'm1',
      fee_percent: new Prisma.Decimal(2),
      fee_flat: new Prisma.Decimal(1000),
    });
    (payments.create as jest.Mock).mockImplementation(async (data) => data);

    await service.createPayment({
      userId: 'u1',
      paymentMethodId: 'm1',
      items: [{ itemType: 'booking', itemId: 'b1', itemName: 'Court A', quantity: 2, unitPrice: 100000 }],
    });

    const arg = (payments.create as jest.Mock).mock.calls[0][0];
    expect(arg.fee_amount.toString()).toBe('5000'); // 200000*2% + 1000
    expect(arg.final_amount.toString()).toBe('205000');
  });

  it('menerapkan diskon dari promo_code (validate + consume)', async () => {
    const { service, payments, promos } = buildService();
    (promos.validate as jest.Mock).mockResolvedValue({ promo: { id: 'promo1' }, discountAmount: 20000 });
    (payments.create as jest.Mock).mockImplementation(async (data) => data);

    await service.createPayment({
      userId: 'u1',
      promoCode: 'HEMAT20',
      items: [{ itemType: 'booking', itemId: 'b1', itemName: 'Court A', quantity: 2, unitPrice: 100000 }],
    });

    expect(promos.validate).toHaveBeenCalledWith('HEMAT20', 200000, ['booking']);
    const arg = (payments.create as jest.Mock).mock.calls[0][0];
    expect(arg.discount_amount.toString()).toBe('20000');
    expect(arg.final_amount.toString()).toBe('180000');
    expect(arg.promo_id).toBe('promo1');
    expect(promos.consume).toHaveBeenCalledWith('promo1');
  });

  it('idempoten: mengembalikan pembayaran lama jika idempotencyKey sudah ada', async () => {
    const { service, payments } = buildService();
    (payments.findByIdempotencyKey as jest.Mock).mockResolvedValue({ id: 'existing' });

    const result = await service.createPayment({
      userId: 'u1',
      idempotencyKey: 'key-1',
      items: [{ itemType: 'booking', itemId: 'b1', itemName: 'X', quantity: 1, unitPrice: 1000 }],
    });

    expect(result).toEqual({ id: 'existing' });
    expect(payments.create).not.toHaveBeenCalled();
  });

  it('menolak discount yang melebihi amount', async () => {
    const { service } = buildService();
    await expect(
      service.createPayment({
        userId: 'u1',
        discountAmount: 999999,
        items: [{ itemType: 'booking', itemId: 'b1', itemName: 'X', quantity: 1, unitPrice: 1000 }],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('PaymentService.simulateSuccess', () => {
  it('memanggil onPaid handler tiap item, membuat invoice, set status paid', async () => {
    const { service, payments, invoices, registry, onPaid } = buildService();
    (payments.findById as jest.Mock).mockResolvedValue({
      id: 'p1',
      user_id: 'u1',
      status: 'pending',
      final_amount: new Prisma.Decimal(200000),
      payment_items: [{ item_type: 'booking', item_id: 'b1', quantity: 1 }],
    });
    (payments.update as jest.Mock).mockImplementation(async (_id, data) => ({ id: 'p1', ...data }));

    const result = await service.simulateSuccess({ paymentId: 'p1', userId: 'u1' });

    expect(registry.get).toHaveBeenCalledWith('booking');
    expect(onPaid).toHaveBeenCalledWith(
      { itemType: 'booking', itemId: 'b1', quantity: 1 },
      expect.anything()
    );
    expect(invoices.create).toHaveBeenCalled();
    expect((result as { status: string }).status).toBe('paid');
  });

  it('menambah poin loyalty saat pembayaran lunas', async () => {
    const { service, payments, loyalty } = buildService();
    (payments.findById as jest.Mock).mockResolvedValue({
      id: 'p1',
      user_id: 'u1',
      status: 'pending',
      final_amount: new Prisma.Decimal(200000),
      payment_items: [{ item_type: 'booking', item_id: 'b1', quantity: 1 }],
    });
    (payments.update as jest.Mock).mockImplementation(async (_id, data) => ({ id: 'p1', ...data }));

    await service.simulateSuccess({ paymentId: 'p1', userId: 'u1' });

    expect(loyalty.earn).toHaveBeenCalledWith('u1', 200000, 'p1', expect.anything());
  });

  it('menolak jika status bukan pending', async () => {
    const { service, payments } = buildService();
    (payments.findById as jest.Mock).mockResolvedValue({ id: 'p1', user_id: 'u1', status: 'paid', payment_items: [] });

    await expect(service.simulateSuccess({ paymentId: 'p1', userId: 'u1' })).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it('menolak akses pembayaran milik user lain (403)', async () => {
    const { service, payments } = buildService();
    (payments.findById as jest.Mock).mockResolvedValue({ id: 'p1', user_id: 'other', status: 'pending', payment_items: [] });

    await expect(service.simulateSuccess({ paymentId: 'p1', userId: 'u1' })).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('PaymentService.simulateFailure', () => {
  it('memanggil onFailed handler tiap item & set status failed', async () => {
    const { service, payments, registry, onFailed } = buildService();
    (payments.findById as jest.Mock).mockResolvedValue({
      id: 'p1',
      user_id: 'u1',
      status: 'pending',
      payment_items: [{ item_type: 'pool_ticket', item_id: 't1', quantity: 2 }],
    });
    (payments.update as jest.Mock).mockImplementation(async (_id, data) => ({ id: 'p1', ...data }));

    const result = await service.simulateFailure({ paymentId: 'p1', userId: 'u1', reason: 'kartu ditolak' });

    expect(registry.get).toHaveBeenCalledWith('pool_ticket');
    expect(onFailed).toHaveBeenCalledWith(
      { itemType: 'pool_ticket', itemId: 't1', quantity: 2 },
      expect.anything()
    );
    expect((result as { status: string }).status).toBe('failed');
  });
});
