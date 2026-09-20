// ============================================================================
// DTOs & Contracts: Finishings (Acabamentos)
// NestJS Controller: @Controller('finishings') ou @Controller('acabamentos')
// ============================================================================

export type FinishingPricingType = 'unidade' | 'm2' | 'fixo';

export interface CreateFinishingDto {
  name: string;
  category: string;
  price: number;
  cost?: number;
  unit?: string;
  pricingType: FinishingPricingType;
  extraDays?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateFinishingDto {
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  unit?: string;
  pricingType?: FinishingPricingType;
  extraDays?: number;
  description?: string;
  isActive?: boolean;
}

export interface FinishingResponseDto {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  unit?: string;
  pricingType: FinishingPricingType;
  extraDays?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
