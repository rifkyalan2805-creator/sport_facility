import { Router } from 'express';
import { poolController } from '../controllers/pool.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  buyTicketSchema,
  createSessionSchema,
  createTicketTypeSchema,
  poolCheckoutSchema,
  sessionIdParamSchema,
  ticketIdParamSchema,
  ticketTypeIdParamSchema,
  updateSessionSchema,
  updateTicketTypeSchema,
} from '../validators/pool.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

// ---- Sessions ----
/**
 * @openapi
 * /api/v1/pool/sessions:
 *   get:
 *     tags: [Pool]
 *     summary: List sesi kolam yang akan datang (publik)
 *     responses: { 200: { description: Daftar sesi } }
 *   post:
 *     tags: [Pool]
 *     summary: Buat sesi kolam (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Sesi dibuat } }
 */
router.get('/sessions', poolController.listSessions);
router.post('/sessions', ...adminOnly, validate(createSessionSchema, 'body'), poolController.createSession);

/**
 * @openapi
 * /api/v1/pool/sessions/{id}:
 *   get:
 *     tags: [Pool]
 *     summary: Detail sesi
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Detail }, 404: { description: Tidak ditemukan } }
 *   patch:
 *     tags: [Pool]
 *     summary: Update sesi (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diperbarui } }
 */
router.get('/sessions/:id', validate(sessionIdParamSchema, 'params'), poolController.getSession);
router.patch(
  '/sessions/:id',
  ...adminOnly,
  validate(sessionIdParamSchema, 'params'),
  validate(updateSessionSchema, 'body'),
  poolController.updateSession
);

// ---- Ticket types ----
/**
 * @openapi
 * /api/v1/pool/ticket-types:
 *   get:
 *     tags: [Pool]
 *     summary: List tipe tiket aktif (publik)
 *     responses: { 200: { description: Daftar tipe tiket } }
 *   post:
 *     tags: [Pool]
 *     summary: Buat tipe tiket (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Dibuat } }
 */
router.get('/ticket-types', poolController.listTicketTypes);
router.post(
  '/ticket-types',
  ...adminOnly,
  validate(createTicketTypeSchema, 'body'),
  poolController.createTicketType
);
router.patch(
  '/ticket-types/:id',
  ...adminOnly,
  validate(ticketTypeIdParamSchema, 'params'),
  validate(updateTicketTypeSchema, 'body'),
  poolController.updateTicketType
);

// ---- Tickets (user) ----
/**
 * @openapi
 * /api/v1/pool/tickets:
 *   post:
 *     tags: [Pool]
 *     summary: Beli tiket kolam (reservasi kuota + pembayaran dummy)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [session_id, ticket_type_id]
 *             properties:
 *               session_id: { type: string, format: uuid }
 *               ticket_type_id: { type: string, format: uuid }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       201: { description: Tiket + payment dibuat }
 *       422: { description: Kuota penuh / sesi tidak open }
 */
router.post('/tickets', requireAuth, validate(buyTicketSchema, 'body'), poolController.buyTicket);

/**
 * @openapi
 * /api/v1/pool/checkout:
 *   post:
 *     tags: [Pool]
 *     summary: Checkout grup — banyak tiket 1 sesi → 1 pembayaran + diskon grup otomatis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema: { type: string }
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [session_id, items]
 *             properties:
 *               session_id: { type: string, format: uuid }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ticket_type_id, quantity]
 *                   properties:
 *                     ticket_type_id: { type: string, format: uuid }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Tiket + 1 payment (diskon grup) dibuat }
 *       422: { description: Kuota penuh / sesi tidak open }
 */
router.post('/checkout', requireAuth, validate(poolCheckoutSchema, 'body'), poolController.checkout);

/**
 * @openapi
 * /api/v1/pool/tickets/me:
 *   get:
 *     tags: [Pool]
 *     summary: List tiket kolam milik user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar tiket } }
 */
router.get('/tickets/me', requireAuth, poolController.listMyTickets);

/**
 * @openapi
 * /api/v1/pool/tickets/{id}/cancel:
 *   patch:
 *     tags: [Pool]
 *     summary: Batalkan tiket (kuota dikembalikan)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Dibatalkan }, 403: { description: Bukan milik user }, 422: { description: Tidak bisa dibatalkan } }
 */
router.patch(
  '/tickets/:id/cancel',
  requireAuth,
  validate(ticketIdParamSchema, 'params'),
  poolController.cancelTicket
);

export default router;
