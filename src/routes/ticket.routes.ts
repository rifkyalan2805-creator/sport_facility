import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  buyTicketSchema,
  categoryIdParamSchema,
  createCategorySchema,
  scanTicketSchema,
  ticketIdParamSchema,
  updateCategorySchema,
} from '../validators/ticket.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];
const staffOrAdmin = [requireAuth, requireRole('staff', 'admin', 'superadmin')];

// ---- Categories ----
/**
 * @openapi
 * /api/v1/tickets/categories:
 *   get:
 *     tags: [Tickets]
 *     summary: List kategori tiket aktif (publik)
 *     responses: { 200: { description: Daftar kategori } }
 *   post:
 *     tags: [Tickets]
 *     summary: Buat kategori tiket (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat } }
 */
router.get('/categories', ticketController.listCategories);
router.post('/categories', ...adminOnly, validate(createCategorySchema, 'body'), ticketController.createCategory);

/**
 * @openapi
 * /api/v1/tickets/categories/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Detail kategori
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Tickets]
 *     summary: Update kategori (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui } }
 *   delete:
 *     tags: [Tickets]
 *     summary: Nonaktifkan kategori (admin, soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dinonaktifkan } }
 */
router.get('/categories/:id', validate(categoryIdParamSchema, 'params'), ticketController.getCategory);
router.patch(
  '/categories/:id',
  ...adminOnly,
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  ticketController.updateCategory
);
router.delete(
  '/categories/:id',
  ...adminOnly,
  validate(categoryIdParamSchema, 'params'),
  ticketController.deactivateCategory
);

// ---- Tickets (user) ----
/**
 * @openapi
 * /api/v1/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Beli tiket HTM (reservasi kuota + pembayaran dummy)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id]
 *             properties:
 *               category_id: { type: string, format: uuid }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       201: { description: Tiket + payment dibuat }
 *       422: { description: Kuota habis / kategori tidak berlaku }
 */
router.post('/', requireAuth, validate(buyTicketSchema, 'body'), ticketController.buy);

/**
 * @openapi
 * /api/v1/tickets/me:
 *   get:
 *     tags: [Tickets]
 *     summary: List tiket milik user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar tiket } }
 */
router.get('/me', requireAuth, ticketController.listMine);

/**
 * @openapi
 * /api/v1/tickets/scan:
 *   post:
 *     tags: [Tickets]
 *     summary: Scan tiket di pintu masuk (staff/admin) → tiket used + log
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qr_code]
 *             properties:
 *               qr_code: { type: string }
 *               location: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Tiket digunakan }
 *       404: { description: Tiket tidak ditemukan }
 *       422: { description: Tiket tidak valid / kadaluarsa }
 */
router.post('/scan', ...staffOrAdmin, validate(scanTicketSchema, 'body'), ticketController.scan);

/**
 * @openapi
 * /api/v1/tickets/{id}/cancel:
 *   patch:
 *     tags: [Tickets]
 *     summary: Batalkan tiket (kuota dikembalikan)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dibatalkan }, 403: { description: Bukan milik user }, 422: { description: Tidak bisa dibatalkan } }
 */
router.patch(
  '/:id/cancel',
  requireAuth,
  validate(ticketIdParamSchema, 'params'),
  ticketController.cancel
);

export default router;
