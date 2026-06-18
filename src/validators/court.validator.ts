import { z } from 'zod';
import { court_type } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');
const timeStr = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm (24 jam)');

export const createCourtSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  type: z.nativeEnum(court_type).default('paddle'),
  price_per_hour: z.coerce.number().nonnegative(),
  capacity: z.coerce.number().int().positive().default(4),
  is_indoor: z.boolean().default(true),
  facilities: z.array(z.string()).default([]),
  image_url: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

// Update: tanpa default agar PATCH hanya mengubah field yang dikirim.
export const updateCourtSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).optional(),
    type: z.nativeEnum(court_type).optional(),
    price_per_hour: z.coerce.number().nonnegative().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    is_indoor: z.boolean().optional(),
    facilities: z.array(z.string()).optional(),
    image_url: z.string().url().optional(),
    description: z.string().max(2000).optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: 'Minimal satu field untuk diupdate',
  });

export const setScheduleSchema = z
  .object({
    day_of_week: z.coerce.number().int().min(0).max(6),
    open_time: timeStr,
    close_time: timeStr,
    is_holiday_closed: z.boolean().default(false),
  })
  .refine((d) => d.close_time > d.open_time, {
    message: 'close_time harus lebih besar dari open_time',
    path: ['close_time'],
  });

export const courtIdParamSchema = z.object({ id: uuid });
export const scheduleParamsSchema = z.object({ id: uuid, scheduleId: uuid });

export type CreateCourtBody = z.infer<typeof createCourtSchema>;
export type UpdateCourtBody = z.infer<typeof updateCourtSchema>;
export type SetScheduleBody = z.infer<typeof setScheduleSchema>;
