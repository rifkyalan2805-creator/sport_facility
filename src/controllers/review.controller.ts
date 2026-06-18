import { Request, Response } from 'express';
import { reviewService, ReviewService } from '../services/review.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreateReviewBody, ListReviewQuery, UpdateReviewBody } from '../validators/review.validator';

export class ReviewController {
  constructor(private readonly service: ReviewService = reviewService) {}

  listByItem = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListReviewQuery;
    const data = await this.service.listByItem({ itemType: q.item_type, itemId: q.item_id });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateReviewBody;
    const data = await this.service.create({
      userId: req.userId!,
      itemType: b.item_type,
      itemId: b.item_id,
      rating: b.rating,
      comment: b.comment,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateReviewBody;
    const data = await this.service.update({
      id: req.params.id,
      userId: req.userId!,
      rating: b.rating,
      comment: b.comment,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  remove = catchAsync(async (req: Request, res: Response) => {
    await this.service.remove({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.NO_CONTENT).send();
  });
}

export const reviewController = new ReviewController();
