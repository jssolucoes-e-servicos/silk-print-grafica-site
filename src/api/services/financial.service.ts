// ============================================================================
// Financial Service (Transações, Caixa & DRE)
// NestJS Controller: @Controller('financial') ou @Controller('financeiro')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
  TransactionResponseDto,
  FinancialSummaryDto,
  DREResponseDto,
} from '../contracts/financial.dto';

export class FinancialService {
  /**
   * GET /api/transacoes (ou /api/financial)
   */
  public async getAll(query?: TransactionQueryDto): Promise<TransactionResponseDto[]> {
    return apiClient.get<TransactionResponseDto[]>('/transacoes', query);
  }

  /**
   * GET /api/transacoes/:id
   */
  public async getById(id: string): Promise<TransactionResponseDto> {
    return apiClient.get<TransactionResponseDto>(`/transacoes/${id}`);
  }

  /**
   * POST /api/transacoes
   */
  public async create(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    return apiClient.post<TransactionResponseDto>('/transacoes', data);
  }

  /**
   * PUT /api/transacoes/:id
   */
  public async update(id: string, data: UpdateTransactionDto): Promise<TransactionResponseDto> {
    return apiClient.put<TransactionResponseDto>(`/transacoes/${id}`, data);
  }

  /**
   * DELETE /api/transacoes/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/transacoes/${id}`);
    return true;
  }

  /**
   * GET /api/transacoes/summary/overview
   */
  public async getSummary(startDate?: string, endDate?: string): Promise<FinancialSummaryDto> {
    return apiClient.get<FinancialSummaryDto>('/transacoes/summary/overview', { startDate, endDate });
  }

  /**
   * GET /api/transacoes/reports/dre
   */
  public async getDRE(year?: number, month?: number): Promise<DREResponseDto> {
    return apiClient.get<DREResponseDto>('/transacoes/reports/dre', { year, month });
  }
}

export const financialService = new FinancialService();
