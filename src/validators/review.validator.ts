import { z } from 'zod';
import { item_type } from '@prisma/client';

const uuid = z.string().uuid('Harus berupa UUID valid');

export const createReviewSchema = z.object({
  item_type: z.nativeEnum(item_type),
  item_id: uuid,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Minimal satu field untuk diupdate' });

export const listReviewQuerySchema = z.object({
  item_type: z.nativeEnum(item_type),
  item_id: uuid,
});

export const reviewIdParamSchema = z.object({ id: uuid });

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>;
export type ListReviewQuery = z.infer<typeof listReviewQuerySchema>;
