import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { timeToDate } from '../utils/time';
import {
  BuyTicketInput,
  CancelTicketInput,
  CreateSessionInput,
  CreateTicketTypeInput,
  UpdateSessionInput,
  UpdateTicketTypeInput,
} from '../types/pool.types';
import {
  PoolSessionRepository,
  poolSessionRepository,
} from '../repositories/poolSession.repository';
import {
  PoolTicketTypeRepository,
  poolTicketTypeRepository,
} from '../repositories/poolTicketType.repository';
import {
  PoolTicketRepository,
  poolTicketRepository,
} from '../repositories/poolTicket.repository';
import { PaymentService, paymentService } from './payment.service';

export class PoolService {
  constructor(
    private readonly sessions: PoolSessionRepository = poolSessionRepository,
    private readonly ticketTypes: PoolTicketTypeRepository = poolTicketTypeRepository,
    private readonly tickets: PoolTicketRepository = poolTicketRepository,
    private readonly payments: PaymentService = paymentService
  ) {}

  // ---- Sessions (read publik) ----
  listUpcomingSessions() {
    return this.sessions.listUpcoming();
  }

  listAllSessions() {
    return this.sessions.listAll();
  }

  async getSession(id: string) {
    const session = await this.sessions.findById(id);
    if (!session) throw AppError.notFound('Sesi kolam tidak ditemukan');
    return session;
  }

  // ---- Sessions (admin) ----
  createSession(input: CreateSessionInput) {
    const data: Prisma.pool_sessionsUncheckedCreateInput = {
      name: input.name,
      session_date: new Date(input.sessionDate),
      start_time: timeToDate(input.startTime),
      end_time: timeToDate(input.endTime),
      capacity: input.capacity,
      notes: input.notes ?? null,
    };
    return this.sessions.create(data);
  }

  async updateSession(id: string, input: UpdateSessionInput) {
    await this.getSession(id);
    const data: Prisma.pool_sessionsUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.sessionDate !== undefined) data.session_date = new Date(input.sessionDate);
    if (input.startTime !== undefined) data.start_time = timeToDate(input.startTime);
    if (input.endTime !== undefined) data.end_time = timeToDate(input.endTime);
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.status !== undefined) data.status = input.status;
    if (input.notes !== undefined) data.notes = input.notes;
    return this.sessions.update(id, data);
  }

  // ---- Ticket types ----
  listTicketTypes() {
    return this.ticketTypes.listActive();
  }

  createTicketType(input: CreateTicketTypeInput) {
    return this.ticketTypes.create({
      name: input.name,
      price: new Prisma.Decimal(input.price),
      age_min: input.ageMin,
      age_max: input.ageMax,
      is_active: input.isActive,
    });
  }

  async updateTicketType(id: string, input: UpdateTicketTypeInput) {
    const tt = await this.ticketTypes.findById(id);
    if (!tt) throw AppError.notFound('Tipe tiket tidak ditemukan');
    const data: Prisma.pool_ticket_typesUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.ageMin !== undefined) data.age_min = input.ageMin;
    if (input.ageMax !== undefined) data.age_max = input.ageMax;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    return this.ticketTypes.update(id, data);
  }

  // ---- Beli tiket ----
  listMyTickets(userId: string) {
    return this.tickets.findManyByUser(userId);
  }

  /**
   * Reservasi + buat tiket dalam transaksi (advisory lock per sesi),
   * lalu buat pembayaran dummy. Tiket aktif = kursi sudah dipesan.
   */
  async buyTicket(input: BuyTicketInput) {
    const ticket = await prisma.$transaction(
      async (tx) => {
        await this.sessions.acquireLock(input.sessionId, tx);

        const session = await this.sessions.findById(input.sessionId, tx);
        if (!session) throw AppError.notFound('Sesi kolam tidak ditemukan');
        if (session.status !== 'open') {
          throw AppError.unprocessable('Sesi tidak menerima pemesanan');
        }
        const todayStr = new Date().toISOString().slice(0, 10);
        if (session.session_date.toISOString().slice(0, 10) < todayStr) {
          throw AppError.unprocessable('Sesi sudah lewat');
        }

        const ticketType = await this.ticketTypes.findActiveById(input.ticketTypeId, tx);
        if (!ticketType) throw AppError.notFound('Tipe tiket tidak ditemukan atau tidak aktif');

        const newCount = session.booked_count + input.quantity;
        if (newCount > session.capacity) {
          throw AppError.unprocessable(
            `Kuota tidak mencukupi (tersisa ${session.capacity - session.booked_count})`
          );
        }

        const unit = new Prisma.Decimal(ticketType.price);
        const created = await this.tickets.create(
          {
            user_id: input.userId,
            session_id: input.sessionId,
            ticket_type_id: input.ticketTypeId,
            quantity: input.quantity,
            unit_price: unit,
            total_price: unit.mul(input.quantity),
            qr_code: `POOL-${randomUUID()}`,
            status: 'active',
          },
          tx
        );

        await this.sessions.update(
          input.sessionId,
          {
            booked_count: newCount,
            status: newCount >= session.capacity ? 'full' : session.status,
          },
          tx
        );

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    const payment = await this.payments.createPayment({
      userId: input.userId,
      items: [
        {
          itemType: 'pool_ticket',
          itemId: ticket.id,
          itemName: `Tiket kolam x${ticket.quantity}`,
          quantity: ticket.quantity,
          unitPrice: ticket.unit_price.toNumber(),
        },
      ],
    });

    return { ticket, payment };
  }

  async cancelTicket(input: CancelTicketInput) {
    const ticket = await this.tickets.findById(input.id);
    if (!ticket) throw AppError.notFound('Tiket tidak ditemukan');
    if (ticket.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan tiket ini');
    }
    if (ticket.status !== 'active') {
      throw AppError.unprocessable(`Tiket berstatus "${ticket.status}" tidak bisa dibatalkan`);
    }

    return prisma.$transaction(async (tx) => {
      await this.tickets.update(
        ticket.id,
        { status: 'cancelled', cancelled_at: new Date() },
        tx
      );
      const session = await this.sessions.findById(ticket.session_id, tx);
      if (session) {
        const newCount = Math.max(0, session.booked_count - ticket.quantity);
        await this.sessions.update(
          session.id,
          {
            booked_count: newCount,
            status: session.status === 'full' ? 'open' : session.status,
          },
          tx
        );
      }
      return this.tickets.findById(ticket.id, tx);
    });
  }
}

export const poolService = new PoolService();
