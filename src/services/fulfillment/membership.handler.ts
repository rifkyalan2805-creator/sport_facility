import { Prisma } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import {
  UserMembershipRepository,
  userMembershipRepository,
} from '../../repositories/userMembership.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

// Alfabet tanpa karakter ambigu (0/O/1/I) untuk nomor kartu yang mudah dibaca.
const genCard = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 10);

/**
 * Membership: saat lunas → aktifkan (status active) + generate `card_number`.
 * Tanggal mulai/expired TIDAK ditimpa (diinput manual saat registrasi).
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

    const cardNumber = await this.generateUniqueCardNumber(tx);
    await this.memberships.update(
      membership.id,
      { status: 'active', card_number: cardNumber },
      tx
    );
  }

  async onFailed(): Promise<void> {
    // Tidak ada aksi.
  }

  /** Nomor kartu unik `MBR-XXXXXXXXXX`; pre-check agar tak meracuni transaksi. */
  private async generateUniqueCardNumber(tx: Prisma.TransactionClient): Promise<string> {
    for (let i = 0; i < 6; i++) {
      const candidate = `MBR-${genCard()}`;
      const clash = await this.memberships.findByCardNumber(candidate, tx);
      if (!clash) return candidate;
    }
    // Sangat tak mungkin sampai sini; perpanjang untuk jaminan.
    return `MBR-${genCard()}${genCard()}`;
  }
}
