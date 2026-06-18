import { z } from 'zod';
import { staff_role } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');
const timeStr = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm');

export const createStaffSchema = z.object({
  user_id: uuid,
  role: z.nativeEnum(staff_role).default('cashier'),
  employee_id: z.string().max(30).optional(),
  join_date: dateStr,
});

export const updateStaffSchema = z
  .object({
    role: z.nativeEnum(staff_role).optional(),
    employee_id: z.string().max(30).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const setScheduleSchema = z
  .object({
    work_date: dateStr,
    shift_start: timeStr,
    shift_end: timeStr,
    notes: z.string().max(500).optional(),
  })
  .refine((d) => d.shift_end > d.shift_start, {
    message: 'shift_end harus lebih besar dari shift_start',
    path: ['shift_end'],
  });

export const staffIdParamSchema = z.object({ id: uuid });

export type CreateStaffBody = z.infer<typeof createStaffSchema>;
export type UpdateStaffBody = z.infer<typeof updateStaffSchema>;
export type SetScheduleBody = z.infer<typeof setScheduleSchema>;
