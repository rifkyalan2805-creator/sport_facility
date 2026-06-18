import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative(),
  duration_days: z.coerce.number().int().positive(),
  max_bookings_month: z.coerce.number().int().min(0).default(0),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  benefits: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const updatePlanSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().nonnegative().optional(),
    duration_days: z.coerce.number().int().positive().optional(),
    max_bookings_month: z.coerce.number().int().min(0).optional(),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    benefits: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: 'Minimal satu field untuk diupdate',
  });

export const subscribeSchema = z.object({
  plan_id: uuid,
  auto_renew: z.boolean().default(false),
});

export const planIdParamSchema = z.object({ id: uuid });
export const membershipIdParamSchema = z.object({ id: uuid });

export type CreatePlanBody = z.infer<typeof createPlanSchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanSchema>;
export type SubscribeBody = z.infer<typeof subscribeSchema>;
