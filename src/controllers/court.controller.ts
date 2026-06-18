import { Request, Response } from 'express';
import { courtService, CourtService } from '../services/court.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreateCourtBody, SetScheduleBody, UpdateCourtBody } from '../validators/court.validator';

export class CourtController {
  constructor(private readonly service: CourtService = courtService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listActiveCourts();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getCourt(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateCourtBody;
    const data = await this.service.createCourt({
      name: b.name,
      code: b.code,
      type: b.type,
      pricePerHour: b.price_per_hour,
      capacity: b.capacity,
      isIndoor: b.is_indoor,
      facilities: b.facilities,
      imageUrl: b.image_url,
      description: b.description,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateCourtBody;
    const data = await this.service.updateCourt(req.params.id, {
      name: b.name,
      code: b.code,
      type: b.type,
      pricePerHour: b.price_per_hour,
      capacity: b.capacity,
      isIndoor: b.is_indoor,
      facilities: b.facilities,
      imageUrl: b.image_url,
      description: b.description,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deactivate = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.deactivateCourt(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listSchedules = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listSchedules(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  setSchedule = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as SetScheduleBody;
    const data = await this.service.setSchedule(req.params.id, {
      dayOfWeek: b.day_of_week,
      openTime: b.open_time,
      closeTime: b.close_time,
      isHolidayClosed: b.is_holiday_closed,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteSchedule(req.params.id, req.params.scheduleId);
    res.status(HttpStatus.NO_CONTENT).send();
  });
}

export const courtController = new CourtController();
