import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  categoryIdParamSchema,
  createCategorySchema,
  createEventSchema,
  eventIdParamSchema,
  eventSlugParamSchema,
  registrationIdParamSchema,
  scanRegistrationSchema,
  updateCategorySchema,
  updateEventSchema,
} from '../validators/event.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];
const staffOrAdmin = [requireAuth, requireRole('staff', 'admin', 'superadmin')];

// ---- Categories (didefinisikan sebelum '/:id' agar tidak tertangkap param) ----
/**
 * @openapi
 * /api/v1/events/categories:
 *   get:
 *     tags: [Events]
 *     summary: List kategori event (publik)
 *     responses: { 200: { description: Daftar kategori } }
 *   post:
 *     tags: [Events]
 *     summary: Buat kategori event (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat } }
 */
router.get('/categories', eventController.listCategories);
router.post('/categories', ...adminOnly, validate(createCategorySchema, 'body'), eventController.createCategory);
router.patch(
  '/categories/:id',
  ...adminOnly,
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  eventController.updateCategory
);

// ---- Registrations (literal path sebelum '/:id') ----
/**
 * @openapi
 * /api/v1/events/registrations/me:
 *   get:
 *     tags: [Events]
 *     summary: List registrasi event milik user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar registrasi } }
 */
router.get('/registrations/me', requireAuth, eventController.listMine);

/**
 * @openapi
 * /api/v1/events/registrations/scan:
 *   post:
 *     tags: [Events]
 *     summary: Check-in peserta via QR (staff/admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qr_code]
 *             properties: { qr_code: { type: string } }
 *     responses:
 *       200: { description: Checked-in }
 *       422: { description: Registrasi belum dikonfirmasi }
 */
router.post('/registrations/scan', ...staffOrAdmin, validate(scanRegistrationSchema, 'body'), eventController.scan);

/**
 * @openapi
 * /api/v1/events/registrations/{id}/cancel:
 *   patch:
 *     tags: [Events]
 *     summary: Batalkan registrasi (kuota dikembalikan)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dibatalkan }, 403: { description: Bukan milik user }, 422: { description: Tidak bisa dibatalkan } }
 */
router.patch(
  '/registrations/:id/cancel',
  requireAuth,
  validate(registrationIdParamSchema, 'params'),
  eventController.cancel
);

// ---- Events ----
/**
 * @openapi
 * /api/v1/events:
 *   get:
 *     tags: [Events]
 *     summary: List event published (publik)
 *     responses: { 200: { description: Daftar event } }
 *   post:
 *     tags: [Events]
 *     summary: Buat event (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat } }
 */
router.get('/', eventController.list);
// Semua event (draft/lampau juga) untuk admin. Literal '/all' sebelum '/:id'.
router.get('/all', ...adminOnly, eventController.listAll);
router.post('/', ...adminOnly, validate(createEventSchema, 'body'), eventController.create);

/**
 * @openapi
 * /api/v1/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Detail event
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Events]
 *     summary: Update event (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui } }
 */
// Literal '/slug/:slug' sebelum '/:id' (aman: beda arity, tapi eksplisit).
router.get('/slug/:slug', validate(eventSlugParamSchema, 'params'), eventController.getBySlug);
router.get('/:id', validate(eventIdParamSchema, 'params'), eventController.getById);
router.patch(
  '/:id',
  ...adminOnly,
  validate(eventIdParamSchema, 'params'),
  validate(updateEventSchema, 'body'),
  eventController.update
);

/**
 * @openapi
 * /api/v1/events/{id}/register:
 *   post:
 *     tags: [Events]
 *     summary: Registrasi event (gratis → confirmed; berbayar → + pembayaran dummy)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses:
 *       201: { description: Registrasi dibuat (+ payment jika berbayar) }
 *       409: { description: Sudah terdaftar }
 *       422: { description: Kuota penuh / belum published / lewat deadline }
 */
router.post('/:id/register', requireAuth, validate(eventIdParamSchema, 'params'), eventController.register);

export default router;
