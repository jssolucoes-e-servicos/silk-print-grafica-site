// ============================================================================
// Quotes Service (Orçamentos)
// NestJS Controller: @Controller('quotes') ou @Controller('orcamentos')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
  QuoteResponseDto,
  ConvertQuoteToOrderDto,
} from '../contracts/quotes.dto';
import { OrderResponseDto } from '../contracts/orders.dto';

export class QuotesService {
  /**
   * GET /api/orcamentos
   */
  public async getAll(query?: QuoteQueryDto): Promise<QuoteResponseDto[]> {
    return apiClient.get<QuoteResponseDto[]>('/orcamentos', query);
  }

  /**
   * GET /api/orcamentos/:id
   */
  public async getById(id: string): Promise<QuoteResponseDto> {
    return apiClient.get<QuoteResponseDto>(`/orcamentos/${id}`);
  }

  /**
   * POST /api/orcamentos
   */
  public async create(data: CreateQuoteDto): Promise<QuoteResponseDto> {
    return apiClient.post<QuoteResponseDto>('/orcamentos', data);
  }

  /**
   * PUT /api/orcamentos/:id
   */
  public async update(id: string, data: UpdateQuoteDto): Promise<QuoteResponseDto> {
    return apiClient.put<QuoteResponseDto>(`/orcamentos/${id}`, data);
  }

  /**
   * DELETE /api/orcamentos/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/orcamentos/${id}`);
    return true;
  }

  /**
   * POST /api/orcamentos/:id/convert
   * Converte orçamento aprovado em Pedido/Ordem de Produção
   */
  public async convertToOrder(
    id: string,
    data?: ConvertQuoteToOrderDto
  ): Promise<OrderResponseDto> {
    return apiClient.post<OrderResponseDto>(`/orcamentos/${id}/convert`, data || {});
  }

  /**
   * POST /api/orcamentos/:id/duplicate
   */
  public async duplicate(id: string): Promise<QuoteResponseDto> {
    return apiClient.post<QuoteResponseDto>(`/orcamentos/${id}/duplicate`);
  }
}

export const quotesService = new QuotesService();
