import { Request, Response } from 'express';
import {
  abonemenRegistrationService,
  AbonemenRegistrationService,
} from '../services/abonemenRegistration.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  CreateRegistrationBody,
  ListRegistrationQuery,
  ReviewRegistrationBody,
} from '../validators/abonemenRegistration.validator';

/**
 * AbonemenRegistrationController — HTTP ↔ service. Tanpa business logic / query DB.
 */
export class AbonemenRegistrationController {
  constructor(
    private readonly service: AbonemenRegistrationService = abonemenRegistrationService
  ) {}

  create = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreateRegistrationBody;
    const reg = await this.service.register({
      userId: req.userId!,
      packageId: body.package_id,
      fullName: body.full_name,
      phone: body.phone,
      communicationEmail: body.communication_email,
      notes: body.notes,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data: reg });
  });

  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMine(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listAll = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListRegistrationQuery;
    const result = await this.service.listAll({
      status: q.status,
      page: q.page,
      limit: q.limit,
    });
    res.status(HttpStatus.OK).json({ success: true, ...result });
  });

  review = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as ReviewRegistrationBody;
    const reg = await this.service.review({
      registrationId: req.params.id,
      adminId: req.userId!,
      action: body.action,
      notes: body.notes,
    });
    res.status(HttpStatus.OK).json({ success: true, data: reg });
  });
}

export const abonemenRegistrationController = new AbonemenRegistrationController();
