import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');
const timeStr = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm (24 jam)');

// ---- Tennis ----
export const createTennisPriceSchema = z.object({
  booking_type: z.enum(['insidentil', 'abonemen']),
  with_light: z.boolean(),
  price: z.coerce.number().nonnegative(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const updateTennisPriceSchema = z
  .object({
    booking_type: z.enum(['insidentil', 'abonemen']).optional(),
    with_light: z.boolean().optional(),
    price: z.coerce.number().nonnegative().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

// ---- Padel ----
export const createPadelPriceSchema = z.object({
  label: z.string().min(1).max(30),
  price: z.coerce.number().nonnegative(),
  time_start: timeStr.optional(),
  time_end: timeStr.optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const updatePadelPriceSchema = z
  .object({
    label: z.string().min(1).max(30).optional(),
    price: z.coerce.number().nonnegative().optional(),
    time_start: timeStr.nullable().optional(),
    time_end: timeStr.nullable().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const priceIdParamSchema = z.object({ id: uuid });

export type CreateTennisPriceBody = z.infer<typeof createTennisPriceSchema>;
export type UpdateTennisPriceBody = z.infer<typeof updateTennisPriceSchema>;
export type CreatePadelPriceBody = z.infer<typeof createPadelPriceSchema>;
export type UpdatePadelPriceBody = z.infer<typeof updatePadelPriceSchema>;
