import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slug';
import {
  CancelRegistrationInput,
  CreateCategoryInput,
  CreateEventInput,
  RegisterEventInput,
  ScanRegistrationInput,
  UpdateCategoryInput,
  UpdateEventInput,
} from '../types/event.types';
import {
  EventCategoryRepository,
  eventCategoryRepository,
} from '../repositories/eventCategory.repository';
import { EventRepository, eventRepository } from '../repositories/event.repository';
import {
  EventRegistrationRepository,
  eventRegistrationRepository,
} from '../repositories/eventRegistration.repository';
import { PaymentService, paymentService } from './payment.service';

const CANCELLABLE_REG = ['registered', 'confirmed'];

export class EventService {
  constructor(
    private readonly categories: EventCategoryRepository = eventCategoryRepository,
    private readonly events: EventRepository = eventRepository,
    private readonly registrations: EventRegistrationRepository = eventRegistrationRepository,
    private readonly payments: PaymentService = paymentService
  ) {}

  // ---- Categories ----
  listCategories() {
    return this.categories.listAll();
  }

  createCategory(input: CreateCategoryInput) {
    return this.categories.create({
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      color: input.color ?? undefined,
      icon: input.icon ?? null,
    });
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const cat = await this.categories.findById(id);
    if (!cat) throw AppError.notFound('Kategori event tidak ditemukan');
    const data: Prisma.event_categoriesUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.color !== undefined) data.color = input.color;
    if (input.icon !== undefined) data.icon = input.icon;
    return this.categories.update(id, data);
  }

  // ---- Events ----
  listPublishedEvents() {
    return this.events.listPublished();
  }

  listAllEvents() {
    return this.events.listAll();
  }

  async getEvent(id: string) {
    const event = await this.events.findById(id);
    if (!event) throw AppError.notFound('Event tidak ditemukan');
    return event;
  }

  async getEventBySlug(slug: string) {
    const event = await this.events.findBySlug(slug);
    if (!event) throw AppError.notFound('Event tidak ditemukan');
    return event;
  }

  createEvent(input: CreateEventInput) {
    const data: Prisma.eventsUncheckedCreateInput = {
      category_id: input.categoryId,
      title: input.title,
      slug: input.slug ? slugify(input.slug) : slugify(input.title),
      description: input.description ?? null,
      banner_url: input.bannerUrl ?? null,
      event_date: input.eventDate,
      end_date: input.endDate ?? null,
      location: input.location ?? null,
      quota: input.quota,
      price: new Prisma.Decimal(input.price),
      organizer_name: input.organizerName ?? null,
      min_participants: input.minParticipants,
      registration_deadline: input.registrationDeadline ?? null,
      status: input.status,
    };
    return this.events.create(data);
  }

  async updateEvent(id: string, input: UpdateEventInput) {
    await this.getEvent(id);
    const data: Prisma.eventsUncheckedUpdateInput = {};
    if (input.categoryId !== undefined) data.category_id = input.categoryId;
    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.description !== undefined) data.description = input.description;
    if (input.bannerUrl !== undefined) data.banner_url = input.bannerUrl;
    if (input.eventDate !== undefined) data.event_date = input.eventDate;
    if (input.endDate !== undefined) data.end_date = input.endDate;
    if (input.location !== undefined) data.location = input.location;
    if (input.quota !== undefined) data.quota = input.quota;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.organizerName !== undefined) data.organizer_name = input.organizerName;
    if (input.minParticipants !== undefined) data.min_participants = input.minParticipants;
    if (input.registrationDeadline !== undefined)
      data.registration_deadline = input.registrationDeadline;
    if (input.status !== undefined) data.status = input.status;
    return this.events.update(id, data);
  }

  // ---- Registrations ----
  listMyRegistrations(userId: string) {
    return this.registrations.findManyByUser(userId);
  }

  /**
   * Registrasi event: reservasi kuota dalam transaksi (advisory lock).
   * Gratis → langsung confirmed. Berbayar → registered + pembayaran dummy.
   */
  async register(input: RegisterEventInput) {
    const result = await prisma.$transaction(
      async (tx) => {
        await this.events.acquireLock(input.eventId, tx);

        const event = await this.events.findById(input.eventId, tx);
        if (!event) throw AppError.notFound('Event tidak ditemukan');
        if (event.status !== 'published') {
          throw AppError.unprocessable('Event belum dibuka untuk registrasi');
        }
        const now = new Date();
        if (event.registration_deadline && now > event.registration_deadline) {
          throw AppError.unprocessable('Pendaftaran sudah ditutup');
        }
        if (now > event.event_date) {
          throw AppError.unprocessable('Event sudah berlangsung');
        }

        const duplicate = await this.registrations.findByUserAndEvent(
          input.userId,
          input.eventId,
          tx
        );
        if (duplicate) throw AppError.conflict('Anda sudah terdaftar pada event ini');

        if (event.registered_count >= event.quota) {
          throw AppError.unprocessable('Kuota event sudah penuh');
        }

        const isFree = new Prisma.Decimal(event.price).lessThanOrEqualTo(0);
        const registration = await this.registrations.create(
          {
            user_id: input.userId,
            event_id: input.eventId,
            qr_code: `EVT-${randomUUID()}`,
            status: isFree ? 'confirmed' : 'registered',
          },
          tx
        );

        await this.events.update(
          event.id,
          { registered_count: event.registered_count + 1 },
          tx
        );

        return { registration, event, isFree };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    // Event gratis tidak perlu pembayaran.
    if (result.isFree) {
      return { registration: result.registration, payment: null };
    }

    const payment = await this.payments.createPayment({
      userId: input.userId,
      items: [
        {
          itemType: 'event',
          itemId: result.registration.id,
          itemName: result.event.title,
          quantity: 1,
          unitPrice: new Prisma.Decimal(result.event.price).toNumber(),
        },
      ],
    });

    return { registration: result.registration, payment };
  }

  async cancelRegistration(input: CancelRegistrationInput) {
    const reg = await this.registrations.findById(input.id);
    if (!reg) throw AppError.notFound('Registrasi tidak ditemukan');
    if (reg.user_id !== input.userId) {
      throw new AppError(403, 'Anda tidak berhak membatalkan registrasi ini');
    }
    if (!CANCELLABLE_REG.includes(reg.status)) {
      throw AppError.unprocessable(`Registrasi berstatus "${reg.status}" tidak bisa dibatalkan`);
    }

    return prisma.$transaction(async (tx) => {
      await this.registrations.update(reg.id, { status: 'cancelled' }, tx);
      const event = await this.events.findById(reg.event_id, tx);
      if (event) {
        await this.events.update(
          event.id,
          { registered_count: Math.max(0, event.registered_count - 1) },
          tx
        );
      }
      return this.registrations.findById(reg.id, tx);
    });
  }

  /** Check-in peserta via QR (staff/admin). Hanya registrasi confirmed. */
  async scanRegistration(input: ScanRegistrationInput) {
    const reg = await this.registrations.findByQr(input.qrCode);
    if (!reg) throw AppError.notFound('Registrasi tidak ditemukan');
    if (reg.status !== 'confirmed') {
      throw AppError.unprocessable(
        `Registrasi belum dikonfirmasi/dibayar (status "${reg.status}")`
      );
    }
    return this.registrations.update(reg.id, {
      status: 'checked_in',
      check_in_at: new Date(),
    });
  }
}

export const eventService = new EventService();
