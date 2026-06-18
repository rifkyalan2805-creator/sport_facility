import { Request, Response } from 'express';
import { settingService, SettingService } from '../services/setting.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { UpsertSettingBody } from '../validators/setting.validator';

export class SettingController {
  constructor(private readonly service: SettingService = settingService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.listAll() });
  });

  getByKey = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getByKey(req.params.key);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  upsert = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpsertSettingBody;
    const data = await this.service.upsert(req.params.key, b.value, req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const settingController = new SettingController();
