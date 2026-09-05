import { Router } from 'express';
import { abonemenPackageController } from '../controllers/abonemenPackage.controller';
import { abonemenRegistrationController } from '../controllers/abonemenRegistration.controller';
import { userAbonemenController } from '../controllers/userAbonemen.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createRegistrationSchema,
  listRegistrationQuerySchema,
  registrationIdParamSchema,
  reviewRegistrationSchema,
} from '../validators/abonemenRegistration.validator';
import { listAbonemenQuerySchema } from '../validators/userAbonemen.validator';

const router = Router();
// Reception (staff) & superadmin boleh melihat + approve/reject registrasi abonemen.
const staffOrAdmin = [requireAuth, requireRole('staff', 'admin', 'superadmin')];

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
  ...staffOrAdmin,
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
 * /api/v1/abonemen/me:
 *   get:
 *     tags: [Abonemen]
 *     summary: Abonemen milik user yang sedang login
 *     description: >
 *       Abonemen yang sudah BERJALAN (hasil approval), bukan pengajuan.
 *       Tiap baris membawa `expiry_group` dan `total_sessions` (kuota awal
 *       paket) agar UI tidak menghitung ulang aturannya.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Daftar abonemen milik user }
 *       401: { description: Tidak terautentikasi }
 */
router.get('/me', requireAuth, userAbonemenController.listMine);

// ---- Abonemen yang sudah berjalan (hasil approval) ----

/**
 * @openapi
 * /api/v1/abonemen/active:
 *   get:
 *     tags: [Abonemen]
 *     summary: Daftar abonemen berjalan (reception & manajemen)
 *     description: >
 *       Berbeda dari `/registrations` yang berisi PENGAJUAN — endpoint ini
 *       berisi abonemen yang sudah aktif di tabel user_abonemen. Tiap baris
 *       memuat `expiry_group`: safe (hijau), warning (kuning, ≤7 hari lagi),
 *       expired (merah), inactive (abu-abu).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: group, schema: { type: string, enum: [safe, warning, expired, inactive] } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, expired, cancelled] } }
 *       - { in: query, name: search, schema: { type: string }, description: Nama panggilan / nama / email / paket }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200: { description: Daftar abonemen berjalan + meta paginasi }
 *       403: { description: Bukan reception/admin }
 */
router.get(
  '/active',
  ...staffOrAdmin,
  validate(listAbonemenQuerySchema, 'query'),
  userAbonemenController.listAll
);

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
  ...staffOrAdmin,
  validate(registrationIdParamSchema, 'params'),
  validate(reviewRegistrationSchema, 'body'),
  abonemenRegistrationController.review
);

export default router;
