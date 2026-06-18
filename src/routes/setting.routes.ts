import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { settingKeyParamSchema, upsertSettingSchema } from '../validators/setting.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/settings:
 *   get: { tags: [Settings], summary: List semua setting (publik — konfigurasi situs), responses: { 200: { description: OK } } }
 */
router.get('/', settingController.list);

/**
 * @openapi
 * /api/v1/settings/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Ambil setting per key
 *     parameters: [{ in: path, name: key, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK }, 404: { description: Tidak ditemukan } }
 *   put:
 *     tags: [Settings]
 *     summary: Upsert setting (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: key, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [value], properties: { value: {} } } } }
 *     responses: { 200: { description: Disimpan } }
 */
router.get('/:key', validate(settingKeyParamSchema, 'params'), settingController.getByKey);
router.put(
  '/:key',
  ...adminOnly,
  validate(settingKeyParamSchema, 'params'),
  validate(upsertSettingSchema, 'body'),
  settingController.upsert
);

export default router;
