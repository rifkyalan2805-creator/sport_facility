import { Request, Response } from 'express';
import { poolService, PoolService } from '../services/pool.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  BuyTicketBody,
  CreateSessionBody,
  CreateTicketTypeBody,
  UpdateSessionBody,
  UpdateTicketTypeBody,
} from '../validators/pool.validator';

export class PoolController {
  constructor(private readonly service: PoolService = poolService) {}

  // ---- Sessions ----
  listSessions = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listUpcomingSessions();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getSession = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getSession(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createSession = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateSessionBody;
    const data = await this.service.createSession({
      name: b.name,
      sessionDate: b.session_date,
      startTime: b.start_time,
      endTime: b.end_time,
      capacity: b.capacity,
      notes: b.notes,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateSession = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateSessionBody;
    const data = await this.service.updateSession(req.params.id, {
      name: b.name,
      sessionDate: b.session_date,
      startTime: b.start_time,
      endTime: b.end_time,
      capacity: b.capacity,
      status: b.status,
      notes: b.notes,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- Ticket types ----
  listTicketTypes = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listTicketTypes();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createTicketType = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateTicketTypeBody;
    const data = await this.service.createTicketType({
      name: b.name,
      price: b.price,
      ageMin: b.age_min,
      ageMax: b.age_max,
      isActive: b.is_active,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateTicketType = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateTicketTypeBody;
    const data = await this.service.updateTicketType(req.params.id, {
      name: b.name,
      price: b.price,
      ageMin: b.age_min,
      ageMax: b.age_max,
      isActive: b.is_active,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- Tickets ----
  listMyTickets = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMyTickets(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  buyTicket = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as BuyTicketBody;
    const data = await this.service.buyTicket({
      userId: req.userId!,
      sessionId: b.session_id,
      ticketTypeId: b.ticket_type_id,
      quantity: b.quantity,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  cancelTicket = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.cancelTicket({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const poolController = new PoolController();
