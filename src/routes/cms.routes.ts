import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createBannerSchema,
  createFaqSchema,
  createGallerySchema,
  createPageSchema,
  idParamSchema,
  pageSlugParamSchema,
  updateBannerSchema,
  updateFaqSchema,
  updateGallerySchema,
  updatePageSchema,
} from '../validators/cms.validator';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

// ---- Banners ----
router.get('/banners', cmsController.listBanners);
router.post('/banners', ...adminOnly, validate(createBannerSchema, 'body'), cmsController.createBanner);
router.patch('/banners/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateBannerSchema, 'body'), cmsController.updateBanner);
router.delete('/banners/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteBanner);

// ---- FAQs ----
router.get('/faqs', cmsController.listFaqs);
router.post('/faqs', ...adminOnly, validate(createFaqSchema, 'body'), cmsController.createFaq);
router.patch('/faqs/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateFaqSchema, 'body'), cmsController.updateFaq);
router.delete('/faqs/:id', ...adminOnly, validate(idParamSchema, 'params'), cmsController.deleteFaq);

// ---- Galleries ----
router.get('/galleries', cmsController.listGalleries);
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
router.get('/pages', cmsController.listPages);
router.post('/pages', ...adminOnly, validate(createPageSchema, 'body'), cmsController.createPage);
router.get('/pages/:slug', validate(pageSlugParamSchema, 'params'), cmsController.getPage);
router.patch('/pages/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updatePageSchema, 'body'), cmsController.updatePage);

export default router;
