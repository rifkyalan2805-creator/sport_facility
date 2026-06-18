import { z } from 'zod';
import { event_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus hex #RRGGBB');

// ---- Categories ----
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120).optional(),
  color: hexColor.optional(),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(120).optional(),
    color: hexColor.optional(),
    icon: z.string().max(50).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

// ---- Events ----
export const createEventSchema = z.object({
  category_id: uuid,
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(250).optional(),
  description: z.string().max(5000).optional(),
  banner_url: z.string().url().optional(),
  event_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  location: z.string().max(200).optional(),
  quota: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative().default(0),
  organizer_name: z.string().max(150).optional(),
  min_participants: z.coerce.number().int().min(1).default(1),
  registration_deadline: z.coerce.date().optional(),
  status: z.nativeEnum(event_status).default('draft'),
});

export const updateEventSchema = z
  .object({
    category_id: uuid.optional(),
    title: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(250).optional(),
    description: z.string().max(5000).optional(),
    banner_url: z.string().url().optional(),
    event_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    location: z.string().max(200).optional(),
    quota: z.coerce.number().int().positive().optional(),
    price: z.coerce.number().nonnegative().optional(),
    organizer_name: z.string().max(150).optional(),
    min_participants: z.coerce.number().int().min(1).optional(),
    registration_deadline: z.coerce.date().optional(),
    status: z.nativeEnum(event_status).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const scanRegistrationSchema = z.object({
  qr_code: z.string().min(1, 'qr_code wajib diisi'),
});

export const eventIdParamSchema = z.object({ id: uuid });
export const categoryIdParamSchema = z.object({ id: uuid });
export const registrationIdParamSchema = z.object({ id: uuid });

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type CreateEventBody = z.infer<typeof createEventSchema>;
export type UpdateEventBody = z.infer<typeof updateEventSchema>;
export type ScanRegistrationBody = z.infer<typeof scanRegistrationSchema>;
