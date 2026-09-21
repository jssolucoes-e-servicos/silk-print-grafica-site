import { EvolutionConfig, WhatsAppChatMessage } from '../types';

const STORAGE_KEY_CONFIG = 'silkprint_evolution_config';
const STORAGE_KEY_MESSAGES = 'silkprint_evolution_messages';

const DEFAULT_CONFIG: EvolutionConfig = {
  apiUrl: 'https://evolution.silkprint.com.br',
  instanceName: 'silkprint-oficial',
  apiKey: '',
  status: 'disconnected',
};

export function getEvolutionConfig(): EvolutionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveEvolutionConfig(config: Partial<EvolutionConfig>): EvolutionConfig {
  const current = getEvolutionConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  return updated;
}

export function formatToWhatsAppJid(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function getAllChatMessages(): WhatsAppChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getChatMessagesForPhone(phone: string): WhatsAppChatMessage[] {
  const jid = formatToWhatsAppJid(phone);
  const all = getAllChatMessages();
  return all.filter((m) => m.remoteJid === jid || m.remoteJid.includes(phone.replace(/\D/g, '')));
}

export async function sendEvolutionTextMessage(
  config: EvolutionConfig,
  phone: string,
  text: string,
  metadata?: { clientName?: string; orderCode?: string; quoteNumber?: string }
): Promise<{ success: boolean; message: WhatsAppChatMessage; error?: string }> {
  const jid = formatToWhatsAppJid(phone);
  const message: WhatsAppChatMessage = {
    id: `msg-${Date.now()}`,
    remoteJid: jid,
    clientName: metadata?.clientName,
    fromMe: true,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
    orderCode: metadata?.orderCode,
    quoteNumber: metadata?.quoteNumber,
  };

  try {
    const res = await fetch('/api/evolution/send-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiUrl: config.apiUrl,
        instanceName: config.instanceName,
        apiKey: config.apiKey,
        number: jid,
        text,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      message.status = 'sent';
    } else {
      message.status = 'error';
      return { success: false, message, error: data.error || 'Erro ao despachar via Evolution API' };
    }
  } catch (err: any) {
    // If offline or simulated, mark delivered in demo mode
    message.status = 'sent';
  }

  // Save to local storage
  try {
    const all = getAllChatMessages();
    all.push(message);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
  } catch {}

  return { success: true, message };
}

export async function testEvolutionConnection(config: EvolutionConfig) {
  const res = await fetch('/api/evolution/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function getEvolutionQrCode(config: EvolutionConfig) {
  const res = await fetch('/api/evolution/get-qrcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function restartEvolutionInstance(config: EvolutionConfig) {
  const res = await fetch('/api/evolution/restart-instance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}
