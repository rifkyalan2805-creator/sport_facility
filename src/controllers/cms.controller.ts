import { Request, Response } from 'express';
import { cmsService, CmsService } from '../services/cms.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';

// Apakah requester admin → boleh lihat data non-aktif/draft.
const isAdmin = (req: Request) => req.userRole === 'admin' || req.userRole === 'superadmin';

export class CmsController {
  constructor(private readonly service: CmsService = cmsService) {}

  // ---- Banners ----
  listBanners = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.listBanners(!isAdmin(req)) });
  });
  createBanner = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.createBanner(req.body);
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });
  updateBanner = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.updateBanner(req.params.id, req.body) });
  });
  deleteBanner = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteBanner(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });

  // ---- FAQs ----
  listFaqs = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.listFaqs(!isAdmin(req)) });
  });
  createFaq = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.createFaq(req.body);
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });
  updateFaq = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.updateFaq(req.params.id, req.body) });
  });
  deleteFaq = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteFaq(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });

  // ---- Galleries ----
  listGalleries = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.listGalleries(!isAdmin(req)) });
  });
  createGallery = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.createGallery(req.body);
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });
  updateGallery = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.updateGallery(req.params.id, req.body) });
  });
  deleteGallery = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteGallery(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });

  // ---- Pages ----
  listPages = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.listPages(!isAdmin(req)) });
  });
  getPage = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.getPageBySlug(req.params.slug) });
  });
  createPage = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.createPage(req.body);
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });
  updatePage = catchAsync(async (req: Request, res: Response) => {
    res.json({ success: true, data: await this.service.updatePage(req.params.id, req.body) });
  });
}

export const cmsController = new CmsController();
