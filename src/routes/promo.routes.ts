import { Router } from 'express';
import { promoController } from '../controllers/promo.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPromoSchema,
  promoIdParamSchema,
  updatePromoSchema,
  validatePromoSchema,
} from '../validators/promo.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/promos/validate:
 *   post:
 *     tags: [Promos]
 *     summary: Cek & hitung diskon dari kode promo
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, amount]
 *             properties:
 *               code: { type: string }
 *               amount: { type: number }
 *               item_types: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Promo valid + discountAmount }
 *       422: { description: Promo tidak valid / kuota habis / di luar masa berlaku }
 */
router.post('/validate', requireAuth, validate(validatePromoSchema, 'body'), promoController.validate);

/**
 * @openapi
 * /api/v1/promos:
 *   get:
 *     tags: [Promos]
 *     summary: List semua promo (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar promo } }
 *   post:
 *     tags: [Promos]
 *     summary: Buat promo (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat }, 409: { description: Kode sudah dipakai } }
 */
router.get('/', ...adminOnly, promoController.list);
router.post('/', ...adminOnly, validate(createPromoSchema, 'body'), promoController.create);

/**
 * @openapi
 * /api/v1/promos/{id}:
 *   get:
 *     tags: [Promos]
 *     summary: Detail promo (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Promos]
 *     summary: Update promo (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui } }
 */
router.get('/:id', ...adminOnly, validate(promoIdParamSchema, 'params'), promoController.getById);
router.patch(
  '/:id',
  ...adminOnly,
  validate(promoIdParamSchema, 'params'),
  validate(updatePromoSchema, 'body'),
  promoController.update
);

export default router;
