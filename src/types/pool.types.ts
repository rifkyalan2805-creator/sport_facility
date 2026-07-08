import { pool_session_status } from '@prisma/client';

export interface CreateSessionInput {
  name: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  notes?: string;
}

export interface UpdateSessionInput {
  name?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  status?: pool_session_status;
  notes?: string;
}

export interface CreateTicketTypeInput {
  name: string;
  price: number;
  ageMin: number;
  ageMax: number;
  isActive: boolean;
}

export interface UpdateTicketTypeInput {
  name?: string;
  price?: number;
  ageMin?: number;
  ageMax?: number;
  isActive?: boolean;
}

export interface BuyTicketInput {
  userId: string;
  sessionId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface CancelTicketInput {
  id: string;
  userId: string;
}

export interface PoolCheckoutItemInput {
  ticketTypeId: string;
  quantity: number;
}

// Checkout grup: banyak tiket dalam 1 sesi → 1 pembayaran (diskon grup otomatis).
export interface PoolCheckoutInput {
  userId: string;
  sessionId: string;
  items: PoolCheckoutItemInput[];
  idempotencyKey?: string;
}
