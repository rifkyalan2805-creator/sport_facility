import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { occupancyQuerySchema, recordOccupancySchema } from '../validators/report.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

router.use(...adminOnly);

/**
 * @openapi
 * /api/v1/reports/occupancy:
 *   get:
 *     tags: [Reports]
 *     summary: Occupancy lapangan harian (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: court_id, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: date, required: true, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [Reports]
 *     summary: Catat/upsert occupancy per jam (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: OK } }
 */
router.get('/occupancy', validate(occupancyQuerySchema, 'query'), reportController.getOccupancy);
router.post('/occupancy', validate(recordOccupancySchema, 'body'), reportController.recordOccupancy);

export default router;
