jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { CourtService } from '../src/services/court.service';
import { CourtRepository } from '../src/repositories/court.repository';

const mockCourts = () =>
  ({
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    listSchedules: jest.fn(),
    findScheduleById: jest.fn(),
    upsertSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
  } as unknown as jest.Mocked<CourtRepository>);

function build() {
  const courts = mockCourts();
  return { service: new CourtService(courts), courts };
}

const createInput = {
  name: 'Court A',
  code: 'CA',
  type: 'paddle' as const,
  pricePerHour: 100000,
  capacity: 4,
  isIndoor: true,
  facilities: ['AC'],
  isActive: true,
  sortOrder: 0,
};

describe('CourtService', () => {
  it('createCourt memetakan field & menyimpan Decimal harga', async () => {
    const { service, courts } = build();
    (courts.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createCourt(createInput);

    const arg = (courts.create as jest.Mock).mock.calls[0][0];
    expect(arg.price_per_hour.toString()).toBe('100000');
    expect(arg.code).toBe('CA');
  });

  it('updateCourt melempar 404 jika court tidak ada', async () => {
    const { service, courts } = build();
    (courts.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.updateCourt('x', { name: 'B' })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(courts.update).not.toHaveBeenCalled();
  });

  it('deactivateCourt melakukan soft delete (is_active=false)', async () => {
    const { service, courts } = build();
    (courts.findById as jest.Mock).mockResolvedValue({ id: 'c1' });
    (courts.update as jest.Mock).mockResolvedValue({ id: 'c1', is_active: false });

    await service.deactivateCourt('c1');

    expect(courts.update).toHaveBeenCalledWith('c1', { is_active: false });
  });

  it('setSchedule melempar 404 jika court tidak ada', async () => {
    const { service, courts } = build();
    (courts.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.setSchedule('x', { dayOfWeek: 1, openTime: '06:00', closeTime: '22:00', isHolidayClosed: false })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deleteSchedule menolak jadwal milik court lain (404)', async () => {
    const { service, courts } = build();
    (courts.findScheduleById as jest.Mock).mockResolvedValue({ id: 's1', court_id: 'other' });

    await expect(service.deleteSchedule('c1', 's1')).rejects.toMatchObject({ statusCode: 404 });
    expect(courts.deleteSchedule).not.toHaveBeenCalled();
  });
});
