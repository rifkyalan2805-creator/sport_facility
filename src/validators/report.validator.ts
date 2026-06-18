import { z } from 'zod';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');

export const recordOccupancySchema = z.object({
  court_id: uuid,
  log_date: dateStr,
  hour_slot: z.coerce.number().int().min(0).max(23),
  is_occupied: z.boolean().default(false),
  booking_id: uuid.optional(),
});

export const occupancyQuerySchema = z.object({
  court_id: uuid,
  date: dateStr,
});

export type RecordOccupancyBody = z.infer<typeof recordOccupancySchema>;
export type OccupancyQuery = z.infer<typeof occupancyQuerySchema>;
