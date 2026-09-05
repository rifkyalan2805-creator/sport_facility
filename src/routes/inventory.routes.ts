import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  adjustStockSchema,
  categoryIdParamSchema,
  createCategorySchema,
  createProductSchema,
  productIdParamSchema,
  updateCategorySchema,
  updateProductSchema,
} from '../validators/inventory.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

// ---- Categories ----
/**
 * @openapi
 * /api/v1/inventory/categories:
 *   get: { tags: [Inventory], summary: List kategori produk, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Inventory], summary: Buat kategori (superadmin/admin), security: [{ bearerAuth: [] }], responses: { 201: { description: OK } } }
 */
router.get('/categories', ...adminOnly, inventoryController.listCategories);
router.post('/categories', ...adminOnly, validate(createCategorySchema, 'body'), inventoryController.createCategory);
router.patch(
  '/categories/:id',
  ...adminOnly,
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  inventoryController.updateCategory
);

// ---- Products ----
/**
 * @openapi
 * /api/v1/inventory/products:
 *   get: { tags: [Inventory], summary: List produk aktif, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Inventory], summary: Buat produk (superadmin/admin), security: [{ bearerAuth: [] }], responses: { 201: { description: OK }, 409: { description: SKU dipakai } } }
 */
router.get('/products', ...adminOnly, inventoryController.listProducts);
router.post('/products', ...adminOnly, validate(createProductSchema, 'body'), inventoryController.createProduct);
router.get('/products/:id', ...adminOnly, validate(productIdParamSchema, 'params'), inventoryController.getProduct);
router.patch(
  '/products/:id',
  ...adminOnly,
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  inventoryController.updateProduct
);

/**
 * @openapi
 * /api/v1/inventory/products/{id}/stock:
 *   post:
 *     tags: [Inventory]
 *     summary: Pergerakan stok (in/out/adjustment/sale/return)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [type, quantity], properties: { type: { type: string, enum: [in, out, adjustment, sale, return] }, quantity: { type: integer }, notes: { type: string } } } } }
 *     responses: { 201: { description: Log dibuat }, 422: { description: Stok negatif } }
 */
router.post(
  '/products/:id/stock',
  ...adminOnly,
  validate(productIdParamSchema, 'params'),
  validate(adjustStockSchema, 'body'),
  inventoryController.adjustStock
);
router.get(
  '/products/:id/logs',
  ...adminOnly,
  validate(productIdParamSchema, 'params'),
  inventoryController.listLogs
);

export default router;
