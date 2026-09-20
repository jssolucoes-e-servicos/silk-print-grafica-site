// ============================================================================
// DTOs & Contracts: Orders & Production (Ordens de Serviço & Pedidos)
// NestJS Controller: @Controller('orders') ou @Controller('pedidos')
// ============================================================================

import { QuoteItemDto } from './quotes.dto';

export type OrderStatus =
  | 'criando_arte'
  | 'em_aberto'
  | 'em_producao'
  | 'aguardando_retirada'
  | 'em_transporte'
  | 'entregue'
  | 'aguardando_pagamento'
  | 'cancelado';

export type PaymentStatus = 'pago' | 'pendente' | 'parcial';

export interface OrderMessageDto {
  id?: string;
  sender: 'grafica' | 'cliente' | 'sistema';
  text: string;
  timestamp?: string;
}

export interface CreateOrderDto {
  clientId: string;
  code?: string;
  clientName: string;
  clientWhatsapp: string;
  clientCpf?: string;
  clientEmail?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  description: string;
  items?: QuoteItemDto[];
  itemsCount: number;
  total: number;
  paidAmount?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  pixKey?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  deliveryDate: string;
  notes?: string;
  isOnlineOrder?: boolean;
}

export interface UpdateOrderDto {
  code?: string;
  clientName?: string;
  clientWhatsapp?: string;
  clientCpf?: string;
  clientEmail?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  description?: string;
  items?: QuoteItemDto[];
  itemsCount?: number;
  total?: number;
  paidAmount?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  pixKey?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
  notifyCustomerWhatsApp?: boolean;
}

export interface UpdateOrderPaymentDto {
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  paymentMethod?: string;
  generateTransaction?: boolean;
}

export interface AddOrderMessageDto {
  sender: 'grafica' | 'cliente' | 'sistema';
  text: string;
}

export interface OrderQueryDto {
  search?: string;
  clientId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  isOnlineOrder?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'deliveryDate' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderResponseDto {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  clientCpf?: string;
  clientEmail?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  description: string;
  items?: QuoteItemDto[];
  itemsCount: number;
  total: number;
  paidAmount?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  pixKey?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  deliveryDate: string;
  notes?: string;
  isOnlineOrder?: boolean;
  messages?: OrderMessageDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatsDto {
  totalOrders: number;
  inProduction: number;
  awaitingPickupOrDelivery: number;
  completedThisMonth: number;
  totalRevenue: number;
  pendingPaymentAmount: number;
}
