import { z } from 'zod';
import { cms_status } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

// ---- Banners ----
export const createBannerSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  image_url: z.string().url(),
  link_url: z.string().url().optional(),
  position: z.string().max(50).default('hero'),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
  starts_at: z.coerce.date().optional(),
  ends_at: z.coerce.date().optional(),
});
export const updateBannerSchema = createBannerSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'Minimal satu field' }
);

// ---- FAQs ----
export const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().max(80).default('general'),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});
export const updateFaqSchema = createFaqSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'Minimal satu field' }
);

// ---- Galleries ----
export const createGallerySchema = z.object({
  title: z.string().max(200).optional(),
  image_url: z.string().url(),
  category: z.string().max(80).default('facility'),
  alt_text: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});
export const updateGallerySchema = createGallerySchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'Minimal satu field' }
);

// ---- Pages ----
export const createPageSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(250),
  content: z.string().min(1),
  meta_title: z.string().max(200).optional(),
  meta_desc: z.string().optional(),
  status: z.nativeEnum(cms_status).default('draft'),
});
export const updatePageSchema = createPageSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'Minimal satu field' }
);

export const idParamSchema = z.object({ id: uuid });
export const pageSlugParamSchema = z.object({ slug: z.string().min(1) });

export type CreateBannerBody = z.infer<typeof createBannerSchema>;
export type CreateFaqBody = z.infer<typeof createFaqSchema>;
export type CreateGalleryBody = z.infer<typeof createGallerySchema>;
export type CreatePageBody = z.infer<typeof createPageSchema>;
