import { Request, Response } from 'express';
import { ticketService, TicketService } from '../services/ticket.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  BuyTicketBody,
  CreateCategoryBody,
  ScanTicketBody,
  UpdateCategoryBody,
} from '../validators/ticket.validator';

export class TicketController {
  constructor(private readonly service: TicketService = ticketService) {}

  // ---- Categories ----
  listCategories = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listActiveCategories();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getCategory(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateCategoryBody;
    const data = await this.service.createCategory({
      name: b.name,
      description: b.description,
      price: b.price,
      quota: b.quota,
      validFrom: b.valid_from,
      validUntil: b.valid_until,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateCategoryBody;
    const data = await this.service.updateCategory(req.params.id, {
      name: b.name,
      description: b.description,
      price: b.price,
      quota: b.quota,
      validFrom: b.valid_from,
      validUntil: b.valid_until,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deactivateCategory = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.deactivateCategory(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- Tickets ----
  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMyTickets(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  buy = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as BuyTicketBody;
    const data = await this.service.buyTicket({
      userId: req.userId!,
      categoryId: b.category_id,
      quantity: b.quantity,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  cancel = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.cancelTicket({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  scan = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as ScanTicketBody;
    const data = await this.service.scanTicket({
      qrCode: b.qr_code,
      scannedBy: req.userId!,
      location: b.location,
      notes: b.notes,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const ticketController = new TicketController();
