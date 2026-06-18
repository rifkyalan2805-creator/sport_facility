import { Request, Response } from 'express';
import { promoService, PromoService } from '../services/promo.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreatePromoBody, UpdatePromoBody, ValidatePromoBody } from '../validators/promo.validator';

export class PromoController {
  constructor(private readonly service: PromoService = promoService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listPromos();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getPromo(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreatePromoBody;
    const data = await this.service.createPromo({
      code: b.code,
      name: b.name,
      description: b.description,
      type: b.type,
      discountValue: b.discount_value,
      minPurchase: b.min_purchase,
      maxDiscount: b.max_discount,
      quota: b.quota,
      applicableTo: b.applicable_to,
      validFrom: b.valid_from,
      validUntil: b.valid_until,
      isActive: b.is_active,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdatePromoBody;
    const data = await this.service.updatePromo(req.params.id, {
      code: b.code,
      name: b.name,
      description: b.description,
      type: b.type,
      discountValue: b.discount_value,
      minPurchase: b.min_purchase,
      maxDiscount: b.max_discount,
      quota: b.quota,
      applicableTo: b.applicable_to,
      validFrom: b.valid_from,
      validUntil: b.valid_until,
      isActive: b.is_active,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  validate = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as ValidatePromoBody;
    const data = await this.service.validate(b.code, b.amount, b.item_types ?? []);
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const promoController = new PromoController();
