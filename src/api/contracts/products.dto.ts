// ============================================================================
// DTOs & Contracts: Products & Catalog
// NestJS Controller: @Controller('products') ou @Controller('produtos')
// ============================================================================

export interface PriceTierDto {
  id?: string;
  quantity: number;
  price: number;
  cost?: number;
}

export interface KitSubItemDto {
  id?: string;
  title: string;
  size?: string;
  printType?: string;
  paper?: string;
  finishing?: string;
  image?: string;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  basePrice?: number;
  cost?: number;
  unit: string;
  minQty?: number;
  image?: string;
  description?: string;
  isInternal?: boolean;
  isM2?: boolean;
  baseM2Price?: number;
  productionTime?: string;
  paperType?: string;
  paperWeight?: string;
  printType?: string;
  priceType?: 'quantidade' | 'escalonado';
  priceTiers?: PriceTierDto[];
  compatibleFinishings?: string[];
  kitItems?: KitSubItemDto[];
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  price?: number;
  basePrice?: number;
  cost?: number;
  unit?: string;
  minQty?: number;
  image?: string;
  description?: string;
  isInternal?: boolean;
  isM2?: boolean;
  baseM2Price?: number;
  productionTime?: string;
  paperType?: string;
  paperWeight?: string;
  printType?: string;
  priceType?: 'quantidade' | 'escalonado';
  priceTiers?: PriceTierDto[];
  compatibleFinishings?: string[];
  kitItems?: KitSubItemDto[];
  isActive?: boolean;
}

export interface ProductQueryDto {
  search?: string;
  category?: string;
  isInternal?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponseDto {
  id: string;
  name: string;
  category: string;
  price: number;
  basePrice?: number;
  cost?: number;
  unit: string;
  minQty?: number;
  image?: string;
  description?: string;
  isInternal?: boolean;
  isM2?: boolean;
  baseM2Price?: number;
  productionTime?: string;
  paperType?: string;
  paperWeight?: string;
  printType?: string;
  priceType?: 'quantidade' | 'escalonado';
  priceTiers?: PriceTierDto[];
  compatibleFinishings?: string[];
  kitItems?: KitSubItemDto[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
