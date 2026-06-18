jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { ReviewService } from '../src/services/review.service';
import { ReviewRepository } from '../src/repositories/review.repository';

const mockReviews = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findByUserItem: jest.fn(),
    listPublishedByItem: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<ReviewRepository>);

function build() {
  const reviews = mockReviews();
  return { service: new ReviewService(reviews), reviews };
}

const input = { userId: 'u1', itemType: 'booking' as const, itemId: 'b1', rating: 5, comment: 'Mantap' };

describe('ReviewService.create', () => {
  it('membuat ulasan baru', async () => {
    const { service, reviews } = build();
    (reviews.findByUserItem as jest.Mock).mockResolvedValue(null);
    (reviews.create as jest.Mock).mockImplementation(async (d) => d);

    const res = await service.create(input);

    expect(reviews.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', item_type: 'booking', item_id: 'b1', rating: 5 })
    );
    expect((res as { rating: number }).rating).toBe(5);
  });

  it('menolak (409) jika sudah pernah mengulas item yang sama', async () => {
    const { service, reviews } = build();
    (reviews.findByUserItem as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 409 });
    expect(reviews.create).not.toHaveBeenCalled();
  });
});

describe('ReviewService.update / remove', () => {
  it('menolak (403) update ulasan milik user lain', async () => {
    const { service, reviews } = build();
    (reviews.findById as jest.Mock).mockResolvedValue({ id: 'r1', user_id: 'other' });

    await expect(service.update({ id: 'r1', userId: 'u1', rating: 3 })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('menghapus ulasan sendiri', async () => {
    const { service, reviews } = build();
    (reviews.findById as jest.Mock).mockResolvedValue({ id: 'r1', user_id: 'u1' });

    await service.remove({ id: 'r1', userId: 'u1' });
    expect(reviews.delete).toHaveBeenCalledWith('r1');
  });
});
