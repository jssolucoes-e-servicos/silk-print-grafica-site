// ============================================================================
// Finishings Service (Acabamentos Gráficos)
// NestJS Controller: @Controller('finishings') ou @Controller('acabamentos')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateFinishingDto,
  UpdateFinishingDto,
  FinishingResponseDto,
} from '../contracts/finishings.dto';

export class FinishingsService {
  /**
   * GET /api/acabamentos
   */
  public async getAll(): Promise<FinishingResponseDto[]> {
    return apiClient.get<FinishingResponseDto[]>('/acabamentos');
  }

  /**
   * GET /api/acabamentos/:id
   */
  public async getById(id: string): Promise<FinishingResponseDto> {
    return apiClient.get<FinishingResponseDto>(`/acabamentos/${id}`);
  }

  /**
   * POST /api/acabamentos
   */
  public async create(data: CreateFinishingDto): Promise<FinishingResponseDto> {
    return apiClient.post<FinishingResponseDto>('/acabamentos', data);
  }

  /**
   * PUT /api/acabamentos/:id
   */
  public async update(id: string, data: UpdateFinishingDto): Promise<FinishingResponseDto> {
    return apiClient.put<FinishingResponseDto>(`/acabamentos/${id}`, data);
  }

  /**
   * DELETE /api/acabamentos/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/acabamentos/${id}`);
    return true;
  }
}

export const finishingsService = new FinishingsService();
