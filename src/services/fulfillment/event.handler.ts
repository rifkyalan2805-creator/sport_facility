import { Prisma } from '@prisma/client';
import {
  EventRegistrationRepository,
  eventRegistrationRepository,
} from '../../repositories/eventRegistration.repository';
import { EventRepository, eventRepository } from '../../repositories/event.repository';
import { FulfillmentHandler, FulfillmentItem } from './types';

/**
 * Event (berbayar): item_id menunjuk ke event_registration.
 * Saat lunas → registrasi confirmed. Saat gagal → cancelled + kuota dikembalikan.
 */
export class EventFulfillmentHandler implements FulfillmentHandler {
  readonly itemType = 'event' as const;

  constructor(
    private readonly registrations: EventRegistrationRepository = eventRegistrationRepository,
    private readonly events: EventRepository = eventRepository
  ) {}

  async onPaid(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const reg = await this.registrations.findById(item.itemId, tx);
    if (reg && reg.status === 'registered') {
      await this.registrations.update(reg.id, { status: 'confirmed' }, tx);
    }
  }

  async onFailed(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void> {
    const reg = await this.registrations.findById(item.itemId, tx);
    if (!reg || reg.status !== 'registered') return;

    await this.registrations.update(reg.id, { status: 'cancelled' }, tx);

    const event = await this.events.findById(reg.event_id, tx);
    if (event) {
      await this.events.update(
        event.id,
        { registered_count: Math.max(0, event.registered_count - 1) },
        tx
      );
    }
  }
}
