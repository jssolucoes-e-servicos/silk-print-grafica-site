// ============================================================================
// DTOs & Contracts: AI & Smart Services (Gemini / Generative AI)
// NestJS Controller: @Controller('ai')
// ============================================================================

export interface GenerateProductDescriptionDto {
  productName: string;
  category: string;
  material?: string;
  targetAudience?: string;
  tone?: 'comercial' | 'tecnico' | 'criativo' | 'direto';
}

export interface GenerateProductDescriptionResponseDto {
  title: string;
  shortDescription: string;
  fullDescription: string;
  suggestedTags: string[];
  sellingPoints: string[];
}

export interface AnalyzeBudgetDto {
  items: {
    name: string;
    quantity: number;
    width?: number;
    height?: number;
    material?: string;
    unitPrice: number;
  }[];
  customerProfile?: string;
  urgency?: 'baixa' | 'media' | 'alta';
}

export interface AnalyzeBudgetResponseDto {
  profitabilityScore: number; // 0-100
  suggestedDiscountMax: number; // %
  upsellSuggestions: string[];
  productionRiskNotes: string[];
}
