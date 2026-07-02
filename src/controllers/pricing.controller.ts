import { Request, Response } from 'express';
import { pricingService, PricingService } from '../services/pricing.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  CreatePadelPriceBody,
  CreateTennisPriceBody,
  UpdatePadelPriceBody,
  UpdateTennisPriceBody,
} from '../validators/pricing.validator';

export class PricingController {
  constructor(private readonly service: PricingService = pricingService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.getAll() });
  });

  // ---- Tennis ----
  createTennis = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateTennisPriceBody;
    const data = await this.service.createTennis({
      bookingType: b.booking_type,
      withLight: b.with_light,
      price: b.price,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateTennis = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateTennisPriceBody;
    const data = await this.service.updateTennis(req.params.id, {
      bookingType: b.booking_type,
      withLight: b.with_light,
      price: b.price,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deleteTennis = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteTennis(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });

  // ---- Padel ----
  createPadel = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreatePadelPriceBody;
    const data = await this.service.createPadel({
      label: b.label,
      price: b.price,
      timeStart: b.time_start,
      timeEnd: b.time_end,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updatePadel = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdatePadelPriceBody;
    const data = await this.service.updatePadel(req.params.id, {
      label: b.label,
      price: b.price,
      timeStart: b.time_start,
      timeEnd: b.time_end,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deletePadel = catchAsync(async (req: Request, res: Response) => {
    await this.service.deletePadel(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });
}

export const pricingController = new PricingController();
