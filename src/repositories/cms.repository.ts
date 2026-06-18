import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

/**
 * CMS repository gabungan untuk 4 entitas konten sederhana
 * (banners, faqs, galleries, pages) — query-only, tanpa business logic.
 */
export class CmsRepository {
  // ---- Banners ----
  listBanners(activeOnly: boolean, db: DbClient = prisma) {
    return db.banners.findMany({
      where: activeOnly ? { is_active: true } : {},
      orderBy: { sort_order: 'asc' },
    });
  }
  findBanner(id: string, db: DbClient = prisma) {
    return db.banners.findUnique({ where: { id } });
  }
  createBanner(data: Prisma.bannersUncheckedCreateInput, db: DbClient = prisma) {
    return db.banners.create({ data });
  }
  updateBanner(id: string, data: Prisma.bannersUncheckedUpdateInput, db: DbClient = prisma) {
    return db.banners.update({ where: { id }, data });
  }
  deleteBanner(id: string, db: DbClient = prisma) {
    return db.banners.delete({ where: { id } });
  }

  // ---- FAQs ----
  listFaqs(activeOnly: boolean, db: DbClient = prisma) {
    return db.faqs.findMany({
      where: activeOnly ? { is_active: true } : {},
      orderBy: { sort_order: 'asc' },
    });
  }
  findFaq(id: string, db: DbClient = prisma) {
    return db.faqs.findUnique({ where: { id } });
  }
  createFaq(data: Prisma.faqsUncheckedCreateInput, db: DbClient = prisma) {
    return db.faqs.create({ data });
  }
  updateFaq(id: string, data: Prisma.faqsUncheckedUpdateInput, db: DbClient = prisma) {
    return db.faqs.update({ where: { id }, data });
  }
  deleteFaq(id: string, db: DbClient = prisma) {
    return db.faqs.delete({ where: { id } });
  }

  // ---- Galleries ----
  listGalleries(activeOnly: boolean, db: DbClient = prisma) {
    return db.galleries.findMany({
      where: activeOnly ? { is_active: true } : {},
      orderBy: { sort_order: 'asc' },
    });
  }
  findGallery(id: string, db: DbClient = prisma) {
    return db.galleries.findUnique({ where: { id } });
  }
  createGallery(data: Prisma.galleriesUncheckedCreateInput, db: DbClient = prisma) {
    return db.galleries.create({ data });
  }
  updateGallery(id: string, data: Prisma.galleriesUncheckedUpdateInput, db: DbClient = prisma) {
    return db.galleries.update({ where: { id }, data });
  }
  deleteGallery(id: string, db: DbClient = prisma) {
    return db.galleries.delete({ where: { id } });
  }

  // ---- Pages ----
  listPages(publishedOnly: boolean, db: DbClient = prisma) {
    return db.pages.findMany({
      where: publishedOnly ? { status: 'published' } : {},
      orderBy: { title: 'asc' },
    });
  }
  findPageBySlug(slug: string, db: DbClient = prisma) {
    return db.pages.findUnique({ where: { slug } });
  }
  findPage(id: string, db: DbClient = prisma) {
    return db.pages.findUnique({ where: { id } });
  }
  createPage(data: Prisma.pagesUncheckedCreateInput, db: DbClient = prisma) {
    return db.pages.create({ data });
  }
  updatePage(id: string, data: Prisma.pagesUncheckedUpdateInput, db: DbClient = prisma) {
    return db.pages.update({ where: { id }, data });
  }
}

export const cmsRepository = new CmsRepository();
