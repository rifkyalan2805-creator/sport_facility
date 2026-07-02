import { Router } from 'express';
import { pricingController } from '../controllers/pricing.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPadelPriceSchema,
  createTennisPriceSchema,
  priceIdParamSchema,
  updatePadelPriceSchema,
  updateTennisPriceSchema,
} from '../validators/pricing.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/pricing:
 *   get:
 *     tags: [Pricing]
 *     summary: Harga per-sport (tenis & padel) — publik
 *     responses: { 200: { description: "{ tennis: [], padel: [] }" } }
 */
router.get('/', pricingController.list);

// ---- Tennis (admin) ----
router.post('/tennis', ...adminOnly, validate(createTennisPriceSchema, 'body'), pricingController.createTennis);
router.patch(
  '/tennis/:id',
  ...adminOnly,
  validate(priceIdParamSchema, 'params'),
  validate(updateTennisPriceSchema, 'body'),
  pricingController.updateTennis,
);
router.delete('/tennis/:id', ...adminOnly, validate(priceIdParamSchema, 'params'), pricingController.deleteTennis);

// ---- Padel (admin) ----
router.post('/padel', ...adminOnly, validate(createPadelPriceSchema, 'body'), pricingController.createPadel);
router.patch(
  '/padel/:id',
  ...adminOnly,
  validate(priceIdParamSchema, 'params'),
  validate(updatePadelPriceSchema, 'body'),
  pricingController.updatePadel,
);
router.delete('/padel/:id', ...adminOnly, validate(priceIdParamSchema, 'params'), pricingController.deletePadel);

export default router;
