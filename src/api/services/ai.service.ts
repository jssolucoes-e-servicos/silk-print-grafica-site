// ============================================================================
// AI Service (Inteligência Artificial Gemini / Assistente de Orçamentos)
// NestJS Controller: @Controller('ai')
// ============================================================================

import { apiClient } from '../client';
import {
  GenerateProductDescriptionDto,
  GenerateProductDescriptionResponseDto,
  AnalyzeBudgetDto,
  AnalyzeBudgetResponseDto,
} from '../contracts/ai.dto';

export class AIService {
  /**
   * POST /api/ai/products/generate-description
   */
  public async generateProductDescription(
    data: GenerateProductDescriptionDto
  ): Promise<GenerateProductDescriptionResponseDto> {
    return apiClient.post<GenerateProductDescriptionResponseDto>('/ai/products/generate-description', data);
  }

  /**
   * POST /api/ai/quotes/analyze
   */
  public async analyzeBudget(data: AnalyzeBudgetDto): Promise<AnalyzeBudgetResponseDto> {
    return apiClient.post<AnalyzeBudgetResponseDto>('/ai/quotes/analyze', data);
  }
}

export const aiService = new AIService();
