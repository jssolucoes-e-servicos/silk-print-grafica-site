// ============================================================================
// Clients Service (Clientes)
// NestJS Controller: @Controller('clients') ou @Controller('clientes')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
  ClientResponseDto,
  ClientStatsDto,
} from '../contracts/clients.dto';
import { OrderResponseDto } from '../contracts/orders.dto';

export class ClientsService {
  /**
   * GET /api/clientes (ou /api/clients)
   */
  public async getAll(query?: ClientQueryDto): Promise<ClientResponseDto[]> {
    return apiClient.get<ClientResponseDto[]>('/clientes', query);
  }

  /**
   * GET /api/clientes/:id
   */
  public async getById(id: string): Promise<ClientResponseDto> {
    return apiClient.get<ClientResponseDto>(`/clientes/${id}`);
  }

  /**
   * POST /api/clientes
   */
  public async create(data: CreateClientDto): Promise<ClientResponseDto> {
    return apiClient.post<ClientResponseDto>('/clientes', data);
  }

  /**
   * PUT /api/clientes/:id
   */
  public async update(id: string, data: UpdateClientDto): Promise<ClientResponseDto> {
    return apiClient.put<ClientResponseDto>(`/clientes/${id}`, data);
  }

  /**
   * DELETE /api/clientes/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/clientes/${id}`);
    return true;
  }

  /**
   * GET /api/clientes/:id/orders
   */
  public async getClientOrders(id: string): Promise<OrderResponseDto[]> {
    return apiClient.get<OrderResponseDto[]>(`/clientes/${id}/orders`);
  }

  /**
   * GET /api/clientes/stats/summary
   */
  public async getStats(): Promise<ClientStatsDto> {
    return apiClient.get<ClientStatsDto>('/clientes/stats/summary');
  }
}

export const clientsService = new ClientsService();
