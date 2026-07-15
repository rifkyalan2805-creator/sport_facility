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
  memberName: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'laki_laki' | 'perempuan' | 'lainnya';
  city: string;
  photoUrl: string;
  medicalNotes?: string;
  startDate: string; // YYYY-MM-DD; end dihitung server
  termsAccepted: boolean;
  marketingOptIn: boolean;
}

export interface CancelMembershipInput {
  id: string;
  userId: string;
}
