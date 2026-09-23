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

// ---- News (berita) ----
// cover_url cukup URL biasa — sama dengan banner/galeri. Tidak dibatasi ke
// prefix bucket kami (beda dengan photo_url member/avatar) karena field ini
// hanya bisa diisi admin, dan gambar dari CDN luar tetap sah dipakai.
// null = hapus cover.
export const createNewsSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(250),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  cover_url: z.string().url().nullable().optional(),
  cover_alt: z.string().max(250).optional(),
  // Susunan cover di kartu sorotan /berita. Nilainya juga dijaga CHECK di DB.
  cover_layout: z.enum(['landscape', 'portrait']).default('landscape'),
  category: z.string().max(80).default('umum'),
  author: z.string().max(120).optional(),
  status: z.nativeEnum(cms_status).default('draft'),
  published_at: z.coerce.date().optional(),
});
export const updateNewsSchema = createNewsSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'Minimal satu field' }
);

export const idParamSchema = z.object({ id: uuid });
export const pageSlugParamSchema = z.object({ slug: z.string().min(1) });
export const newsSlugParamSchema = z.object({ slug: z.string().min(1) });

export type CreateBannerBody = z.infer<typeof createBannerSchema>;
export type CreateFaqBody = z.infer<typeof createFaqSchema>;
export type CreateGalleryBody = z.infer<typeof createGallerySchema>;
export type CreatePageBody = z.infer<typeof createPageSchema>;
export type CreateNewsBody = z.infer<typeof createNewsSchema>;
