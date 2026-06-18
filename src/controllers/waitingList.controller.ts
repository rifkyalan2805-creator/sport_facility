import { Request, Response } from 'express';
import { waitingListService, WaitingListService } from '../services/waitingList.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { JoinWaitingListBody } from '../validators/waitingList.validator';

export class WaitingListController {
  constructor(private readonly service: WaitingListService = waitingListService) {}

  join = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as JoinWaitingListBody;
    const data = await this.service.join({
      userId: req.userId!,
      courtId: b.court_id,
      preferredDate: b.preferred_date,
      preferredStart: b.preferred_start,
      preferredEnd: b.preferred_end,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMine(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  cancel = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.cancel({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const waitingListController = new WaitingListController();
