import { z } from 'zod';
import { item_type, payment_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

const paymentItemSchema = z.object({
  item_type: z.nativeEnum(item_type),
  item_id: uuid,
  item_name: z.string().min(1).max(200),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().nonnegative(),
});

export const createPaymentSchema = z.object({
  payment_method_id: uuid.optional(),
  promo_id: uuid.optional(),
  promo_code: z.string().min(1).max(50).optional(),
  discount_amount: z.coerce.number().nonnegative().default(0),
  items: z.array(paymentItemSchema).min(1, 'Minimal 1 item pembayaran'),
});

export const listPaymentQuerySchema = z.object({
  status: z.nativeEnum(payment_status).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const paymentIdParamSchema = z.object({
  id: uuid,
});

export const simulateFailureSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreatePaymentBody = z.infer<typeof createPaymentSchema>;
export type ListPaymentQuery = z.infer<typeof listPaymentQuerySchema>;
