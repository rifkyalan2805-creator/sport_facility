import { Prisma } from '@prisma/client';
import { BookingRepository, bookingRepository } from '../../repositories/booking.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

/**
 * Booking: saat lunas → confirm (jika masih pending).
 * Saat gagal → tidak diubah (booking tetap pending, sesuai requirement awal).
 */
export class BookingFulfillmentHandler implements FulfillmentHandler {
  readonly itemType = 'booking' as const;

  constructor(private readonly bookings: BookingRepository = bookingRepository) {}

  async onPaid(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const booking = await this.bookings.findById(item.itemId, tx);
    if (booking && booking.status === 'pending') {
      await this.bookings.updateStatus(booking.id, { status: 'confirmed' }, tx);
    }
  }

  async onFailed(): Promise<void> {
    // Tidak ada aksi — booking tetap pada status sebelumnya.
  }
}
