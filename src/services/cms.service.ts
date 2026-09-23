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

  // ---- News ----
  listNews(publishedOnly: boolean) {
    return this.cms.listNews(publishedOnly);
  }

  /**
   * Detail berita untuk halaman publik. `publishedOnly` = pemanggil bukan
   * admin: draft & arsip disembunyikan sebagai 404, bukan 403 — keberadaan
   * berita yang belum terbit tidak perlu bocor.
   */
  async getNewsBySlug(slug: string, publishedOnly: boolean) {
    const item = await this.cms.findNewsBySlug(slug);
    if (!item || (publishedOnly && item.status !== 'published')) {
      throw AppError.notFound('Berita tidak ditemukan');
    }
    return item;
  }

  async createNews(data: Omit<Prisma.newsUncheckedCreateInput, 'slug'> & { slug?: string }) {
    const slug = slugify(data.slug || data.title);
    if (await this.cms.findNewsBySlug(slug)) {
      throw AppError.conflict(`Slug "${slug}" sudah dipakai berita lain`);
    }
    return this.cms.createNews({
      ...data,
      slug,
      // Langsung terbit → stempel tanggal terbit sekarang, kecuali admin
      // menentukan sendiri (mis. mengarsipkan berita lama).
      published_at: data.published_at ?? (data.status === 'published' ? new Date() : null),
    });
  }

  async updateNews(id: string, data: Prisma.newsUncheckedUpdateInput & { slug?: string }) {
    const current = await this.cms.findNews(id);
    if (!current) throw AppError.notFound('Berita tidak ditemukan');

    const patch = { ...data };
    if (typeof data.slug === 'string') {
      patch.slug = slugify(data.slug);
      const bentrok = await this.cms.findNewsBySlug(patch.slug);
      if (bentrok && bentrok.id !== id) {
        throw AppError.conflict(`Slug "${patch.slug}" sudah dipakai berita lain`);
      }
    }
    // Draft → published pertama kali: isi tanggal terbit otomatis. Diterbitkan
    // ulang setelah diarsipkan tidak menimpa tanggal terbit aslinya.
    if (data.status === 'published' && !current.published_at && data.published_at == null) {
      patch.published_at = new Date();
    }
    return this.cms.updateNews(id, patch);
  }

  async deleteNews(id: string) {
    if (!(await this.cms.findNews(id))) throw AppError.notFound('Berita tidak ditemukan');
    await this.cms.deleteNews(id);
  }
}

export const cmsService = new CmsService();
