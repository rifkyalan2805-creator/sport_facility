jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { NotificationService } from '../src/services/notification.service';
import { NotificationRepository } from '../src/repositories/notification.repository';
import { PushTokenRepository } from '../src/repositories/pushToken.repository';
import { EmailLogRepository } from '../src/repositories/emailLog.repository';
import { StaffService } from '../src/services/staff.service';
import { StaffRepository } from '../src/repositories/staff.repository';
import { StaffScheduleRepository } from '../src/repositories/staffSchedule.repository';
import { UserRepository } from '../src/repositories/user.repository';

// ---- Notifications ----
function buildNotif() {
  const notifications = { findById: jest.fn(), update: jest.fn(), markAllRead: jest.fn(), findManyByUser: jest.fn(), create: jest.fn() } as unknown as jest.Mocked<NotificationRepository>;
  const pushTokens = { findByToken: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), findManyByUser: jest.fn() } as unknown as jest.Mocked<PushTokenRepository>;
  const emailLogs = { create: jest.fn(), listAll: jest.fn() } as unknown as jest.Mocked<EmailLogRepository>;
  return { service: new NotificationService(notifications, pushTokens, emailLogs), notifications, pushTokens };
}

describe('NotificationService', () => {
  it('markRead: menolak (403) notifikasi milik user lain', async () => {
    const { service, notifications } = buildNotif();
    (notifications.findById as jest.Mock).mockResolvedValue({ id: 'n1', user_id: 'other' });
    await expect(service.markRead('n1', 'u1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('registerToken: token baru → create', async () => {
    const { service, pushTokens } = buildNotif();
    (pushTokens.findByToken as jest.Mock).mockResolvedValue(null);
    (pushTokens.create as jest.Mock).mockImplementation(async (d) => d);

    await service.registerToken('u1', 'tok-1', 'android');
    expect(pushTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', token: 'tok-1', platform: 'android' })
    );
  });

  it('registerToken: token sudah ada → update & aktifkan', async () => {
    const { service, pushTokens } = buildNotif();
    (pushTokens.findByToken as jest.Mock).mockResolvedValue({ id: 'pt1' });

    await service.registerToken('u1', 'tok-1', 'ios');
    expect(pushTokens.update).toHaveBeenCalledWith(
      'pt1',
      expect.objectContaining({ user_id: 'u1', is_active: true })
    );
  });
});

// ---- Staff ----
function buildStaff() {
  const staff = { findById: jest.fn(), findByUserId: jest.fn(), listAll: jest.fn(), create: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<StaffRepository>;
  const schedules = { listByStaff: jest.fn(), upsert: jest.fn() } as unknown as jest.Mocked<StaffScheduleRepository>;
  const users = { findById: jest.fn() } as unknown as jest.Mocked<UserRepository>;
  return { service: new StaffService(staff, schedules, users), staff, users };
}

describe('StaffService.createStaff', () => {
  it('membuat staff untuk user yang ada & belum jadi staff', async () => {
    const { service, staff, users } = buildStaff();
    (users.findById as jest.Mock).mockResolvedValue({ id: 'u1' });
    (staff.findByUserId as jest.Mock).mockResolvedValue(null);
    (staff.create as jest.Mock).mockImplementation(async (d) => d);

    await service.createStaff({ userId: 'u1', role: 'cashier', joinDate: '2026-01-01' });
    expect(staff.create).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'u1', role: 'cashier' }));
  });

  it('menolak (409) jika user sudah jadi staff', async () => {
    const { service, staff, users } = buildStaff();
    (users.findById as jest.Mock).mockResolvedValue({ id: 'u1' });
    (staff.findByUserId as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(
      service.createStaff({ userId: 'u1', role: 'cashier', joinDate: '2026-01-01' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('menolak (404) jika user tidak ada', async () => {
    const { service, users } = buildStaff();
    (users.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createStaff({ userId: 'x', role: 'cashier', joinDate: '2026-01-01' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
