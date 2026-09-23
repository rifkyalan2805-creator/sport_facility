import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createBannerSchema,
  createFaqSchema,
  createGallerySchema,
  createNewsSchema,
  createPageSchema,
  idParamSchema,
  newsSlugParamSchema,
  pageSlugParamSchema,
  updateBannerSchema,
  updateFaqSchema,
  updateGallerySchema,
  updateNewsSchema,
  updatePageSchema,
} from '../validators/cms.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];
// Endpoint baca CMS terbuka untuk publik, tapi token tetap dibaca kalau ada:
// controller memakai req.userRole untuk memutuskan apakah draft/non-aktif
// ikut ditampilkan (panel admin butuh melihatnya).
const publicRead = [optionalAuth];

// ---- Banners ----
router.get('/banners', ...publicRead, cmsController.listBanners);
router.post('/banners', ...adminOnly, validate(createBannerSchema, 'body'), cmsController.createBanner);
router.patch('/banners/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateBannerSchema, 'body'), cmsController.updateBanner);
router.delete('/banners/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteBanner);

// ---- FAQs ----
router.get('/faqs', ...publicRead, cmsController.listFaqs);
router.post('/faqs', ...adminOnly, validate(createFaqSchema, 'body'), cmsController.createFaq);
router.patch('/faqs/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateFaqSchema, 'body'), cmsController.updateFaq);
router.delete('/faqs/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteFaq);

// ---- Galleries ----
router.get('/galleries', ...publicRead, cmsController.listGalleries);
router.post('/galleries', ...adminOnly, validate(createGallerySchema, 'body'), cmsController.createGallery);
router.patch('/galleries/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateGallerySchema, 'body'), cmsController.updateGallery);
router.delete('/galleries/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteGallery);

// ---- Pages ----
/**
 * @openapi
 * /api/v1/cms/pages:
 *   get: { tags: [CMS], summary: List halaman (publik=published), responses: { 200: { description: OK } } }
 *   post: { tags: [CMS], summary: Buat halaman (admin), security: [{ bearerAuth: [] }], responses: { 201: { description: OK } } }
 */
router.get('/pages', ...publicRead, cmsController.listPages);
router.post('/pages', ...adminOnly, validate(createPageSchema, 'body'), cmsController.createPage);
router.get('/pages/:slug', validate(pageSlugParamSchema, 'params'), cmsController.getPage);
router.patch('/pages/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updatePageSchema, 'body'), cmsController.updatePage);

// ---- News (berita) ----
/**
 * @openapi
 * /api/v1/cms/news:
 *   get:
 *     tags: [CMS]
 *     summary: List berita — publik hanya yang published, admin semua status
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [CMS]
 *     summary: Buat berita (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: OK }, 409: { description: Slug sudah dipakai } }
 */
router.get('/news', ...publicRead, cmsController.listNews);
router.post('/news', ...adminOnly, validate(createNewsSchema, 'body'), cmsController.createNews);
/**
 * @openapi
 * /api/v1/cms/news/{slug}:
 *   get:
 *     tags: [CMS]
 *     summary: Detail berita by slug — draft/arsip hanya untuk admin (selain itu 404)
 *     parameters: [{ name: slug, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK }, 404: { description: Tidak ditemukan } }
 */
router.get('/news/:slug', ...publicRead, validate(newsSlugParamSchema, 'params'), cmsController.getNews);
router.patch('/news/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateNewsSchema, 'body'), cmsController.updateNews);
router.delete('/news/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteNews);

export default router;
