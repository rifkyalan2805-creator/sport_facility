import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { timeToDate } from '../utils/time';
import { CancelWaitingInput, JoinWaitingListInput } from '../types/waitingList.types';
import {
  WaitingListRepository,
  waitingListRepository,
} from '../repositories/waitingList.repository';
import { CourtRepository, courtRepository } from '../repositories/court.repository';
import { BookingRepository, bookingRepository } from '../repositories/booking.repository';

// Status yang masih bisa dibatalkan oleh user.
const CANCELLABLE = ['waiting', 'notified'];

export class WaitingListService {
  constructor(
    private readonly waiting: WaitingListRepository = waitingListRepository,
    private readonly courts: CourtRepository = courtRepository,
    private readonly bookings: BookingRepository = bookingRepository
  ) {}

  /**
   * Masuk antrean. Hanya diizinkan jika slot yang diminta MEMANG sudah
   * terbooking (bentrok). Jika masih kosong → arahkan user booking langsung.
   */
  async join(input: JoinWaitingListInput) {
    const court = await this.courts.findActiveById(input.courtId);
    if (!court) throw AppError.notFound('Court tidak ditemukan atau tidak aktif');

    const today = new Date().toISOString().slice(0, 10);
    if (input.preferredDate < today) {
      throw AppError.badRequest('preferred_date tidak boleh di masa lalu');
    }

    const conflict = await this.bookings.findConflicting(
      input.courtId,
      input.preferredDate,
      input.preferredStart,
      input.preferredEnd,
      prisma
    );
    if (conflict.length === 0) {
      throw AppError.unprocessable(
        'Slot masih tersedia — silakan booking langsung, tidak perlu antre'
      );
    }

    return this.waiting.create({
      user_id: input.userId,
      court_id: input.courtId,
      preferred_date: new Date(input.preferredDate),
      preferred_start: timeToDate(input.preferredStart),
      preferred_end: timeToDate(input.preferredEnd),
      status: 'waiting',
    });
  }

  listMine(userId: string) {
    return this.waiting.findManyByUser(userId);
  }

  async cancel(input: CancelWaitingInput) {
    const entry = await this.waiting.findById(input.id);
    if (!entry) throw AppError.notFound('Entri waiting list tidak ditemukan');
    if (entry.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan entri ini');
    }
    if (!CANCELLABLE.includes(entry.status)) {
      throw AppError.unprocessable(
        `Entri berstatus "${entry.status}" tidak bisa dibatalkan`
      );
    }
    return this.waiting.update(entry.id, { status: 'cancelled' });
  }
}

export const waitingListService = new WaitingListService();
