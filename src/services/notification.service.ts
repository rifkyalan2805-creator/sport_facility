import { Prisma, notification_type } from '@prisma/client';
import { AppError } from '../utils/AppError';
import {
  NotificationRepository,
  notificationRepository,
} from '../repositories/notification.repository';
import { PushTokenRepository, pushTokenRepository } from '../repositories/pushToken.repository';
import { EmailLogRepository, emailLogRepository } from '../repositories/emailLog.repository';

interface CreateNotificationData {
  userId: string;
  title: string;
  body: string;
  type?: notification_type;
  actionUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  constructor(
    private readonly notifications: NotificationRepository = notificationRepository,
    private readonly pushTokens: PushTokenRepository = pushTokenRepository,
    private readonly emailLogs: EmailLogRepository = emailLogRepository
  ) {}

  // ---- Notifications ----
  listMine(userId: string, unreadOnly = false) {
    return this.notifications.findManyByUser(userId, unreadOnly);
  }

  /** Dipakai modul lain untuk mengirim notifikasi in-app ke user. */
  create(data: CreateNotificationData) {
    return this.notifications.create({
      user_id: data.userId,
      title: data.title,
      body: data.body,
      type: data.type ?? 'system',
      action_url: data.actionUrl ?? null,
      image_url: data.imageUrl ?? null,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    });
  }

  async markRead(id: string, userId: string) {
    const notif = await this.notifications.findById(id);
    if (!notif) throw AppError.notFound('Notifikasi tidak ditemukan');
    if (notif.user_id !== userId) throw new AppError(403, 'Bukan notifikasi Anda');
    return this.notifications.update(id, { is_read: true, read_at: new Date() });
  }

  markAllRead(userId: string) {
    return this.notifications.markAllRead(userId);
  }

  // ---- Push tokens ----
  listTokens(userId: string) {
    return this.pushTokens.findManyByUser(userId);
  }

  /** Daftarkan token device; jika token sudah ada, pindahkan ke user ini & aktifkan. */
  async registerToken(userId: string, token: string, platform: string) {
    const existing = await this.pushTokens.findByToken(token);
    if (existing) {
      return this.pushTokens.update(existing.id, {
        user_id: userId,
        platform,
        is_active: true,
      });
    }
    return this.pushTokens.create({ user_id: userId, token, platform });
  }

  async deactivateToken(id: string, userId: string) {
    const token = await this.pushTokens.findById(id);
    if (!token) throw AppError.notFound('Token tidak ditemukan');
    if (token.user_id !== userId) throw new AppError(403, 'Bukan token Anda');
    return this.pushTokens.update(id, { is_active: false });
  }

  // ---- Email logs ----
  listEmailLogs() {
    return this.emailLogs.listAll();
  }

  /**
   * "Kirim" email versi DUMMY — hanya mencatat ke email_logs (status sent).
   * Ganti dengan provider asli (SMTP/SendGrid) tanpa mengubah pemanggil.
   */
  logEmail(toEmail: string, subject: string, template?: string, userId?: string) {
    return this.emailLogs.create({
      user_id: userId ?? null,
      to_email: toEmail,
      subject,
      template: template ?? null,
      status: 'sent',
      sent_at: new Date(),
    });
  }
}

export const notificationService = new NotificationService();
