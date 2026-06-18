import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slug';
import {
  CancelMembershipInput,
  CreatePlanInput,
  SubscribeInput,
  UpdatePlanInput,
} from '../types/membership.types';
import {
  MembershipPlanRepository,
  membershipPlanRepository,
} from '../repositories/membershipPlan.repository';
import {
  UserMembershipRepository,
  userMembershipRepository,
} from '../repositories/userMembership.repository';
import { PaymentService, paymentService } from './payment.service';

// Status membership yang masih bisa dibatalkan user.
const CANCELLABLE = ['active', 'pending'];

export class MembershipService {
  // DI: payment dummy diinjeksikan agar mudah di-mock di unit test.
  constructor(
    private readonly plans: MembershipPlanRepository = membershipPlanRepository,
    private readonly memberships: UserMembershipRepository = userMembershipRepository,
    private readonly payments: PaymentService = paymentService
  ) {}

  // ---- Plans (read publik) ----
  listActivePlans() {
    return this.plans.listActive();
  }

  listAllPlans() {
    return this.plans.listAll();
  }

  async getPlan(id: string) {
    const plan = await this.plans.findById(id);
    if (!plan) throw AppError.notFound('Plan membership tidak ditemukan');
    return plan;
  }

  // ---- Plans (admin) ----
  createPlan(input: CreatePlanInput) {
    const data: Prisma.membership_plansUncheckedCreateInput = {
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      description: input.description ?? null,
      price: new Prisma.Decimal(input.price),
      duration_days: input.durationDays,
      max_bookings_month: input.maxBookingsMonth,
      discount_percent: new Prisma.Decimal(input.discountPercent),
      benefits: input.benefits as Prisma.InputJsonValue,
      is_active: input.isActive,
      sort_order: input.sortOrder,
    };
    // slug unik dijaga DB → P2002 dipetakan 409 oleh errorHandler.
    return this.plans.create(data);
  }

  async updatePlan(id: string, input: UpdatePlanInput) {
    await this.getPlan(id);

    const data: Prisma.membership_plansUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.durationDays !== undefined) data.duration_days = input.durationDays;
    if (input.maxBookingsMonth !== undefined)
      data.max_bookings_month = input.maxBookingsMonth;
    if (input.discountPercent !== undefined)
      data.discount_percent = new Prisma.Decimal(input.discountPercent);
    if (input.benefits !== undefined)
      data.benefits = input.benefits as Prisma.InputJsonValue;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;

    return this.plans.update(id, data);
  }

  async deactivatePlan(id: string) {
    await this.getPlan(id);
    return this.plans.update(id, { is_active: false });
  }

  // ---- User memberships ----
  listMyMemberships(userId: string) {
    return this.memberships.findManyByUser(userId);
  }

  /**
   * Subscribe ke sebuah plan: buat membership status `pending` lalu buat
   * pembayaran dummy. Membership menjadi `active` saat pembayaran lunas
   * (ditangani PaymentService).
   */
  async subscribe(input: SubscribeInput) {
    const plan = await this.plans.findActiveById(input.planId);
    if (!plan) throw AppError.notFound('Plan tidak ditemukan atau tidak aktif');

    const existing = await this.memberships.findActiveOrPending(input.userId);
    if (existing) {
      throw AppError.conflict('Anda masih memiliki membership aktif atau menunggu pembayaran');
    }

    // Periode tentatif; di-set ulang saat aktivasi pembayaran.
    const startDate = new Date(new Date().toISOString().slice(0, 10));
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + plan.duration_days);

    const membership = await this.memberships.create({
      user_id: input.userId,
      plan_id: plan.id,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      auto_renew: input.autoRenew,
    });

    const payment = await this.payments.createPayment({
      userId: input.userId,
      items: [
        {
          itemType: 'membership',
          itemId: membership.id,
          itemName: plan.name,
          quantity: 1,
          unitPrice: plan.price.toNumber(),
        },
      ],
    });

    return { membership, payment };
  }

  async cancel(input: CancelMembershipInput) {
    const membership = await this.memberships.findById(input.id);
    if (!membership) throw AppError.notFound('Membership tidak ditemukan');
    if (membership.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan membership ini');
    }
    if (!CANCELLABLE.includes(membership.status)) {
      throw AppError.unprocessable(
        `Membership berstatus "${membership.status}" tidak bisa dibatalkan`
      );
    }
    return this.memberships.update(membership.id, { status: 'cancelled' });
  }
}

export const membershipService = new MembershipService();
