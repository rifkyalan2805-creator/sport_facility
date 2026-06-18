export interface CreatePlanInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  durationDays: number;
  maxBookingsMonth: number;
  discountPercent: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface UpdatePlanInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  maxBookingsMonth?: number;
  discountPercent?: number;
  benefits?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface SubscribeInput {
  userId: string;
  planId: string;
  autoRenew: boolean;
}

export interface CancelMembershipInput {
  id: string;
  userId: string;
}
