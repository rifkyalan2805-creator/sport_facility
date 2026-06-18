import { item_type } from '@prisma/client';

export interface CreateReviewInput {
  userId: string;
  itemType: item_type;
  itemId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  id: string;
  userId: string;
  rating?: number;
  comment?: string;
}

export interface DeleteReviewInput {
  id: string;
  userId: string;
}

export interface ListReviewFilter {
  itemType: item_type;
  itemId: string;
}
