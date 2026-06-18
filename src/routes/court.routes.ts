import { Router } from 'express';
import { courtController } from '../controllers/court.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  courtIdParamSchema,
  createCourtSchema,
  scheduleParamsSchema,
  setScheduleSchema,
  updateCourtSchema,
} from '../validators/court.validator';

const router = Router();

// Hanya admin/superadmin yang boleh menulis data court.
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/courts:
 *   get:
 *     tags: [Courts]
 *     summary: List court aktif (publik)
 *     responses:
 *       200: { description: Daftar court }
 *   post:
 *     tags: [Courts]
 *     summary: Buat court (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Court dibuat }
 *       403: { description: Bukan admin }
 *       409: { description: Kode court sudah dipakai }
 */
router.get('/', courtController.list);
router.post('/', ...adminOnly, validate(createCourtSchema, 'body'), courtController.create);

/**
 * @openapi
 * /api/v1/courts/{id}:
 *   get:
 *     tags: [Courts]
 *     summary: Detail court
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail court }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Courts]
 *     summary: Update court (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Court diperbarui } }
 *   delete:
 *     tags: [Courts]
 *     summary: Nonaktifkan court (admin, soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Court dinonaktifkan } }
 */
router.get('/:id', validate(courtIdParamSchema, 'params'), courtController.getById);
router.patch(
  '/:id',
  ...adminOnly,
  validate(courtIdParamSchema, 'params'),
  validate(updateCourtSchema, 'body'),
  courtController.update
);
router.delete(
  '/:id',
  ...adminOnly,
  validate(courtIdParamSchema, 'params'),
  courtController.deactivate
);

/**
 * @openapi
 * /api/v1/courts/{id}/schedules:
 *   get:
 *     tags: [Courts]
 *     summary: List jadwal operasional court
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Daftar jadwal } }
 *   put:
 *     tags: [Courts]
 *     summary: Set/Upsert jadwal satu hari (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [day_of_week, open_time, close_time]
 *             properties:
 *               day_of_week: { type: integer, minimum: 0, maximum: 6 }
 *               open_time: { type: string, example: "06:00" }
 *               close_time: { type: string, example: "22:00" }
 *               is_holiday_closed: { type: boolean }
 *     responses: { 200: { description: Jadwal disimpan } }
 */
router.get(
  '/:id/schedules',
  validate(courtIdParamSchema, 'params'),
  courtController.listSchedules
);
router.put(
  '/:id/schedules',
  ...adminOnly,
  validate(courtIdParamSchema, 'params'),
  validate(setScheduleSchema, 'body'),
  courtController.setSchedule
);
router.delete(
  '/:id/schedules/:scheduleId',
  ...adminOnly,
  validate(scheduleParamsSchema, 'params'),
  courtController.deleteSchedule
);

export default router;
