import { Router } from 'express';
import { waitingListController } from '../controllers/waitingList.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  joinWaitingListSchema,
  waitingIdParamSchema,
} from '../validators/waitingList.validator';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/waiting-list:
 *   post:
 *     tags: [WaitingList]
 *     summary: Masuk antrean untuk slot yang sudah penuh
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [court_id, preferred_date, preferred_start, preferred_end]
 *             properties:
 *               court_id: { type: string, format: uuid }
 *               preferred_date: { type: string, example: "2026-06-20" }
 *               preferred_start: { type: string, example: "08:00" }
 *               preferred_end: { type: string, example: "10:00" }
 *     responses:
 *       201: { description: Masuk antrean }
 *       422: { description: Slot masih tersedia / court tidak aktif }
 *   get:
 *     tags: [WaitingList]
 *     summary: List antrean milik user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Daftar antrean }
 */
router.post('/', validate(joinWaitingListSchema, 'body'), waitingListController.join);
router.get('/', waitingListController.listMine);

/**
 * @openapi
 * /api/v1/waiting-list/{id}/cancel:
 *   patch:
 *     tags: [WaitingList]
 *     summary: Batalkan entri antrean
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses:
 *       200: { description: Dibatalkan }
 *       403: { description: Bukan milik user }
 *       422: { description: Status tidak bisa dibatalkan }
 */
router.patch(
  '/:id/cancel',
  validate(waitingIdParamSchema, 'params'),
  waitingListController.cancel
);

export default router;
