import { Prisma } from '@prisma/client';
import {
  UserMembershipRepository,
  userMembershipRepository,
} from '../../repositories/userMembership.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

/**
 * Membership: saat lunas → aktifkan (periode mulai dihitung saat lunas).
 * Saat gagal → tidak diubah (tetap pending).
 */
export class MembershipFulfillmentHandler implements FulfillmentHandler {
  readonly itemType = 'membership' as const;

  constructor(
    private readonly memberships: UserMembershipRepository = userMembershipRepository
  ) {}

  async onPaid(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const membership = await this.memberships.findByIdWithPlan(item.itemId, tx);
    if (!membership || membership.status === 'active') return;

    const startDate = new Date(new Date().toISOString().slice(0, 10));
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + membership.membership_plans.duration_days);

    await this.memberships.update(
      membership.id,
      { status: 'active', start_date: startDate, end_date: endDate },
      tx
    );
  }

  async onFailed(): Promise<void> {
    // Tidak ada aksi.
  }
}
