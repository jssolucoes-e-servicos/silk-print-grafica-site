import { N8nConfig, N8nEventLog } from '../src/types';

let currentN8nConfig: N8nConfig = {
  baseUrl: process.env.N8N_BASE_URL || '',
  apiKey: process.env.N8N_API_KEY || '',
  webhookOrderCreated: process.env.N8N_WEBHOOK_ORDER_CREATED || '',
  webhookStatusChanged: process.env.N8N_WEBHOOK_STATUS_CHANGED || '',
  webhookQuoteCreated: process.env.N8N_WEBHOOK_QUOTE_CREATED || '',
  webhookFinancialAlert: process.env.N8N_WEBHOOK_FINANCIAL_ALERT || '',
  status: 'disconnected',
  enabledTriggers: {
    orderCreated: true,
    statusChanged: true,
    quoteCreated: true,
    financialAlert: true,
  },
};

const eventLogs: N8nEventLog[] = [];

export function getN8nConfig(): N8nConfig {
  return { ...currentN8nConfig };
}

export function setN8nConfig(newConfig: Partial<N8nConfig>) {
  currentN8nConfig = {
    ...currentN8nConfig,
    ...newConfig,
    enabledTriggers: {
      ...currentN8nConfig.enabledTriggers,
      ...(newConfig.enabledTriggers || {}),
    },
  };
}

export function getN8nEventLogs(): N8nEventLog[] {
  return [...eventLogs];
}

/**
 * Test n8n instance connection or webhook url
 */
export async function testN8nConnection(targetUrl?: string, apiKey?: string): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
  httpStatus?: number;
}> {
  const urlToTest = (targetUrl || currentN8nConfig.baseUrl || '').trim();
  const token = apiKey || currentN8nConfig.apiKey || '';

  if (!urlToTest) {
    return {
      success: false,
      message: 'Informe a URL do n8n ou o Webhook de teste.',
      latencyMs: 0,
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SilkPrint-ERP/1.0',
    };

    if (token) {
      headers['X-N8N-API-KEY'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(urlToTest, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        source: 'Silk Print ERP Gráfica',
        payload: {
          status: 'online',
          message: 'Teste de conexão efetuado com sucesso via Silk Print ERP!',
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    const logEntry: N8nEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'manual.test',
      targetUrl: urlToTest,
      payload: { event: 'test_connection' },
      status: response.ok ? 'success' : 'failed',
      httpStatus: response.status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    eventLogs.unshift(logEntry);
    if (eventLogs.length > 50) eventLogs.pop();

    if (response.ok) {
      currentN8nConfig.status = 'connected';
      currentN8nConfig.lastChecked = new Date().toISOString();
      return {
        success: true,
        message: `Webhook n8n acionado e respondido com sucesso (HTTP ${response.status}) em ${latencyMs}ms!`,
        latencyMs,
        httpStatus: response.status,
      };
    } else {
      return {
        success: false,
        message: `Servidor n8n respondeu com erro HTTP ${response.status}. Verifique se o fluxo do Webhook está ativo.`,
        latencyMs,
        httpStatus: response.status,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    currentN8nConfig.status = 'error';

    let errorMsg = `Erro ao acionar n8n: ${err.message || 'Falha de rede'}`;
    if (err.name === 'AbortError') {
      errorMsg = 'Tempo limite esgotado (10s) ao conectar no n8n. Verifique se o servidor está acessível.';
    } else if (err.code === 'ECONNREFUSED') {
      errorMsg = 'Conexão recusada no n8n. Verifique o host e a porta.';
    }

    return {
      success: false,
      message: errorMsg,
      latencyMs,
    };
  }
}

/**
 * Dispatch an automated event to n8n webhook
 */
export async function dispatchN8nEvent(
  eventType: 'order.created' | 'order.status_changed' | 'quote.created' | 'financial.alert',
  payload: any
): Promise<{ success: boolean; message: string; httpStatus?: number }> {
  // Determine webhook URL based on event type
  let webhookUrl = '';

  if (eventType === 'order.created' && currentN8nConfig.enabledTriggers.orderCreated) {
    webhookUrl = currentN8nConfig.webhookOrderCreated || '';
  } else if (eventType === 'order.status_changed' && currentN8nConfig.enabledTriggers.statusChanged) {
    webhookUrl = currentN8nConfig.webhookStatusChanged || '';
  } else if (eventType === 'quote.created' && currentN8nConfig.enabledTriggers.quoteCreated) {
    webhookUrl = currentN8nConfig.webhookQuoteCreated || '';
  } else if (eventType === 'financial.alert' && currentN8nConfig.enabledTriggers.financialAlert) {
    webhookUrl = currentN8nConfig.webhookFinancialAlert || '';
  }

  // Fallback to baseUrl if general webhook
  if (!webhookUrl && currentN8nConfig.baseUrl) {
    webhookUrl = currentN8nConfig.baseUrl;
  }

  if (!webhookUrl) {
    return {
      success: false,
      message: `Nenhum webhook configurado para o evento "${eventType}".`,
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SilkPrint-ERP/1.0',
    };
    if (currentN8nConfig.apiKey) {
      headers['X-N8N-API-KEY'] = currentN8nConfig.apiKey;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: eventType,
        source: 'Silk Print ERP',
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    const logEntry: N8nEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      targetUrl: webhookUrl,
      payload,
      status: res.ok ? 'success' : 'failed',
      httpStatus: res.status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    eventLogs.unshift(logEntry);
    if (eventLogs.length > 50) eventLogs.pop();

    return {
      success: res.ok,
      message: res.ok
        ? `Evento ${eventType} enviado com sucesso ao n8n (HTTP ${res.status}).`
        : `Erro ${res.status} ao disparar evento no n8n.`,
      httpStatus: res.status,
    };
  } catch (err: any) {
    console.error(`[n8n Dispatch Error] ${eventType}:`, err);
    return {
      success: false,
      message: `Falha ao disparar evento para n8n: ${err.message}`,
    };
  }
}
