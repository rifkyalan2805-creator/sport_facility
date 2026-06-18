import { Router } from 'express';
import { loyaltyController } from '../controllers/loyalty.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /api/v1/loyalty/me:
 *   get:
 *     tags: [Loyalty]
 *     summary: Ringkasan saldo poin user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: total/used/expired/available } }
 */
router.get('/me', loyaltyController.me);

/**
 * @openapi
 * /api/v1/loyalty/transactions:
 *   get:
 *     tags: [Loyalty]
 *     summary: Riwayat transaksi poin user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Daftar transaksi poin } }
 */
router.get('/transactions', loyaltyController.transactions);

export default router;
