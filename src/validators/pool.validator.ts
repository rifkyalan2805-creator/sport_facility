import { z } from 'zod';
import { pool_session_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');
const timeStr = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Jam harus berformat HH:mm (24 jam)');

// ---- Sessions ----
export const createSessionSchema = z
  .object({
    name: z.string().min(1).max(150),
    session_date: dateStr,
    start_time: timeStr,
    end_time: timeStr,
    capacity: z.coerce.number().int().positive(),
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: 'end_time harus lebih besar dari start_time',
    path: ['end_time'],
  });

export const updateSessionSchema = z
  .object({
    name: z.string().min(1).max(150).optional(),
    session_date: dateStr.optional(),
    start_time: timeStr.optional(),
    end_time: timeStr.optional(),
    capacity: z.coerce.number().int().positive().optional(),
    status: z.nativeEnum(pool_session_status).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

// ---- Ticket types ----
export const createTicketTypeSchema = z
  .object({
    name: z.string().min(1).max(100),
    price: z.coerce.number().nonnegative(),
    age_min: z.coerce.number().int().min(0).default(0),
    age_max: z.coerce.number().int().min(0).default(99),
    is_active: z.boolean().default(true),
  })
  .refine((d) => d.age_max >= d.age_min, {
    message: 'age_max harus >= age_min',
    path: ['age_max'],
  });

export const updateTicketTypeSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    price: z.coerce.number().nonnegative().optional(),
    age_min: z.coerce.number().int().min(0).optional(),
    age_max: z.coerce.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

// ---- Buy ticket ----
export const buyTicketSchema = z.object({
  session_id: uuid,
  ticket_type_id: uuid,
  quantity: z.coerce.number().int().positive().default(1),
});

// ---- Checkout grup (banyak tiket → 1 pembayaran + diskon grup) ----
export const poolCheckoutSchema = z.object({
  session_id: uuid,
  items: z
    .array(
      z.object({
        ticket_type_id: uuid,
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, 'Minimal 1 item tiket'),
});

export const sessionIdParamSchema = z.object({ id: uuid });
export const ticketTypeIdParamSchema = z.object({ id: uuid });
export const ticketIdParamSchema = z.object({ id: uuid });

export type CreateSessionBody = z.infer<typeof createSessionSchema>;
export type UpdateSessionBody = z.infer<typeof updateSessionSchema>;
export type CreateTicketTypeBody = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeBody = z.infer<typeof updateTicketTypeSchema>;
export type BuyTicketBody = z.infer<typeof buyTicketSchema>;
export type PoolCheckoutBody = z.infer<typeof poolCheckoutSchema>;
