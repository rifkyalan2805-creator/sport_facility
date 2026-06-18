import { Request, Response } from 'express';
import { loyaltyService, LoyaltyService } from '../services/loyalty.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';

export class LoyaltyController {
  constructor(private readonly service: LoyaltyService = loyaltyService) {}

  me = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getSummary(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  transactions = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listTransactions(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const loyaltyController = new LoyaltyController();
