import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120).optional(),
  parent_id: uuid.optional(),
  sort_order: z.coerce.number().int().default(0),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(120).optional(),
    parent_id: uuid.nullable().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const createProductSchema = z.object({
  category_id: uuid,
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(80),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative(),
  cost_price: z.coerce.number().nonnegative().default(0),
  stock: z.coerce.number().int().min(0).default(0),
  min_stock: z.coerce.number().int().min(0).default(5),
  image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = z
  .object({
    category_id: uuid.optional(),
    name: z.string().min(1).max(200).optional(),
    sku: z.string().min(1).max(80).optional(),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().nonnegative().optional(),
    cost_price: z.coerce.number().nonnegative().optional(),
    min_stock: z.coerce.number().int().min(0).optional(),
    image_url: z.string().url().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const adjustStockSchema = z.object({
  type: z.enum(['in', 'out', 'adjustment', 'sale', 'return']),
  quantity: z.coerce.number().int().min(0),
  notes: z.string().max(500).optional(),
});

export const categoryIdParamSchema = z.object({ id: uuid });
export const productIdParamSchema = z.object({ id: uuid });

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type AdjustStockBody = z.infer<typeof adjustStockSchema>;
