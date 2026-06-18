import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPlanSchema,
  membershipIdParamSchema,
  planIdParamSchema,
  subscribeSchema,
  updatePlanSchema,
} from '../validators/membership.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/membership/plans:
 *   get:
 *     tags: [Membership]
 *     summary: List plan membership aktif (publik)
 *     responses: { 200: { description: Daftar plan } }
 *   post:
 *     tags: [Membership]
 *     summary: Buat plan (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Plan dibuat }, 409: { description: Slug sudah dipakai } }
 */
router.get('/plans', membershipController.listPlans);
router.post('/plans', ...adminOnly, validate(createPlanSchema, 'body'), membershipController.createPlan);

/**
 * @openapi
 * /api/v1/membership/plans/{id}:
 *   get:
 *     tags: [Membership]
 *     summary: Detail plan
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Membership]
 *     summary: Update plan (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui } }
 *   delete:
 *     tags: [Membership]
 *     summary: Nonaktifkan plan (admin, soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dinonaktifkan } }
 */
router.get('/plans/:id', validate(planIdParamSchema, 'params'), membershipController.getPlan);
router.patch(
  '/plans/:id',
  ...adminOnly,
  validate(planIdParamSchema, 'params'),
  validate(updatePlanSchema, 'body'),
  membershipController.updatePlan
);
router.delete(
  '/plans/:id',
  ...adminOnly,
  validate(planIdParamSchema, 'params'),
  membershipController.deactivatePlan
);

/**
 * @openapi
 * /api/v1/membership/me:
 *   get:
 *     tags: [Membership]
 *     summary: List membership milik user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar membership } }
 */
router.get('/me', requireAuth, membershipController.listMine);

/**
 * @openapi
 * /api/v1/membership/subscribe:
 *   post:
 *     tags: [Membership]
 *     summary: Berlangganan plan (buat membership pending + pembayaran dummy)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id]
 *             properties:
 *               plan_id: { type: string, format: uuid }
 *               auto_renew: { type: boolean }
 *     responses:
 *       201: { description: Membership + payment dibuat }
 *       404: { description: Plan tidak ditemukan }
 *       409: { description: Sudah ada membership aktif/pending }
 */
router.post('/subscribe', requireAuth, validate(subscribeSchema, 'body'), membershipController.subscribe);

/**
 * @openapi
 * /api/v1/membership/{id}/cancel:
 *   patch:
 *     tags: [Membership]
 *     summary: Batalkan membership
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dibatalkan }, 403: { description: Bukan milik user }, 422: { description: Tidak bisa dibatalkan } }
 */
router.patch(
  '/:id/cancel',
  requireAuth,
  validate(membershipIdParamSchema, 'params'),
  membershipController.cancel
);

export default router;
