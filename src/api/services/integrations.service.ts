// ============================================================================
// Integrations Service (WhatsApp, n8n, Webhooks)
// NestJS Controller: @Controller('integrations')
// ============================================================================

import { apiClient } from '../client';
import {
  SendWhatsAppMessageDto,
  WhatsAppStatusResponseDto,
  N8nWebhookTriggerDto,
  N8nEventLogResponseDto,
} from '../contracts/integrations.dto';

export class IntegrationsService {
  /**
   * GET /api/integrations/whatsapp/status
   */
  public async getWhatsAppStatus(): Promise<WhatsAppStatusResponseDto> {
    return apiClient.get<WhatsAppStatusResponseDto>('/integrations/whatsapp/status');
  }

  /**
   * POST /api/integrations/whatsapp/send
   */
  public async sendWhatsAppMessage(data: SendWhatsAppMessageDto): Promise<{ success: boolean; messageId?: string }> {
    return apiClient.post<{ success: boolean; messageId?: string }>('/integrations/whatsapp/send', data);
  }

  /**
   * GET /api/integrations/n8n/logs
   */
  public async getN8nLogs(): Promise<N8nEventLogResponseDto[]> {
    return apiClient.get<N8nEventLogResponseDto[]>('/integrations/n8n/logs');
  }

  /**
   * POST /api/integrations/n8n/trigger
   */
  public async triggerN8nWebhook(data: N8nWebhookTriggerDto): Promise<{ success: boolean; data?: any }> {
    return apiClient.post<{ success: boolean; data?: any }>('/integrations/n8n/trigger', data);
  }
}

export const integrationsService = new IntegrationsService();
