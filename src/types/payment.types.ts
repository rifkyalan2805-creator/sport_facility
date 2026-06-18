import { item_type, payment_status } from '@prisma/client';

export interface PaymentItemInput {
  itemType: item_type;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePaymentInput {
  userId: string;
  paymentMethodId?: string;
  promoId?: string;
  promoCode?: string;
  discountAmount?: number;
  items: PaymentItemInput[];
  idempotencyKey?: string;
}

export interface ListPaymentFilter {
  userId?: string;
  status?: payment_status;
  page: number;
  limit: number;
}

export interface SimulatePaymentInput {
  paymentId: string;
  userId: string;
  reason?: string;
}
