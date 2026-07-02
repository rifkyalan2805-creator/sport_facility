import { Prisma } from '@prisma/client';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { BookingService } from '../src/services/booking.service';
import { BookingRepository } from '../src/repositories/booking.repository';
import { CourtRepository } from '../src/repositories/court.repository';
import { UserAbonemenRepository } from '../src/repositories/userAbonemen.repository';
import { SiteSettingRepository } from '../src/repositories/siteSetting.repository';
import { PricingRepository } from '../src/repositories/pricing.repository';
import { timeToDate } from '../src/utils/time';

const FUTURE_DATE = '2999-01-04'; // tanggal jauh di masa depan agar lolos cek "tidak boleh lampau"

const mockBookings = () =>
  ({
    acquireCourtLock: jest.fn().mockResolvedValue(undefined),
    findConflicting: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  } as unknown as jest.Mocked<BookingRepository>);

const mockCourts = () =>
  ({
    findActiveById: jest.fn(),
    findScheduleForDay: jest.fn(),
    findById: jest.fn(),
    listActive: jest.fn(),
  } as unknown as jest.Mocked<CourtRepository>);

const mockAbonemen = () =>
  ({ findById: jest.fn(), decrementRemaining: jest.fn() } as unknown as jest.Mocked<UserAbonemenRepository>);

const mockSettings = () =>
  ({ findByKey: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<SiteSettingRepository>);

const mockPricing = () =>
  ({
    listTennis: jest.fn().mockResolvedValue([]),
    listPadel: jest.fn().mockResolvedValue([]),
    findTennis: jest.fn(),
    createTennis: jest.fn(),
    updateTennis: jest.fn(),
    deleteTennis: jest.fn(),
    findPadel: jest.fn(),
    createPadel: jest.fn(),
    updatePadel: jest.fn(),
    deletePadel: jest.fn(),
  } as unknown as jest.Mocked<PricingRepository>);

function buildService() {
  const bookings = mockBookings();
  const courts = mockCourts();
  const abonemen = mockAbonemen();
  const settings = mockSettings();
  const pricing = mockPricing();
  const service = new BookingService(bookings, courts, abonemen, settings, pricing);
  return { service, bookings, courts, abonemen, settings, pricing };
}

const activeCourt = {
  id: 'c1',
  is_active: true,
  price_per_hour: new Prisma.Decimal(100000),
};

const openSchedule = {
  open_time: timeToDate('06:00'),
  close_time: timeToDate('22:00'),
  is_holiday_closed: false,
};

const baseInput = {
  userId: 'u1',
  courtId: 'c1',
  bookingType: 'insidentil' as const,
  bookingDate: FUTURE_DATE,
  startTime: '08:00',
  endTime: '10:00',
};

describe('BookingService.createBooking (insidentil)', () => {
  it('membuat booking & menghitung total_price = durasi * harga/jam', async () => {
    const { service, courts, bookings } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (bookings.create as jest.Mock).mockImplementation(async (data) => ({ id: 'bk1', ...data }));

    await service.createBooking(baseInput);

    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.duration_hours.toString()).toBe('2');
    expect(arg.total_price.toString()).toBe('200000');
    expect(arg.status).toBe('pending');
    expect(bookings.acquireCourtLock).toHaveBeenCalledWith('c1', expect.anything());
  });

  it('menolak (409) jika slot bentrok', async () => {
    const { service, courts, bookings } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (bookings.findConflicting as jest.Mock).mockResolvedValue([{ id: 'x' }]);

    await expect(service.createBooking(baseInput)).rejects.toMatchObject({ statusCode: 409 });
    expect(bookings.create).not.toHaveBeenCalled();
  });

  it('menolak (404) jika court tidak ada/aktif', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(null);

    await expect(service.createBooking(baseInput)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('menolak (422) jika di luar jam operasional', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);

    await expect(
      service.createBooking({ ...baseInput, startTime: '05:00', endTime: '06:30' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it('menolak (400) jika tanggal di masa lalu', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);

    await expect(
      service.createBooking({ ...baseInput, bookingDate: '2000-01-01' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('BookingService.createBooking (abonemen)', () => {
  it('memakai abonemen: total_price 0 & remaining_sessions dikurangi', async () => {
    const { service, courts, bookings, abonemen } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (abonemen.findById as jest.Mock).mockResolvedValue({
      id: 'ab1',
      user_id: 'u1',
      status: 'active',
      remaining_sessions: 3,
      start_date: new Date('2000-01-01'),
      end_date: new Date('2999-12-31'),
    });
    (bookings.create as jest.Mock).mockImplementation(async (data) => data);

    await service.createBooking({ ...baseInput, bookingType: 'abonemen', abonemenId: 'ab1' });

    expect(abonemen.decrementRemaining).toHaveBeenCalledWith('ab1', expect.anything());
    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.total_price.toString()).toBe('0');
    expect(arg.abonemen_id).toBe('ab1');
  });

  it('menolak (422) jika sisa sesi abonemen habis', async () => {
    const { service, courts, abonemen } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(activeCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (abonemen.findById as jest.Mock).mockResolvedValue({
      id: 'ab1',
      user_id: 'u1',
      status: 'active',
      remaining_sessions: 0,
      start_date: new Date('2000-01-01'),
      end_date: new Date('2999-12-31'),
    });

    await expect(
      service.createBooking({ ...baseInput, bookingType: 'abonemen', abonemenId: 'ab1' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});

describe('BookingService.createBooking (harga per-sport)', () => {
  const tennisCourt = { id: 'c1', is_active: true, type: 'tennis', price_per_hour: new Prisma.Decimal(175000) };
  const padelCourt = { id: 'c1', is_active: true, type: 'paddle', price_per_hour: new Prisma.Decimal(200000) };
  const tennisRows = [
    { booking_type: 'insidentil', with_light: true, price: new Prisma.Decimal(175000), is_active: true },
    { booking_type: 'insidentil', with_light: false, price: new Prisma.Decimal(155000), is_active: true },
    { booking_type: 'abonemen', with_light: true, price: new Prisma.Decimal(165000), is_active: true },
    { booking_type: 'abonemen', with_light: false, price: new Prisma.Decimal(145000), is_active: true },
  ];
  const padelRows = [
    { label: 'normal', price: new Prisma.Decimal(200000), time_start: null, time_end: null, is_active: true },
    { label: 'off_peak', price: new Prisma.Decimal(150000), time_start: timeToDate('06:00'), time_end: timeToDate('15:00'), is_active: true },
  ];

  it('tenis insidentil dengan lampu → 175.000/jam', async () => {
    const { service, courts, bookings, pricing } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(tennisCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (pricing.listTennis as jest.Mock).mockResolvedValue(tennisRows);
    (bookings.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createBooking({ ...baseInput, bookingType: 'insidentil', withLight: true });
    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.total_price.toString()).toBe('350000'); // 175000 × 2 jam
  });

  it('tenis abonemen tanpa lampu → 145.000/jam (tarif per-jam, bukan paket)', async () => {
    const { service, courts, bookings, abonemen, pricing } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(tennisCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (pricing.listTennis as jest.Mock).mockResolvedValue(tennisRows);
    (bookings.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createBooking({ ...baseInput, bookingType: 'abonemen', withLight: false });
    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.total_price.toString()).toBe('290000'); // 145000 × 2
    expect(arg.abonemen_id).toBeNull();
    expect(abonemen.decrementRemaining).not.toHaveBeenCalled();
  });

  it('padel off-peak (08:00) → 150.000/jam', async () => {
    const { service, courts, bookings, pricing } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (pricing.listPadel as jest.Mock).mockResolvedValue(padelRows);
    (bookings.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createBooking({ ...baseInput, startTime: '08:00', endTime: '10:00' });
    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.total_price.toString()).toBe('300000'); // 150000 × 2
  });

  it('padel normal (16:00) → 200.000/jam', async () => {
    const { service, courts, bookings, pricing } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(openSchedule);
    (pricing.listPadel as jest.Mock).mockResolvedValue(padelRows);
    (bookings.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createBooking({ ...baseInput, startTime: '16:00', endTime: '18:00' });
    const arg = (bookings.create as jest.Mock).mock.calls[0][0];
    expect(arg.total_price.toString()).toBe('400000'); // 200000 × 2
  });
});
