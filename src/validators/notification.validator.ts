import { z } from 'zod';
import { notification_type } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createNotificationSchema = z.object({
  user_id: uuid,
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  type: z.nativeEnum(notification_type).default('system'),
  action_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listNotificationQuerySchema = z.object({
  unread: z.coerce.boolean().optional(),
});

export const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['web', 'ios', 'android']),
});

export const notificationIdParamSchema = z.object({ id: uuid });
export const pushTokenIdParamSchema = z.object({ id: uuid });

export type CreateNotificationBody = z.infer<typeof createNotificationSchema>;
export type ListNotificationQuery = z.infer<typeof listNotificationQuerySchema>;
export type RegisterPushTokenBody = z.infer<typeof registerPushTokenSchema>;
