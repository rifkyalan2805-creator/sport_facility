import { Request, Response } from 'express';
import { inventoryService, InventoryService } from '../services/inventory.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import {
  AdjustStockBody,
  CreateCategoryBody,
  CreateProductBody,
  UpdateCategoryBody,
  UpdateProductBody,
} from '../validators/inventory.validator';

export class InventoryController {
  constructor(private readonly service: InventoryService = inventoryService) {}

  listCategories = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.listCategories() });
  });

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateCategoryBody;
    const data = await this.service.createCategory({
      name: b.name,
      slug: b.slug,
      parentId: b.parent_id,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateCategoryBody;
    const data = await this.service.updateCategory(req.params.id, {
      name: b.name,
      slug: b.slug,
      parentId: b.parent_id,
      sortOrder: b.sort_order,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listProducts = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.listProducts() });
  });

  getProduct = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.getProduct(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  createProduct = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateProductBody;
    const data = await this.service.createProduct({
      categoryId: b.category_id,
      name: b.name,
      sku: b.sku,
      description: b.description,
      price: b.price,
      costPrice: b.cost_price,
      stock: b.stock,
      minStock: b.min_stock,
      imageUrl: b.image_url,
      isActive: b.is_active,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  updateProduct = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateProductBody;
    const data = await this.service.updateProduct(req.params.id, {
      categoryId: b.category_id,
      name: b.name,
      sku: b.sku,
      description: b.description,
      price: b.price,
      costPrice: b.cost_price,
      minStock: b.min_stock,
      imageUrl: b.image_url,
      isActive: b.is_active,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  adjustStock = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as AdjustStockBody;
    const data = await this.service.adjustStock({
      productId: req.params.id,
      type: b.type,
      quantity: b.quantity,
      userId: req.userId!,
      notes: b.notes,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  listLogs = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listLogs(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const inventoryController = new InventoryController();
