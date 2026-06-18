import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createNotificationSchema,
  listNotificationQuerySchema,
  notificationIdParamSchema,
  pushTokenIdParamSchema,
  registerPushTokenSchema,
} from '../validators/notification.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

// ---- Push tokens (literal sebelum '/:id') ----
/**
 * @openapi
 * /api/v1/notifications/push-tokens:
 *   get: { tags: [Notifications], summary: List token device user, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post:
 *     tags: [Notifications]
 *     summary: Daftarkan FCM token
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [token, platform], properties: { token: { type: string }, platform: { type: string, enum: [web, ios, android] } } } } }
 *     responses: { 201: { description: Terdaftar } }
 */
router.get('/push-tokens', requireAuth, notificationController.listTokens);
router.post('/push-tokens', requireAuth, validate(registerPushTokenSchema, 'body'), notificationController.registerToken);
router.delete(
  '/push-tokens/:id',
  requireAuth,
  validate(pushTokenIdParamSchema, 'params'),
  notificationController.deactivateToken
);

/**
 * @openapi
 * /api/v1/notifications/email-logs:
 *   get: { tags: [Notifications], summary: Log email (admin), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 */
router.get('/email-logs', ...adminOnly, notificationController.listEmailLogs);

// ---- Notifications ----
/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Notifikasi in-app milik user
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: unread, schema: { type: boolean } }]
 *     responses: { 200: { description: Daftar notifikasi } }
 *   post:
 *     tags: [Notifications]
 *     summary: Kirim notifikasi ke user (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat } }
 */
router.get('/', requireAuth, validate(listNotificationQuerySchema, 'query'), notificationController.listMine);
router.post('/', ...adminOnly, validate(createNotificationSchema, 'body'), notificationController.create);

/**
 * @openapi
 * /api/v1/notifications/read-all:
 *   patch: { tags: [Notifications], summary: Tandai semua dibaca, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 */
router.patch('/read-all', requireAuth, notificationController.markAllRead);

/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Tandai satu notifikasi dibaca
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: OK }, 403: { description: Bukan milik user } }
 */
router.patch(
  '/:id/read',
  requireAuth,
  validate(notificationIdParamSchema, 'params'),
  notificationController.markRead
);

export default router;
