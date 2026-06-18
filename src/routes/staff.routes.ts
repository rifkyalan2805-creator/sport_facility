import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createStaffSchema,
  setScheduleSchema,
  staffIdParamSchema,
  updateStaffSchema,
} from '../validators/staff.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

router.use(...adminOnly); // seluruh manajemen staff = admin

/**
 * @openapi
 * /api/v1/staff:
 *   get: { tags: [Staff], summary: List staff (admin), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post:
 *     tags: [Staff]
 *     summary: Jadikan user sebagai staff (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat }, 409: { description: Sudah staff } }
 */
router.get('/', staffController.list);
router.post('/', validate(createStaffSchema, 'body'), staffController.create);

/**
 * @openapi
 * /api/v1/staff/{id}:
 *   patch:
 *     tags: [Staff]
 *     summary: Update staff (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: OK } }
 */
router.patch(
  '/:id',
  validate(staffIdParamSchema, 'params'),
  validate(updateStaffSchema, 'body'),
  staffController.update
);

/**
 * @openapi
 * /api/v1/staff/{id}/schedules:
 *   get: { tags: [Staff], summary: Jadwal shift staff, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }], responses: { 200: { description: OK } } }
 *   put:
 *     tags: [Staff]
 *     summary: Set/upsert jadwal shift per tanggal
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id/schedules', validate(staffIdParamSchema, 'params'), staffController.listSchedules);
router.put(
  '/:id/schedules',
  validate(staffIdParamSchema, 'params'),
  validate(setScheduleSchema, 'body'),
  staffController.setSchedule
);

export default router;
