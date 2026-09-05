import { Request, Response } from 'express';
import { userAbonemenService, UserAbonemenService } from '../services/userAbonemen.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { ListAbonemenQuery } from '../validators/userAbonemen.validator';

/**
 * UserAbonemenController — HTTP ↔ service. Tanpa business logic / query DB.
 */
export class UserAbonemenController {
  constructor(private readonly service: UserAbonemenService = userAbonemenService) {}

  /** Abonemen milik user yang sedang login (dashboard pengunjung). */
  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMine(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  /** Daftar abonemen berjalan (reception & manajemen). */
  listAll = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListAbonemenQuery;
    const result = await this.service.listAll({
      group: q.group,
      status: q.status,
      search: q.search,
      page: q.page,
      limit: q.limit,
    });
    res.status(HttpStatus.OK).json({ success: true, ...result });
  });
}

export const userAbonemenController = new UserAbonemenController();
