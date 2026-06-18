jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { WaitingListService } from '../src/services/waitingList.service';
import { WaitingListRepository } from '../src/repositories/waitingList.repository';
import { CourtRepository } from '../src/repositories/court.repository';
import { BookingRepository } from '../src/repositories/booking.repository';

const mockWaiting = () =>
  ({ create: jest.fn(), findById: jest.fn(), findManyByUser: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<WaitingListRepository>);
const mockCourts = () =>
  ({ findActiveById: jest.fn() } as unknown as jest.Mocked<CourtRepository>);
const mockBookings = () =>
  ({ findConflicting: jest.fn() } as unknown as jest.Mocked<BookingRepository>);

function build() {
  const waiting = mockWaiting();
  const courts = mockCourts();
  const bookings = mockBookings();
  return { service: new WaitingListService(waiting, courts, bookings), waiting, courts, bookings };
}

const input = {
  userId: 'u1',
  courtId: 'c1',
  preferredDate: '2999-06-20',
  preferredStart: '08:00',
  preferredEnd: '10:00',
};

describe('WaitingListService.join', () => {
  it('membuat entri jika slot sudah penuh (ada bentrok)', async () => {
    const { service, waiting, courts, bookings } = build();
    (courts.findActiveById as jest.Mock).mockResolvedValue({ id: 'c1' });
    (bookings.findConflicting as jest.Mock).mockResolvedValue([{ id: 'b1' }]);
    (waiting.create as jest.Mock).mockImplementation(async (d) => d);

    const result = await service.join(input);

    expect((result as { status: string }).status).toBe('waiting');
    expect(waiting.create).toHaveBeenCalled();
  });

  it('menolak (422) jika slot masih tersedia (tidak ada bentrok)', async () => {
    const { service, courts, bookings, waiting } = build();
    (courts.findActiveById as jest.Mock).mockResolvedValue({ id: 'c1' });
    (bookings.findConflicting as jest.Mock).mockResolvedValue([]);

    await expect(service.join(input)).rejects.toMatchObject({ statusCode: 422 });
    expect(waiting.create).not.toHaveBeenCalled();
  });

  it('menolak (404) jika court tidak aktif', async () => {
    const { service, courts } = build();
    (courts.findActiveById as jest.Mock).mockResolvedValue(null);

    await expect(service.join(input)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('WaitingListService.cancel', () => {
  it('menolak (403) jika entri milik user lain', async () => {
    const { service, waiting } = build();
    (waiting.findById as jest.Mock).mockResolvedValue({ id: 'w1', user_id: 'other', status: 'waiting' });

    await expect(service.cancel({ id: 'w1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 403 });
  });

  it('menolak (422) jika status sudah tidak bisa dibatalkan', async () => {
    const { service, waiting } = build();
    (waiting.findById as jest.Mock).mockResolvedValue({ id: 'w1', user_id: 'u1', status: 'booked' });

    await expect(service.cancel({ id: 'w1', userId: 'u1' })).rejects.toMatchObject({ statusCode: 422 });
  });
});
