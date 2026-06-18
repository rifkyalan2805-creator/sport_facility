import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slug';
import {
  ProductCategoryRepository,
  productCategoryRepository,
} from '../repositories/productCategory.repository';
import { ProductRepository, productRepository } from '../repositories/product.repository';
import {
  InventoryLogRepository,
  inventoryLogRepository,
} from '../repositories/inventoryLog.repository';

type StockMovementType = 'in' | 'out' | 'adjustment' | 'sale' | 'return';

interface CreateCategoryInput {
  name: string;
  slug?: string;
  parentId?: string;
  sortOrder: number;
}
interface CreateProductInput {
  categoryId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  isActive: boolean;
}
interface AdjustStockInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  userId: string;
  notes?: string;
}

export class InventoryService {
  constructor(
    private readonly categories: ProductCategoryRepository = productCategoryRepository,
    private readonly products: ProductRepository = productRepository,
    private readonly logs: InventoryLogRepository = inventoryLogRepository
  ) {}

  // ---- Categories ----
  listCategories() {
    return this.categories.listAll();
  }

  createCategory(input: CreateCategoryInput) {
    return this.categories.create({
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      parent_id: input.parentId ?? null,
      sort_order: input.sortOrder,
    });
  }

  async updateCategory(id: string, input: { name?: string; slug?: string; parentId?: string | null; sortOrder?: number }) {
    const cat = await this.categories.findById(id);
    if (!cat) throw AppError.notFound('Kategori produk tidak ditemukan');
    const data: Prisma.product_categoriesUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.parentId !== undefined) data.parent_id = input.parentId;
    if (input.sortOrder !== undefined) data.sort_order = input.sortOrder;
    return this.categories.update(id, data);
  }

  // ---- Products ----
  listProducts() {
    return this.products.listActive();
  }

  async getProduct(id: string) {
    const p = await this.products.findById(id);
    if (!p) throw AppError.notFound('Produk tidak ditemukan');
    return p;
  }

  createProduct(input: CreateProductInput) {
    const data: Prisma.productsUncheckedCreateInput = {
      category_id: input.categoryId,
      name: input.name,
      sku: input.sku,
      description: input.description ?? null,
      price: new Prisma.Decimal(input.price),
      cost_price: new Prisma.Decimal(input.costPrice),
      stock: input.stock,
      min_stock: input.minStock,
      image_url: input.imageUrl ?? null,
      is_active: input.isActive,
    };
    return this.products.create(data);
  }

  async updateProduct(
    id: string,
    input: {
      categoryId?: string;
      name?: string;
      sku?: string;
      description?: string;
      price?: number;
      costPrice?: number;
      minStock?: number;
      imageUrl?: string;
      isActive?: boolean;
    }
  ) {
    await this.getProduct(id);
    const data: Prisma.productsUncheckedUpdateInput = {};
    if (input.categoryId !== undefined) data.category_id = input.categoryId;
    if (input.name !== undefined) data.name = input.name;
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.costPrice !== undefined) data.cost_price = new Prisma.Decimal(input.costPrice);
    if (input.minStock !== undefined) data.min_stock = input.minStock;
    if (input.imageUrl !== undefined) data.image_url = input.imageUrl;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    return this.products.update(id, data);
  }

  listLogs(productId: string) {
    return this.logs.listByProduct(productId);
  }

  /**
   * Pergerakan stok: hitung stok baru, validasi tidak negatif, update produk
   * & catat inventory_log dalam satu transaksi.
   * - in/return  → tambah; out/sale → kurang; adjustment → set absolut.
   */
  async adjustStock(input: AdjustStockInput) {
    const product = await this.getProduct(input.productId);
    const before = product.stock;

    let after: number;
    if (input.type === 'in' || input.type === 'return') after = before + input.quantity;
    else if (input.type === 'out' || input.type === 'sale') after = before - input.quantity;
    else after = input.quantity; // adjustment = set absolut

    if (after < 0) throw AppError.unprocessable('Stok tidak boleh negatif');

    return prisma.$transaction(async (tx) => {
      await this.products.update(product.id, { stock: after }, tx);
      return this.logs.create(
        {
          product_id: product.id,
          type: input.type,
          quantity: input.quantity,
          stock_before: before,
          stock_after: after,
          notes: input.notes ?? null,
          created_by: input.userId,
        },
        tx
      );
    });
  }
}

export const inventoryService = new InventoryService();
