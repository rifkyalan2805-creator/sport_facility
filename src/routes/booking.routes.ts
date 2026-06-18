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
