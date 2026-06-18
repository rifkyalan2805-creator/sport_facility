import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');

export const createCategorySchema = z
  .object({
    name: z.string().min(1).max(150),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().nonnegative(),
    quota: z.coerce.number().int().positive(),
    valid_from: dateStr,
    valid_until: dateStr,
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().default(0),
  })
  .refine((d) => d.valid_until >= d.valid_from, {
    message: 'valid_until harus >= valid_from',
    path: ['valid_until'],
  });

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().nonnegative().optional(),
    quota: z.coerce.number().int().positive().optional(),
    valid_from: dateStr.optional(),
    valid_until: dateStr.optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const buyTicketSchema = z.object({
  category_id: uuid,
  quantity: z.coerce.number().int().positive().default(1),
});

export const scanTicketSchema = z.object({
  qr_code: z.string().min(1, 'qr_code wajib diisi'),
  location: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const categoryIdParamSchema = z.object({ id: uuid });
export const ticketIdParamSchema = z.object({ id: uuid });

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type BuyTicketBody = z.infer<typeof buyTicketSchema>;
export type ScanTicketBody = z.infer<typeof scanTicketSchema>;
