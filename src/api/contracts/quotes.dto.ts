// ============================================================================
// DTOs & Contracts: Quotes & Budgets (Orçamentos)
// NestJS Controller: @Controller('quotes') ou @Controller('orcamentos')
// ============================================================================

export type QuoteStatus = 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'convertido';

export interface QuoteItemDto {
  id?: string;
  name: string;
  description?: string;
  sourceTab: 'catalogo' | 'internos' | 'm2' | 'personalizado';
  pricingType: 'unidade' | 'm2' | 'milheiro' | 'pacote' | 'hora';
  width?: number;
  height?: number;
  finishings?: string[];
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateQuoteDto {
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  items: QuoteItemDto[];
  observations?: string;
  validityDate?: string;
  validUntil?: string;
  subtotal: number;
  discount?: number;
  total: number;
  status?: QuoteStatus;
}

export interface UpdateQuoteDto {
  clientId?: string;
  clientName?: string;
  clientWhatsapp?: string;
  items?: QuoteItemDto[];
  observations?: string;
  validityDate?: string;
  validUntil?: string;
  subtotal?: number;
  discount?: number;
  total?: number;
  status?: QuoteStatus;
}

export interface ConvertQuoteToOrderDto {
  deliveryDate?: string;
  paymentMethod?: string;
  paidAmount?: number;
  shippingCarrier?: string;
  notes?: string;
}

export interface QuoteQueryDto {
  search?: string;
  clientId?: string;
  status?: QuoteStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface QuoteResponseDto {
  id: string;
  number?: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  items: QuoteItemDto[];
  observations?: string;
  validityDate?: string;
  validUntil?: string;
  subtotal: number;
  discount?: number;
  total: number;
  status: QuoteStatus;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}
