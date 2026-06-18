import { item_type } from '@prisma/client';
import { FulfillmentHandler } from './types';
import { BookingFulfillmentHandler } from './booking.handler';
import { MembershipFulfillmentHandler } from './membership.handler';
import { PoolTicketFulfillmentHandler } from './poolTicket.handler';
import { TicketFulfillmentHandler } from './ticket.handler';
import { EventFulfillmentHandler } from './event.handler';

/**
 * Registry handler fulfilment per `item_type`. Untuk menambah modul berbayar
 * baru, cukup buat handler + daftarkan di sini — PaymentService tidak berubah.
 */
export class FulfillmentRegistry {
  private readonly handlers = new Map<item_type, FulfillmentHandler>();

  register(handler: FulfillmentHandler): this {
    this.handlers.set(handler.itemType, handler);
    return this;
  }

  get(itemType: item_type): FulfillmentHandler | undefined {
    return this.handlers.get(itemType);
  }
}

export const fulfillmentRegistry = new FulfillmentRegistry()
  .register(new BookingFulfillmentHandler())
  .register(new MembershipFulfillmentHandler())
  .register(new PoolTicketFulfillmentHandler())
  .register(new TicketFulfillmentHandler())
  .register(new EventFulfillmentHandler());
