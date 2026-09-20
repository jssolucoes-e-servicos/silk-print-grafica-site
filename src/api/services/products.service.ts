// ============================================================================
// Products Service (Produtos e Catálogo)
// NestJS Controller: @Controller('products') ou @Controller('produtos')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
} from '../contracts/products.dto';

export class ProductsService {
  /**
   * GET /api/produtos
   */
  public async getAll(query?: ProductQueryDto): Promise<ProductResponseDto[]> {
    return apiClient.get<ProductResponseDto[]>('/produtos', query);
  }

  /**
   * GET /api/produtos/:id
   */
  public async getById(id: string): Promise<ProductResponseDto> {
    return apiClient.get<ProductResponseDto>(`/produtos/${id}`);
  }

  /**
   * POST /api/produtos
   */
  public async create(data: CreateProductDto): Promise<ProductResponseDto> {
    return apiClient.post<ProductResponseDto>('/produtos', data);
  }

  /**
   * PUT /api/produtos/:id
   */
  public async update(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    return apiClient.put<ProductResponseDto>(`/produtos/${id}`, data);
  }

  /**
   * DELETE /api/produtos/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/produtos/${id}`);
    return true;
  }

  /**
   * PATCH /api/produtos/:id/toggle-active
   */
  public async toggleActive(id: string, isActive: boolean): Promise<ProductResponseDto> {
    return apiClient.patch<ProductResponseDto>(`/produtos/${id}/toggle-active`, { isActive });
  }

  /**
   * GET /api/produtos/categories/list
   */
  public async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/produtos/categories/list');
  }
}

export const productsService = new ProductsService();
