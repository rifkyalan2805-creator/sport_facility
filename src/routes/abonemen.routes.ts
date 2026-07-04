import { Router } from 'express';
import { abonemenPackageController } from '../controllers/abonemenPackage.controller';
import { abonemenRegistrationController } from '../controllers/abonemenRegistration.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createRegistrationSchema,
  listRegistrationQuerySchema,
  registrationIdParamSchema,
  reviewRegistrationSchema,
} from '../validators/abonemenRegistration.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

/**
 * @openapi
 * /api/v1/abonemen/packages:
 *   get:
 *     tags: [Abonemen]
 *     summary: Daftar paket abonemen aktif (sumber pilihan layanan) — publik
 *     responses: { 200: { description: "Array paket abonemen" } }
 */
router.get('/packages', abonemenPackageController.list);

// ---- Registrasi abonemen ----

/**
 * @openapi
 * /api/v1/abonemen/registrations:
 *   post:
 *     tags: [Abonemen]
 *     summary: Ajukan registrasi abonemen (wajib login)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Pengajuan dibuat (pending) } }
 *   get:
 *     tags: [Abonemen]
 *     summary: Daftar semua pengajuan (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar pengajuan } }
 */
router.post(
  '/registrations',
  requireAuth,
  validate(createRegistrationSchema, 'body'),
  abonemenRegistrationController.create
);
router.get(
  '/registrations',
  ...adminOnly,
  validate(listRegistrationQuerySchema, 'query'),
  abonemenRegistrationController.listAll
);

/**
 * @openapi
 * /api/v1/abonemen/registrations/me:
 *   get:
 *     tags: [Abonemen]
 *     summary: Pengajuan milik user yang login
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar pengajuan user } }
 */
router.get('/registrations/me', requireAuth, abonemenRegistrationController.listMine);

/**
 * @openapi
 * /api/v1/abonemen/registrations/{id}/review:
 *   patch:
 *     tags: [Abonemen]
 *     summary: Approve/Reject pengajuan (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Pengajuan diperbarui } }
 */
router.patch(
  '/registrations/:id/review',
  ...adminOnly,
  validate(registrationIdParamSchema, 'params'),
  validate(reviewRegistrationSchema, 'body'),
  abonemenRegistrationController.review
);

export default router;
