import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createReviewSchema,
  listReviewQuerySchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from '../validators/review.validator';

const router = Router();

/**
 * @openapi
 * /api/v1/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List ulasan terpublikasi untuk sebuah item (publik)
 *     parameters:
 *       - in: query
 *         name: item_type
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: item_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses: { 200: { description: Daftar ulasan } }
 *   post:
 *     tags: [Reviews]
 *     summary: Buat ulasan (user)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat }, 409: { description: Sudah pernah mengulas } }
 */
router.get('/', validate(listReviewQuerySchema, 'query'), reviewController.listByItem);
router.post('/', requireAuth, validate(createReviewSchema, 'body'), reviewController.create);

/**
 * @openapi
 * /api/v1/reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update ulasan sendiri
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui }, 403: { description: Bukan milik user } }
 *   delete:
 *     tags: [Reviews]
 *     summary: Hapus ulasan sendiri
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 204: { description: Dihapus } }
 */
router.patch(
  '/:id',
  requireAuth,
  validate(reviewIdParamSchema, 'params'),
  validate(updateReviewSchema, 'body'),
  reviewController.update
);
router.delete(
  '/:id',
  requireAuth,
  validate(reviewIdParamSchema, 'params'),
  reviewController.remove
);

export default router;
