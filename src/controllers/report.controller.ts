import { Request, Response } from 'express';
import { reportService, ReportService } from '../services/report.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { OccupancyQuery, RecordOccupancyBody } from '../validators/report.validator';

export class ReportController {
  constructor(private readonly service: ReportService = reportService) {}

  recordOccupancy = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as RecordOccupancyBody;
    const data = await this.service.recordOccupancy({
      courtId: b.court_id,
      logDate: b.log_date,
      hourSlot: b.hour_slot,
      isOccupied: b.is_occupied,
      bookingId: b.booking_id,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  getOccupancy = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as OccupancyQuery;
    const data = await this.service.getOccupancy(q.court_id, q.date);
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const reportController = new ReportController();
