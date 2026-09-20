import { Order, QuoteLead } from '../types';

/**
 * Triggers n8n workflow for orders or quote leads to send Evolution API WhatsApp message
 */
export async function triggerN8nWebhook(event: 'new_order' | 'order_paid' | 'status_updated' | 'new_lead', payload: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[n8n] Webhook URL not configured. Event "${event}" logged locally.`);
    return { status: 'skipped_no_url' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SilkPrint-App/2.0'
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        evolution: {
          instance: process.env.WHATSAPP_NOTIFICATION_INSTANCE || process.env.EVOLUTION_INSTANCE || 'smartChurches',
          token: process.env.WHATSAPP_NOTIFICATION_TOKEN || process.env.EVOLUTION_TOKEN || '',
          adminPhone: process.env.ADMIN_PHONE || '5551936187210',
        },
        data: payload
      })
    });

    if (!response.ok) {
      console.warn(`[n8n] Webhook responded with status: ${response.status}`);
      return { status: 'failed', statusCode: response.status };
    }

    console.log(`[n8n] Successfully triggered event "${event}" to ${webhookUrl}`);
    return { status: 'dispatched' };
  } catch (error) {
    console.error(`[n8n] Error triggering webhook for event "${event}":`, error);
    return { status: 'failed', error: String(error) };
  }
}
