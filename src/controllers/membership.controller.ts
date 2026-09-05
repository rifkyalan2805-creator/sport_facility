import { Request, Response } from 'express';
import { membershipService, MembershipService } from '../services/membership.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  CreatePlanBody,
  ListMembershipsQuery,
  SubscribeBody,
  UpdatePlanBody,
} from '../validators/membership.validator';

export class MembershipController {
  constructor(private readonly service: MembershipService = membershipService) {}

  // ---- Plans ----
  listPlans = catchAsync(async (_req: Request, res: Response) => {
    const data = await this.service.listActivePlans();
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  getPlan = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getPlan(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createPlan = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreatePlanBody;
    const data = await this.service.createPlan({
      name: b.name,
      slug: b.slug,
      description: b.description,
      price: b.price,
      durationDays: b.duration_days,
      maxBookingsMonth: b.max_bookings_month,
      discountPercent: b.discount_percent,
      benefits: b.benefits,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updatePlan = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdatePlanBody;
    const data = await this.service.updatePlan(req.params.id, {
      name: b.name,
      slug: b.slug,
      description: b.description,
      price: b.price,
      durationDays: b.duration_days,
      maxBookingsMonth: b.max_bookings_month,
      discountPercent: b.discount_percent,
      benefits: b.benefits,
      isActive: b.is_active,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  deactivatePlan = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.deactivatePlan(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  // ---- User memberships ----
  listMine = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listMyMemberships(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  /** Daftar seluruh member kolam (reception & manajemen). */
  listAll = catchAsync(async (req: Request, res: Response) => {
    const q = req.query as unknown as ListMembershipsQuery;
    const result = await this.service.listAllMemberships({
      group: q.group,
      status: q.status,
      search: q.search,
      page: q.page,
      limit: q.limit,
    });
    res.status(HttpStatus.OK).json({ success: true, ...result });
  });

  subscribe = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as SubscribeBody;
    const data = await this.service.subscribe({
      userId: req.userId!,
      planId: b.plan_id,
      autoRenew: b.auto_renew,
      memberName: b.member_name,
      birthDate: b.birth_date,
      gender: b.gender,
      city: b.city,
      photoUrl: b.photo_url,
      medicalNotes: b.medical_notes,
      startDate: b.start_date,
      termsAccepted: b.terms_accepted,
      marketingOptIn: b.marketing_opt_in,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  cancel = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.cancel({ id: req.params.id, userId: req.userId! });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const membershipController = new MembershipController();
