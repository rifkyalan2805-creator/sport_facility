import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slug';
import { CmsRepository, cmsRepository } from '../repositories/cms.repository';

/**
 * CMS service — CRUD konten sederhana. Bisnis logic minim (pass-through
 * dengan pengecekan keberadaan & auto-slug untuk pages).
 */
export class CmsService {
  constructor(private readonly cms: CmsRepository = cmsRepository) {}

  // ---- Banners ----
  listBanners(activeOnly: boolean) {
    return this.cms.listBanners(activeOnly);
  }
  createBanner(data: Prisma.bannersUncheckedCreateInput) {
    return this.cms.createBanner(data);
  }
  async updateBanner(id: string, data: Prisma.bannersUncheckedUpdateInput) {
    if (!(await this.cms.findBanner(id))) throw AppError.notFound('Banner tidak ditemukan');
    return this.cms.updateBanner(id, data);
  }
  async deleteBanner(id: string) {
    if (!(await this.cms.findBanner(id))) throw AppError.notFound('Banner tidak ditemukan');
    await this.cms.deleteBanner(id);
  }

  // ---- FAQs ----
  listFaqs(activeOnly: boolean) {
    return this.cms.listFaqs(activeOnly);
  }
  createFaq(data: Prisma.faqsUncheckedCreateInput) {
    return this.cms.createFaq(data);
  }
  async updateFaq(id: string, data: Prisma.faqsUncheckedUpdateInput) {
    if (!(await this.cms.findFaq(id))) throw AppError.notFound('FAQ tidak ditemukan');
    return this.cms.updateFaq(id, data);
  }
  async deleteFaq(id: string) {
    if (!(await this.cms.findFaq(id))) throw AppError.notFound('FAQ tidak ditemukan');
    await this.cms.deleteFaq(id);
  }

  // ---- Galleries ----
  listGalleries(activeOnly: boolean) {
    return this.cms.listGalleries(activeOnly);
  }
  createGallery(data: Prisma.galleriesUncheckedCreateInput) {
    return this.cms.createGallery(data);
  }
  async updateGallery(id: string, data: Prisma.galleriesUncheckedUpdateInput) {
    if (!(await this.cms.findGallery(id))) throw AppError.notFound('Galeri tidak ditemukan');
    return this.cms.updateGallery(id, data);
  }
  async deleteGallery(id: string) {
    if (!(await this.cms.findGallery(id))) throw AppError.notFound('Galeri tidak ditemukan');
    await this.cms.deleteGallery(id);
  }

  // ---- Pages ----
  listPages(publishedOnly: boolean) {
    return this.cms.listPages(publishedOnly);
  }
  async getPageBySlug(slug: string) {
    const page = await this.cms.findPageBySlug(slug);
    if (!page) throw AppError.notFound('Halaman tidak ditemukan');
    return page;
  }
  createPage(data: Prisma.pagesUncheckedCreateInput & { title: string; slug?: string }) {
    return this.cms.createPage({ ...data, slug: data.slug ? slugify(data.slug) : slugify(data.title) });
  }
  async updatePage(id: string, data: Prisma.pagesUncheckedUpdateInput & { slug?: string }) {
    if (!(await this.cms.findPage(id))) throw AppError.notFound('Halaman tidak ditemukan');
    const patch = { ...data };
    if (typeof data.slug === 'string') patch.slug = slugify(data.slug);
    return this.cms.updatePage(id, patch);
  }
}

export const cmsService = new CmsService();
