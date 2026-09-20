// ============================================================================
// DTOs & Contracts: Integrations (WhatsApp, n8n, Webhooks)
// NestJS Controller: @Controller('integrations')
// ============================================================================

export interface SendWhatsAppMessageDto {
  phone: string; // Ex: 5511999999999
  message: string;
  mediaUrl?: string;
  caption?: string;
  orderCode?: string;
  quoteNumber?: string;
}

export interface WhatsAppStatusResponseDto {
  status: 'connected' | 'disconnected' | 'connecting' | 'qrcode' | 'error';
  instanceName: string;
  phoneNumber?: string;
  profileName?: string;
  profilePicUrl?: string;
  qrcode?: string;
}

export interface N8nWebhookTriggerDto {
  event: 'order.created' | 'order.status_changed' | 'quote.created' | 'financial.alert' | 'manual.test';
  payload: Record<string, any>;
}

export interface N8nEventLogResponseDto {
  id: string;
  eventType: string;
  targetUrl: string;
  payload: any;
  status: 'success' | 'failed' | 'pending';
  httpStatus?: number;
  response?: string;
  timestamp: string;
}
