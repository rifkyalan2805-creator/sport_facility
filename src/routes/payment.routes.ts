import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPaymentSchema,
  listPaymentQuerySchema,
  paymentIdParamSchema,
  simulateFailureSchema,
} from '../validators/payment.validator';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Buat pembayaran (status awal PENDING)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema: { type: string }
 *         required: false
 *         description: Cegah pembayaran ganda dari request yang sama
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreatePaymentRequest' }
 *     responses:
 *       201: { description: Pembayaran dibuat, content: { application/json: { schema: { $ref: '#/components/schemas/PaymentResponse' } } } }
 *       400: { description: Validasi gagal }
 *       422: { description: Metode pembayaran tidak valid }
 */
router.post('/', validate(createPaymentSchema, 'body'), paymentController.create);

/**
 * @openapi
 * /api/v1/payments:
 *   get:
 *     tags: [Payments]
 *     summary: List pembayaran milik user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, paid, failed, expired, refunded, partial_refund] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Daftar pembayaran }
 */
router.get('/', validate(listPaymentQuerySchema, 'query'), paymentController.list);

/**
 * @openapi
 * /api/v1/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Detail pembayaran
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Detail pembayaran }
 *       403: { description: Bukan milik user }
 *       404: { description: Tidak ditemukan }
 */
router.get('/:id', validate(paymentIdParamSchema, 'params'), paymentController.getById);

/**
 * @openapi
 * /api/v1/payments/{id}/simulate/success:
 *   post:
 *     tags: [Payments]
 *     summary: (DUMMY) Simulasikan pembayaran BERHASIL
 *     description: Mengubah status menjadi paid, meng-confirm booking terkait, dan membuat invoice. Pengganti webhook gateway asli.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Pembayaran berhasil disimulasikan }
 *       422: { description: Status bukan pending }
 */
router.post(
  '/:id/simulate/success',
  validate(paymentIdParamSchema, 'params'),
  paymentController.simulateSuccess
);

/**
 * @openapi
 * /api/v1/payments/{id}/simulate/failure:
 *   post:
 *     tags: [Payments]
 *     summary: (DUMMY) Simulasikan pembayaran GAGAL
 *     description: Mengubah status menjadi failed. Booking tetap pada status sebelumnya.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { reason: { type: string } }
 *     responses:
 *       200: { description: Pembayaran gagal disimulasikan }
 *       422: { description: Status bukan pending }
 */
router.post(
  '/:id/simulate/failure',
  validate(paymentIdParamSchema, 'params'),
  validate(simulateFailureSchema, 'body'),
  paymentController.simulateFailure
);

export default router;
