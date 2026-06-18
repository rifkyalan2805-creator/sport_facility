import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import {
  CreateReviewInput,
  DeleteReviewInput,
  ListReviewFilter,
  UpdateReviewInput,
} from '../types/review.types';
import { ReviewRepository, reviewRepository } from '../repositories/review.repository';

export class ReviewService {
  constructor(private readonly reviews: ReviewRepository = reviewRepository) {}

  /** Ulasan terpublikasi untuk sebuah entitas (publik). */
  listByItem(filter: ListReviewFilter) {
    return this.reviews.listPublishedByItem(filter.itemType, filter.itemId);
  }

  async create(input: CreateReviewInput) {
    const existing = await this.reviews.findByUserItem(
      input.userId,
      input.itemType,
      input.itemId
    );
    if (existing) {
      throw AppError.conflict('Anda sudah memberi ulasan untuk item ini');
    }

    const data: Prisma.reviewsUncheckedCreateInput = {
      user_id: input.userId,
      item_type: input.itemType,
      item_id: input.itemId,
      rating: input.rating,
      comment: input.comment ?? null,
    };
    return this.reviews.create(data);
  }

  async update(input: UpdateReviewInput) {
    const review = await this.ownReview(input.id, input.userId);
    const data: Prisma.reviewsUncheckedUpdateInput = {};
    if (input.rating !== undefined) data.rating = input.rating;
    if (input.comment !== undefined) data.comment = input.comment;
    return this.reviews.update(review.id, data);
  }

  async remove(input: DeleteReviewInput) {
    const review = await this.ownReview(input.id, input.userId);
    await this.reviews.delete(review.id);
  }

  private async ownReview(id: string, userId: string) {
    const review = await this.reviews.findById(id);
    if (!review) throw AppError.notFound('Ulasan tidak ditemukan');
    if (review.user_id !== userId) {
      throw new AppError(403, 'Anda tidak berhak mengubah ulasan ini');
    }
    return review;
  }
}

export const reviewService = new ReviewService();
