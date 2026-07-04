import { Request, Response } from 'express';
import {
  abonemenPackageService,
  AbonemenPackageService,
} from '../services/abonemenPackage.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';

/**
 * AbonemenPackageController — menerjemahkan HTTP ke pemanggilan service.
 * TIDAK ada query DB / business logic.
 */
export class AbonemenPackageController {
  constructor(private readonly service: AbonemenPackageService = abonemenPackageService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.listActive() });
  });
}

export const abonemenPackageController = new AbonemenPackageController();
