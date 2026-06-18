export interface CreateCategoryInput {
  name: string;
  description?: string;
  price: number;
  quota: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  price?: number;
  quota?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BuyTicketInput {
  userId: string;
  categoryId: string;
  quantity: number;
}

export interface CancelTicketInput {
  id: string;
  userId: string;
}

export interface ScanTicketInput {
  qrCode: string;
  scannedBy: string;
  location?: string;
  notes?: string;
}
