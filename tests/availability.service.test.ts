import { Prisma } from '@prisma/client';
import { AvailabilityService } from '../src/services/availability.service';
import { CourtRepository } from '../src/repositories/court.repository';
import { BookingRepository } from '../src/repositories/booking.repository';
import { PricingRepository } from '../src/repositories/pricing.repository';
import { timeToDate } from '../src/utils/time';

const FUTURE_DATE = '2999-01-04'; // jauh di masa depan → tak ada slot "lampau"

const mockCourts = () =>
  ({
    findActiveById: jest.fn(),
    findScheduleForDay: jest.fn(),
  } as unknown as jest.Mocked<CourtRepository>);

const mockBookings = () =>
  ({ findActiveByCourtDate: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<BookingRepository>);

const mockPricing = () =>
  ({ listPadel: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<PricingRepository>);

function buildService() {
  const courts = mockCourts();
  const bookings = mockBookings();
  const pricing = mockPricing();
  const service = new AvailabilityService(courts, bookings, pricing);
  return { service, courts, bookings, pricing };
}

const padelCourt = { id: 'c1', is_active: true, type: 'paddle', price_per_hour: new Prisma.Decimal(200000) };
const schedule = {
  open_time: timeToDate('08:00'),
  close_time: timeToDate('11:00'),
  is_holiday_closed: false,
};
const padelRows = [
  { label: 'normal', price: new Prisma.Decimal(200000), time_start: null, time_end: null, is_active: true },
  { label: 'off_peak', price: new Prisma.Decimal(150000), time_start: timeToDate('06:00'), time_end: timeToDate('15:00'), is_active: true },
];

describe('AvailabilityService.getAvailability', () => {
  it('membuat slot per jam sesuai jam operasional', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(schedule);

    const res = await service.getAvailability('c1', FUTURE_DATE);

    expect(res.closed).toBe(false);
    // 08–11 → 3 slot: 08:00, 09:00, 10:00
    expect(res.slots.map((s) => s.start)).toEqual(['08:00', '09:00', '10:00']);
    expect(res.slots[0]).toMatchObject({ end: '09:00', durationMin: 60 });
  });

  it('padel off-peak: price 150.000 dengan basePrice 200.000 (dicoret)', async () => {
    const { service, courts, pricing } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(schedule);
    (pricing.listPadel as jest.Mock).mockResolvedValue(padelRows);

    const res = await service.getAvailability('c1', FUTURE_DATE);

    // 08:00 masuk window off-peak (06–15)
    expect(res.slots[0].price).toBe(150000);
    expect(res.slots[0].basePrice).toBe(200000);
  });

  it('menandai slot yang bertabrakan dengan booking aktif sebagai booked', async () => {
    const { service, courts, bookings } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(schedule);
    (bookings.findActiveByCourtDate as jest.Mock).mockResolvedValue([
      { start_time: timeToDate('09:00'), end_time: timeToDate('10:00') },
    ]);

    const res = await service.getAvailability('c1', FUTURE_DATE);
    const byStart = Object.fromEntries(res.slots.map((s) => [s.start, s.status]));
    expect(byStart['08:00']).toBe('available');
    expect(byStart['09:00']).toBe('booked');
    expect(byStart['10:00']).toBe('available');
  });

  it('closed=true saat hari libur / tanpa jadwal', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(padelCourt);
    (courts.findScheduleForDay as jest.Mock).mockResolvedValue(null);

    const res = await service.getAvailability('c1', FUTURE_DATE);
    expect(res.closed).toBe(true);
    expect(res.slots).toHaveLength(0);
  });

  it('menolak (404) jika court tidak ada', async () => {
    const { service, courts } = buildService();
    (courts.findActiveById as jest.Mock).mockResolvedValue(null);
    await expect(service.getAvailability('x', FUTURE_DATE)).rejects.toMatchObject({ statusCode: 404 });
  });
});
