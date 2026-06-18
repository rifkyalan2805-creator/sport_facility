import { promo_type, promos } from '@prisma/client';

export interface CreatePromoInput {
  code: string;
  name: string;
  description?: string;
  type: promo_type;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  quota: number;
  applicableTo: string[];
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

export interface UpdatePromoInput {
  code?: string;
  name?: string;
  description?: string;
  type?: promo_type;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  quota?: number;
  applicableTo?: string[];
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export interface ValidatePromoResult {
  promo: promos;
  discountAmount: number;
}
