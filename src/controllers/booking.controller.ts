import { Request, Response } from 'express';
import { bookingService, BookingService } from '../services/booking.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreateBookingBody, ListBookingQuery } from '../validators/booking.validator';

/**
 * BookingController — hanya menerjemahkan HTTP request ke pemanggilan
 * service dan membentuk response. TIDAK ada query DB / business logic.
 */
export class BookingController {
  constructor(private readonly service: BookingService = bookingService) { }

  create = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreateBookingBody;
    const booking = await this.service.createBooking({
      userId: req.userId!,
      courtId: body.court_id,
      bookingType: body.booking_type,
      withLight: body.with_light,
      abonemenId: body.abonemen_id,
      bookingDate: body.booking_date,
      startTime: body.start_time,
      endTime: body.end_time,
      notes: body.notes,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data: booking });
  });

  list = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListBookingQuery;
    // scope=all → semua booking (hanya admin); selain itu terkunci ke user.
    const isAdmin = req.userRole === 'admin' || req.userRole === 'superadmin';
    const listAll = isAdmin && q.scope === 'all';
    const result = await this.service.listBookings({
      userId: listAll ? undefined : req.userId!,
      courtId: q.court_id,
      status: q.status,
      bookingDate: q.booking_date,
      page: q.page,
      limit: q.limit,
    });
    res.status(HttpStatus.OK).json({ success: true, ...result });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.service.getBookingById(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data: booking });
  });

  cancel = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.service.cancelBooking({
      bookingId: req.params.id,
      userId: req.userId!,
      reason: (req.body as { reason?: string }).reason,
    });
    res.status(HttpStatus.OK).json({ success: true, data: booking });
  });

  checkIn = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.service.checkIn(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data: booking });
  });
}

export const bookingController = new BookingController();
