jest.mock('../src/config/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  },
}));

import { InventoryService } from '../src/services/inventory.service';
import { ProductCategoryRepository } from '../src/repositories/productCategory.repository';
import { ProductRepository } from '../src/repositories/product.repository';
import { InventoryLogRepository } from '../src/repositories/inventoryLog.repository';

const mockCategories = () =>
  ({ listAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<ProductCategoryRepository>);
const mockProducts = () =>
  ({ listActive: jest.fn(), listAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<ProductRepository>);
const mockLogs = () =>
  ({ create: jest.fn(), listByProduct: jest.fn() } as unknown as jest.Mocked<InventoryLogRepository>);

function build() {
  const categories = mockCategories();
  const products = mockProducts();
  const logs = mockLogs();
  return { service: new InventoryService(categories, products, logs), categories, products, logs };
}

describe('InventoryService.adjustStock', () => {
  it('type=in: stok bertambah & log mencatat before/after', async () => {
    const { service, products, logs } = build();
    (products.findById as jest.Mock).mockResolvedValue({ id: 'p1', stock: 10 });
    (logs.create as jest.Mock).mockImplementation(async (d) => d);

    await service.adjustStock({ productId: 'p1', type: 'in', quantity: 5, userId: 'u1' });

    expect(products.update).toHaveBeenCalledWith('p1', { stock: 15 }, expect.anything());
    expect(logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'in', quantity: 5, stock_before: 10, stock_after: 15, created_by: 'u1' }),
      expect.anything()
    );
  });

  it('type=out: stok berkurang', async () => {
    const { service, products } = build();
    (products.findById as jest.Mock).mockResolvedValue({ id: 'p1', stock: 10 });

    await service.adjustStock({ productId: 'p1', type: 'out', quantity: 4, userId: 'u1' });
    expect(products.update).toHaveBeenCalledWith('p1', { stock: 6 }, expect.anything());
  });

  it('type=adjustment: set stok absolut', async () => {
    const { service, products } = build();
    (products.findById as jest.Mock).mockResolvedValue({ id: 'p1', stock: 10 });

    await service.adjustStock({ productId: 'p1', type: 'adjustment', quantity: 3, userId: 'u1' });
    expect(products.update).toHaveBeenCalledWith('p1', { stock: 3 }, expect.anything());
  });

  it('menolak (422) jika stok menjadi negatif', async () => {
    const { service, products, logs } = build();
    (products.findById as jest.Mock).mockResolvedValue({ id: 'p1', stock: 2 });

    await expect(
      service.adjustStock({ productId: 'p1', type: 'out', quantity: 5, userId: 'u1' })
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(logs.create).not.toHaveBeenCalled();
  });

  it('menolak (404) jika produk tidak ada', async () => {
    const { service, products } = build();
    (products.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.adjustStock({ productId: 'x', type: 'in', quantity: 1, userId: 'u1' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
