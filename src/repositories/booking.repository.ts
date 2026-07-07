import { Prisma, booking_status } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';
import { ListBookingFilter } from '../types/booking.types';

// Status yang dianggap "memakai slot" (tidak boleh overlap).
const ACTIVE_STATUSES: booking_status[] = [
  'pending',
  'confirmed',
  'checked_in',
  'completed',
];

/**
 * BookingRepository — HANYA query DB. Tidak ada aturan bisnis.
 * Pengecekan overlap & advisory lock ditulis sebagai raw query karena
 * Prisma tidak mendukung SELECT ... FOR UPDATE / pg_advisory_lock native,
 * namun keputusan KAPAN memanggilnya tetap milik service layer.
 */
export class BookingRepository {
  /**
   * Advisory transaction lock per court. Memastikan pengecekan overlap +
   * insert berjalan serial untuk court yang sama (mencegah double-booking
   * akibat race condition). Harus dipanggil di dalam transaksi.
   */
  async acquireCourtLock(courtId: string, db: DbClient): Promise<void> {
    await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${courtId}))`;
  }

  /**
   * Cari booking yang bentrok pada court + tanggal + rentang waktu.
   * Overlap: existing.start < new.end AND existing.end > new.start.
   */
  async findConflicting(
    courtId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    db: DbClient
  ): Promise<{ id: string }[]> {
    return db.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM bookings
      WHERE court_id = ${courtId}::uuid
        AND booking_date = ${bookingDate}::date
        AND status = ANY (${ACTIVE_STATUSES}::booking_status[])
        AND start_time < ${endTime}::time
        AND end_time   > ${startTime}::time
      LIMIT 1
    `;
  }

  /** Booking aktif (memakai slot) pada satu court + tanggal — untuk hitung ketersediaan. */
  findActiveByCourtDate(courtId: string, bookingDate: string, db: DbClient = prisma) {
    return db.bookings.findMany({
      where: {
        court_id: courtId,
        booking_date: new Date(bookingDate),
        status: { in: ACTIVE_STATUSES },
      },
      select: { start_time: true, end_time: true },
    });
  }

  create(data: Prisma.bookingsUncheckedCreateInput, db: DbClient = prisma) {
    return db.bookings.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.bookings.findUnique({
      where: { id },
      include: {
        courts: { select: { id: true, name: true, code: true, type: true } },
      },
    });
  }

  async findMany(filter: ListBookingFilter, db: DbClient = prisma) {
    const where: Prisma.bookingsWhereInput = {
      ...(filter.userId ? { user_id: filter.userId } : {}),
      ...(filter.courtId ? { court_id: filter.courtId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.bookingDate ? { booking_date: new Date(filter.bookingDate) } : {}),
    };

    const [data, total] = await Promise.all([
      db.bookings.findMany({
        where,
        orderBy: [{ booking_date: 'desc' }, { start_time: 'desc' }],
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { courts: { select: { name: true, code: true } } },
      }),
      db.bookings.count({ where }),
    ]);

    return { data, total };
  }

  updateStatus(
    id: string,
    data: Prisma.bookingsUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.bookings.update({ where: { id }, data });
  }
}

export const bookingRepository = new BookingRepository();
