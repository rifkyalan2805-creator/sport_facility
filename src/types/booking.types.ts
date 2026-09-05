import { booking_status, booking_type, court_type } from '@prisma/client';

// Input tervalidasi untuk membuat booking (insidentil & abonemen disatukan).
export interface CreateBookingInput {
  userId: string;
  courtId: string;
  bookingType: booking_type;
  withLight?: boolean; // hanya berpengaruh untuk tenis (pilih tarif lampu/non-lampu)
  abonemenId?: string; // jika diisi → paket prabayar (total 0)
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
}

export interface ListBookingFilter {
  userId?: string;
  courtId?: string;
  /** Saring per cabang olahraga lewat relasi courts.type (mis. tennis, paddle). */
  courtType?: court_type;
  /** insidentil vs abonemen. */
  bookingType?: booking_type;
  status?: booking_status;
  bookingDate?: string; // YYYY-MM-DD
  page: number;
  limit: number;
}

export interface CancelBookingInput {
  bookingId: string;
  userId: string;
  reason?: string;
}
