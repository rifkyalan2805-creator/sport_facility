import { Request, Response } from 'express';
import { eventService, EventService } from '../services/event.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  CreateCategoryBody,
  CreateEventBody,
  ScanRegistrationBody,
  UpdateCategoryBody,
  UpdateEventBody,
} from '../validators/event.validator';

export class EventController {
  constructor(private readonly service: EventService = eventService) {}

  // ---- Categories ----
  listCategories = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listCategories();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateCategoryBody;
    const data = await this.service.createCategory({
      name: b.name,
      slug: b.slug,
      color: b.color,
      icon: b.icon,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateCategoryBody;
    const data = await this.service.updateCategory(req.params.id, {
      name: b.name,
      slug: b.slug,
      color: b.color,
      icon: b.icon,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- Events ----
  list = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listPublishedEvents();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listAll = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listAllEvents();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getEvent(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getBySlug = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getEventBySlug(req.params.slug);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateEventBody;
    const data = await this.service.createEvent({
      categoryId: b.category_id,
      title: b.title,
      slug: b.slug,
      description: b.description,
      bannerUrl: b.banner_url,
      eventDate: b.event_date,
      endDate: b.end_date,
      location: b.location,
      quota: b.quota,
      price: b.price,
      organizerName: b.organizer_name,
      minParticipants: b.min_participants,
      registrationDeadline: b.registration_deadline,
      status: b.status,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateEventBody;
    const data = await this.service.updateEvent(req.params.id, {
      categoryId: b.category_id,
      title: b.title,
      slug: b.slug,
      description: b.description,
      bannerUrl: b.banner_url,
      eventDate: b.event_date,
      endDate: b.end_date,
      location: b.location,
      quota: b.quota,
      price: b.price,
      organizerName: b.organizer_name,
      minParticipants: b.min_participants,
      registrationDeadline: b.registration_deadline,
      status: b.status,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- Registrations ----
  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMyRegistrations(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  register = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.register({ userId: req.userId!, eventId: req.params.id });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  cancel = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.cancelRegistration({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  scan = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as ScanRegistrationBody;
    const data = await this.service.scanRegistration({ qrCode: b.qr_code });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const eventController = new EventController();
