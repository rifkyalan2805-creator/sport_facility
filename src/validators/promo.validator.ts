import { z } from 'zod';
import { promo_type } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createPromoSchema = z
  .object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(150),
    description: z.string().max(2000).optional(),
    type: z.nativeEnum(promo_type).default('percentage'),
    discount_value: z.coerce.number().positive(),
    min_purchase: z.coerce.number().nonnegative().default(0),
    max_discount: z.coerce.number().positive().optional(),
    quota: z.coerce.number().int().positive().default(1),
    applicable_to: z.array(z.string()).default(['all']),
    valid_from: z.coerce.date(),
    valid_until: z.coerce.date(),
    is_active: z.boolean().default(true),
  })
  .refine((d) => d.valid_until > d.valid_from, {
    message: 'valid_until harus lebih besar dari valid_from',
    path: ['valid_until'],
  });

export const updatePromoSchema = z
  .object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(2000).optional(),
    type: z.nativeEnum(promo_type).optional(),
    discount_value: z.coerce.number().positive().optional(),
    min_purchase: z.coerce.number().nonnegative().optional(),
    max_discount: z.coerce.number().positive().optional(),
    quota: z.coerce.number().int().positive().optional(),
    applicable_to: z.array(z.string()).optional(),
    valid_from: z.coerce.date().optional(),
    valid_until: z.coerce.date().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const validatePromoSchema = z.object({
  code: z.string().min(1),
  amount: z.coerce.number().nonnegative(),
  item_types: z.array(z.string()).optional(),
});

export const promoIdParamSchema = z.object({ id: uuid });

export type CreatePromoBody = z.infer<typeof createPromoSchema>;
export type UpdatePromoBody = z.infer<typeof updatePromoSchema>;
export type ValidatePromoBody = z.infer<typeof validatePromoSchema>;
