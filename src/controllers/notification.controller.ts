import { Request, Response } from 'express';
import { notificationService, NotificationService } from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  CreateNotificationBody,
  ListNotificationQuery,
  RegisterPushTokenBody,
} from '../validators/notification.validator';

export class NotificationController {
  constructor(private readonly service: NotificationService = notificationService) {}

  listMine = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListNotificationQuery;
    const data = await this.service.listMine(req.userId!, q.unread ?? false);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateNotificationBody;
    const data = await this.service.create({
      userId: b.user_id,
      title: b.title,
      body: b.body,
      type: b.type,
      actionUrl: b.action_url,
      imageUrl: b.image_url,
      metadata: b.metadata,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  markRead = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.markRead(req.params.id, req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  markAllRead = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.markAllRead(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data: { updated: result.count } });
  });

  listTokens = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listTokens(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  registerToken = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as RegisterPushTokenBody;
    const data = await this.service.registerToken(req.userId!, b.token, b.platform);
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  deactivateToken = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.deactivateToken(req.params.id, req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listEmailLogs = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listEmailLogs();
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const notificationController = new NotificationController();
