import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimit';
import { validate } from '../middlewares/validate';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  updateMeSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrasi user baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, phone, full_name, nickname, password]
 *             properties:
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               full_name: { type: string }
 *               nickname: { type: string, minLength: 2, maxLength: 60, description: Nama panggilan }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: User dibuat + token }
 *       409: { description: Email/phone sudah terdaftar }
 */
router.post('/register', authLimiter, validate(registerSchema, 'body'), authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login dan dapatkan access + refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Berhasil login }
 *       401: { description: Kredensial salah }
 */
router.post('/login', authLimiter, validate(loginSchema, 'body'), authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotasi refresh token → access + refresh baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties: { refresh_token: { type: string } }
 *     responses:
 *       200: { description: Token baru }
 *       401: { description: Refresh token tidak valid/kedaluwarsa }
 */
router.post('/refresh', authLimiter, validate(refreshSchema, 'body'), authController.refresh);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh token (logout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties: { refresh_token: { type: string } }
 *     responses:
 *       200: { description: Logout berhasil }
 */
router.post('/logout', validate(refreshSchema, 'body'), authController.logout);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Profil user yang sedang login
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Data user }
 *       401: { description: Tidak terautentikasi }
 */
router.get('/me', requireAuth, authController.me);

/**
 * @openapi
 * /api/v1/auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Ubah profil sendiri
 *     description: >
 *       Kirim hanya field yang berubah; minimal satu. Email dan password
 *       TIDAK bisa diubah lewat endpoint ini. `photo_url` harus URL hasil
 *       POST /api/v1/uploads/avatar (atau null untuk menghapus foto).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               full_name: { type: string, minLength: 2, maxLength: 150 }
 *               nickname: { type: string, minLength: 2, maxLength: 60 }
 *               phone: { type: string }
 *               photo_url: { type: string, nullable: true }
 *     responses:
 *       200: { description: Profil terbaru }
 *       400: { description: Validasi gagal / tidak ada field yang dikenal dikirim }
 *       401: { description: Tidak terautentikasi }
 *       409: { description: Nomor telepon sudah dipakai akun lain }
 */
router.patch('/me', requireAuth, validate(updateMeSchema, 'body'), authController.updateMe);

export default router;
