import { Request, Response } from 'express';
import {
  availabilityService,
  AvailabilityService,
} from '../services/availability.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { AvailabilityQuery } from '../validators/availability.validator';

/**
 * AvailabilityController — jadwal ketersediaan slot per court+tanggal (publik).
 */
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService = availabilityService) {}

  get = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as AvailabilityQuery;
    const data = await this.service.getAvailability(req.params.id, q.date, {
      bookingType: q.booking_type,
      withLight: q.with_light,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const availabilityController = new AvailabilityController();
