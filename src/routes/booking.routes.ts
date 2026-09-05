import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  bookingIdParamSchema,
  cancelBookingSchema,
  createBookingSchema,
  listBookingQuerySchema,
} from '../validators/booking.validator';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createBookingSchema, 'body'), bookingController.create);

/**
 * @openapi
 * /api/v1/bookings:
 *   get:
 *     tags: [Booking]
 *     summary: Daftar booking (milik sendiri; `scope=all` untuk reception/admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: scope, schema: { type: string, enum: [me, all], default: me } }
 *       - { in: query, name: court_id, schema: { type: string, format: uuid } }
 *       - in: query
 *         name: court_type
 *         schema: { type: string, enum: [paddle, badminton, tennis, basketball, futsal, other] }
 *         description: Saring per cabang olahraga (lewat courts.type)
 *       - in: query
 *         name: booking_type
 *         schema: { type: string, enum: [insidentil, abonemen] }
 *       - { in: query, name: status, schema: { type: string, enum: [pending, confirmed, checked_in, completed, cancelled, no_show] } }
 *       - { in: query, name: booking_date, schema: { type: string, format: date } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200: { description: Daftar booking + meta paginasi }
 */
router.get('/', validate(listBookingQuerySchema, 'query'), bookingController.list);

router.get(
  '/:id',
  validate(bookingIdParamSchema, 'params'),
  bookingController.getById
);

router.patch(
  '/:id/cancel',
  validate(bookingIdParamSchema, 'params'),
  validate(cancelBookingSchema, 'body'),
  bookingController.cancel
);

router.patch(
  '/:id/check-in',
  validate(bookingIdParamSchema, 'params'),
  bookingController.checkIn
);

export default router;
