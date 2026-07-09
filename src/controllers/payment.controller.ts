import { Request, Response } from 'express';
import { paymentService, PaymentService } from '../services/payment.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreatePaymentBody, ListPaymentQuery } from '../validators/payment.validator';

/**
 * PaymentController — hanya req/res. Tidak ada query DB / business logic.
 */
export class PaymentController {
  constructor(private readonly service: PaymentService = paymentService) {}

  create = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreatePaymentBody;
    const payment = await this.service.createPayment({
      userId: req.userId!,
      paymentMethodId: body.payment_method_id,
      promoId: body.promo_id,
      promoCode: body.promo_code,
      discountAmount: body.discount_amount,
      items: body.items.map((it) => ({
        itemType: it.item_type,
        itemId: it.item_id,
        itemName: it.item_name,
        quantity: it.quantity,
        unitPrice: it.unit_price,
      })),
      idempotencyKey: req.header('Idempotency-Key') ?? undefined,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data: payment });
  });

  list = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListPaymentQuery;
    // scope=all → semua pembayaran (hanya admin); selain itu terkunci ke user.
    const isAdmin = req.userRole === 'admin' || req.userRole === 'superadmin';
    const listAll = isAdmin && q.scope === 'all';
    const result = await this.service.listPayments({
      userId: listAll ? undefined : req.userId!,
      status: q.status,
      page: q.page,
      limit: q.limit,
    });
    res.status(HttpStatus.OK).json({ success: true, ...result });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const payment = await this.service.getPaymentById(req.params.id, req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data: payment });
  });

  simulateSuccess = catchAsync(async (req: Request, res: Response) => {
    const payment = await this.service.simulateSuccess({
      paymentId: req.params.id,
      userId: req.userId!,
    });
    res.status(HttpStatus.OK).json({ success: true, data: payment });
  });

  simulateFailure = catchAsync(async (req: Request, res: Response) => {
    const payment = await this.service.simulateFailure({
      paymentId: req.params.id,
      userId: req.userId!,
      reason: (req.body as { reason?: string }).reason,
    });
    res.status(HttpStatus.OK).json({ success: true, data: payment });
  });
}

export const paymentController = new PaymentController();
