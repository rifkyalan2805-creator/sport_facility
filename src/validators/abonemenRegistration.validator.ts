import { z } from 'zod';
import { abonemen_reg_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

/**
 * Buat pengajuan registrasi abonemen.
 * - `communication_email`: email untuk komunikasi feedback/invoice/tagihan (#3).
 */
export const createRegistrationSchema = z.object({
  package_id: uuid,
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(150),
  phone: z
    .string()
    .regex(/^[0-9+()\-\s]{8,20}$/, 'Nomor telepon tidak valid')
    .max(20),
  communication_email: z.string().email('Email tidak valid').max(255),
  notes: z.string().max(1000).optional(),
});

export const reviewRegistrationSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional(),
});

export const listRegistrationQuerySchema = z.object({
  status: z.nativeEnum(abonemen_reg_status).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const registrationIdParamSchema = z.object({ id: uuid });

export type CreateRegistrationBody = z.infer<typeof createRegistrationSchema>;
export type ReviewRegistrationBody = z.infer<typeof reviewRegistrationSchema>;
export type ListRegistrationQuery = z.infer<typeof listRegistrationQuerySchema>;
