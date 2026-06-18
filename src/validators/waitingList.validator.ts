import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');
const timeStr = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm (24 jam)');

export const joinWaitingListSchema = z
  .object({
    court_id: uuid,
    preferred_date: dateStr,
    preferred_start: timeStr,
    preferred_end: timeStr,
  })
  .refine((d) => d.preferred_end > d.preferred_start, {
    message: 'preferred_end harus lebih besar dari preferred_start',
    path: ['preferred_end'],
  });

export const waitingIdParamSchema = z.object({ id: uuid });

export type JoinWaitingListBody = z.infer<typeof joinWaitingListSchema>;
