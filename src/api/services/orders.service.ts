// ============================================================================
// Orders Service (Pedidos e Gestão de Produção)
// NestJS Controller: @Controller('orders') ou @Controller('pedidos')
// ============================================================================

import { apiClient } from '../client';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderPaymentDto,
  AddOrderMessageDto,
  OrderQueryDto,
  OrderResponseDto,
  OrderStatsDto,
  OrderStatus,
} from '../contracts/orders.dto';

export class OrdersService {
  /**
   * GET /api/pedidos
   */
  public async getAll(query?: OrderQueryDto): Promise<OrderResponseDto[]> {
    return apiClient.get<OrderResponseDto[]>('/pedidos', query);
  }

  /**
   * GET /api/pedidos/:id
   */
  public async getById(id: string): Promise<OrderResponseDto> {
    return apiClient.get<OrderResponseDto>(`/pedidos/${id}`);
  }

  /**
   * POST /api/pedidos
   */
  public async create(data: CreateOrderDto): Promise<OrderResponseDto> {
    return apiClient.post<OrderResponseDto>('/pedidos', data);
  }

  /**
   * PUT /api/pedidos/:id
   */
  public async update(id: string, data: UpdateOrderDto): Promise<OrderResponseDto> {
    return apiClient.put<OrderResponseDto>(`/pedidos/${id}`, data);
  }

  /**
   * DELETE /api/pedidos/:id
   */
  public async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/pedidos/${id}`);
    return true;
  }

  /**
   * PUT /api/pedidos/:id/status
   */
  public async updateStatus(
    id: string,
    status: OrderStatus,
    notes?: string,
    notifyCustomer = false
  ): Promise<OrderResponseDto> {
    const payload: UpdateOrderStatusDto = { status, notes, notifyCustomerWhatsApp: notifyCustomer };
    return apiClient.put<OrderResponseDto>(`/pedidos/${id}/status`, payload);
  }

  /**
   * PUT /api/pedidos/:id/pagamento
   */
  public async updatePayment(
    id: string,
    data: UpdateOrderPaymentDto
  ): Promise<OrderResponseDto> {
    return apiClient.put<OrderResponseDto>(`/pedidos/${id}/pagamento`, data);
  }

  /**
   * POST /api/pedidos/:id/mensagens
   */
  public async addMessage(
    id: string,
    message: AddOrderMessageDto
  ): Promise<OrderResponseDto> {
    return apiClient.post<OrderResponseDto>(`/pedidos/${id}/mensagens`, message);
  }

  /**
   * GET /api/pedidos/stats/summary
   */
  public async getStats(): Promise<OrderStatsDto> {
    return apiClient.get<OrderStatsDto>('/pedidos/stats/summary');
  }
}

export const ordersService = new OrdersService();
