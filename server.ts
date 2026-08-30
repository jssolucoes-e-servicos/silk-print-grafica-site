import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage for leads / quotes log (persists during process lifetime)
interface QuoteLead {
  id: string;
  timestamp: string;
  source: string;
  channel: 'whatsapp' | 'email';
  name: string;
  phone: string;
  email?: string;
  description: string;
  adminEmailNotified: string;
  adminPhoneNotified: string;
  n8nWebhookStatus: 'dispatched' | 'skipped_no_url' | 'failed';
  emailDeliveryStatus: 'sent_resend' | 'logged_fallback';
  details?: Record<string, unknown>;
}

const leadsLog: QuoteLead[] = [];

// Helper to send transactional email if RESEND_API_KEY is configured
async function sendAdminNotificationEmail(lead: QuoteLead): Promise<'sent_resend' | 'logged_fallback'> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@silkprintgrafica.com.br';
  const apiKey = process.env.RESEND_API_KEY;

  const subject = lead.channel === 'whatsapp'
    ? `🚨 [NOVO CONTATO WHATSAPP] Solicitação de Orçamento - ${lead.name}`
    : `📩 [NOVO ORÇAMENTO POR E-MAIL] Solicitação Recebida - ${lead.name}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
      <div style="border-bottom: 2px solid #00a0e9; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #00a0e9; margin: 0; font-size: 22px;">SILK PRINT GRÁFICA</h2>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Alerta de Pedido de Orçamento • Sistema Automático</p>
      </div>

      <div style="background: #1e293b; padding: 18px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid ${lead.channel === 'whatsapp' ? '#10b981' : '#00a0e9'};">
        <p style="margin: 0 0 8px; font-weight: bold; font-size: 15px; color: #38bdf8;">
          Canal Solicitado: <span style="text-transform: uppercase; color: #fff;">${lead.channel}</span>
        </p>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>👤 Nome do Cliente:</strong> ${lead.name}</p>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>📱 WhatsApp / Telefone:</strong> <a href="https://wa.me/${lead.phone.replace(/\D/g, '')}" style="color: #34d399; text-decoration: none;">${lead.phone}</a></p>
        ${lead.email ? `<p style="margin: 0 0 6px; font-size: 14px;"><strong>✉️ E-mail:</strong> <a href="mailto:${lead.email}" style="color: #38bdf8; text-decoration: none;">${lead.email}</a></p>` : ''}
        <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>📍 Origem:</strong> ${lead.source}</p>
      </div>

      <div style="background: #1e293b; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
        <h4 style="color: #f1f5f9; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">📝 O que o cliente deseja orçar:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; background: #0f172a; padding: 12px; border-radius: 8px;">${lead.description}</p>
      </div>

      <div style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 16px;">
        <p style="margin: 0;">Lead ID: <code>${lead.id}</code> • Recebido em: ${new Date(lead.timestamp).toLocaleString('pt-BR')}</p>
        <p style="margin: 4px 0 0;">Encaminhado para a automação n8n para registro em planilha Google Sheets.</p>
      </div>
    </div>
  `;

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Silk Print Gráfica <orcamentos@silkprintgrafica.com.br>',
          to: [adminEmail],
          subject: subject,
          html: emailHtml
        })
      });

      if (response.ok) {
        console.log(`[Email] Notification sent successfully via Resend to ${adminEmail}`);
        return 'sent_resend';
      } else {
        const errorText = await response.text();
        console.warn(`[Email] Resend API response error: ${errorText}`);
      }
    } catch (err) {
      console.error('[Email] Failed to send notification email via Resend:', err);
    }
  }

  // Fallback logging
  console.log(`[Email Notification Log] To: ${adminEmail} | Subject: ${subject}`);
  return 'logged_fallback';
}

// Helper to trigger n8n Webhook for Evolution API WhatsApp alert & Google Sheets / Database recording
async function triggerN8nWebhook(lead: QuoteLead): Promise<'dispatched' | 'skipped_no_url' | 'failed'> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://main-n8n.qgymrf.easypanel.host/webhook/evolution-webhook-proxy';
  if (!webhookUrl || webhookUrl.includes('seuservidor.com')) {
    console.log(`[n8n Automation] N8N_WEBHOOK_URL not configured. Skipping webhook post.`);
    return 'skipped_no_url';
  }

  const evoInstance = process.env.EVOLUTION_INSTANCE || 'silkprint';
  const evoToken = process.env.EVOLUTION_TOKEN || 'sua-chave-evolution';
  const adminPhoneClean = (process.env.ADMIN_PHONE || '5511999998888').replace(/\D/g, '');

  const waAlertMessage = `🚨 *[NOVO ORÇAMENTO SILK PRINT]*\n\n` +
    `📌 *Canal:* ${lead.channel === 'whatsapp' ? '💬 WhatsApp' : '✉️ E-mail'}\n` +
    `👤 *Cliente:* ${lead.name}\n` +
    `📱 *WhatsApp:* ${lead.phone}\n` +
    (lead.email ? `✉️ *E-mail:* ${lead.email}\n` : '') +
    `📍 *Origem:* ${lead.source}\n\n` +
    `📝 *O que deseja orçar:*\n${lead.description}\n\n` +
    `🆔 *ID:* ${lead.id}\n` +
    `⏰ *Data/Hora:* ${new Date(lead.timestamp).toLocaleString('pt-BR')}`;

  try {
    // Structured body formatted for the EvolutionAPI n8n Switch & HTTP Request nodes,
    // plus complete data keys for Google Sheets and Database insertion nodes
    const payload = {
      evoInstance,
      evoToken,
      data: {
        messageType: 'TEXT',
        phone: adminPhoneClean,
        message: waAlertMessage,
        leadId: lead.id,
        timestamp: lead.timestamp,
        formattedDate: new Date(lead.timestamp).toLocaleString('pt-BR'),
        channel: lead.channel,
        source: lead.source,
        clientName: lead.name,
        clientPhone: lead.phone,
        clientEmail: lead.email || '',
        description: lead.description,
        adminEmail: lead.adminEmailNotified,
        adminPhone: lead.adminPhoneNotified,
        status: 'Pendente'
      },
      client: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        description: lead.description
      },
      leadId: lead.id,
      timestamp: lead.timestamp,
      channel: lead.channel,
      source: lead.source
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SilkPrint-Evolution-Proxy/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[n8n Evolution] Webhook successfully dispatched to ${webhookUrl}`);
      return 'dispatched';
    } else {
      console.warn(`[n8n Evolution] Webhook responded with status: ${res.status}`);
      return 'failed';
    }
  } catch (err) {
    console.error('[n8n Evolution] Error dispatching webhook to n8n:', err);
    return 'failed';
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check and system configuration summary
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Silk Print Gráfica Full-Stack API',
    timestamp: new Date().toISOString(),
    adminConfig: {
      adminEmail: process.env.ADMIN_EMAIL || 'admin@silkprintgrafica.com.br',
      adminPhone: process.env.ADMIN_PHONE || '5511999998888',
      n8nWebhookConfigured: Boolean(process.env.N8N_WEBHOOK_URL && !process.env.N8N_WEBHOOK_URL.includes('seuservidor.com')),
      resendConfigured: Boolean(process.env.RESEND_API_KEY)
    },
    totalLeadsReceived: leadsLog.length
  });
});

// Endpoint to receive quotes (WhatsApp or Email)
app.post('/api/quote', async (req, res) => {
  try {
    const { name, phone, email, description, channel = 'whatsapp', source = 'Página de Manutenção' } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'O nome é obrigatório.' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ error: 'O telefone/WhatsApp é obrigatório.' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'A descrição do que deseja orçar é obrigatória.' });
    }

    if (channel === 'email' && (!email || !email.trim())) {
      return res.status(400).json({ error: 'O e-mail é obrigatório para envio por e-mail.' });
    }

    const lead: QuoteLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      source,
      channel: channel === 'email' ? 'email' : 'whatsapp',
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      description: description.trim(),
      adminEmailNotified: process.env.ADMIN_EMAIL || 'admin@silkprintgrafica.com.br',
      adminPhoneNotified: process.env.ADMIN_PHONE || '5511999998888',
      n8nWebhookStatus: 'skipped_no_url',
      emailDeliveryStatus: 'logged_fallback'
    };

    // 1. Dispatch Email notification to Admin (and to client if applicable)
    lead.emailDeliveryStatus = await sendAdminNotificationEmail(lead);

    // 2. Dispatch to n8n Automation Webhook (for Google Sheets & automations)
    lead.n8nWebhookStatus = await triggerN8nWebhook(lead);

    // 3. Store lead in history
    leadsLog.unshift(lead);
    if (leadsLog.length > 200) leadsLog.pop();

    console.log(`[Quote Received] ID: ${lead.id} | Channel: ${lead.channel} | Client: ${lead.name} | Webhook: ${lead.n8nWebhookStatus} | Email: ${lead.emailDeliveryStatus}`);

    // Return response with formatted WhatsApp URL and status
    const targetWhatsAppNumber = process.env.VITE_WHATSAPP_NUMBER || '5511999998888';
    const waMessageText = `*SOLICITAÇÃO DE ORÇAMENTO - SILK PRINT GRÁFICA*\n\n` +
      `👤 *Cliente:* ${lead.name}\n` +
      `📱 *WhatsApp:* ${lead.phone}\n` +
      (lead.email ? `✉️ *E-mail:* ${lead.email}\n` : '') +
      `📝 *O que desejo orçar:*\n${lead.description}\n\n` +
      `_Enviado via ${lead.source}_`;

    const whatsappRedirectUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(waMessageText)}`;

    return res.status(201).json({
      success: true,
      message: lead.channel === 'whatsapp' 
        ? 'Solicitação registrada e alerta enviado à equipe! Redirecionando para o WhatsApp...'
        : 'Orçamento recebido com sucesso! Nossa equipe entrará em contato por e-mail.',
      leadId: lead.id,
      channel: lead.channel,
      whatsappUrl: whatsappRedirectUrl,
      adminNotified: {
        email: lead.adminEmailNotified,
        phone: lead.adminPhoneNotified,
        emailDelivery: lead.emailDeliveryStatus,
        n8nWebhook: lead.n8nWebhookStatus
      }
    });

  } catch (error) {
    console.error('Error processing quote request:', error);
    return res.status(500).json({ error: 'Erro interno ao processar orçamento. Tente novamente.' });
  }
});

// Endpoint to query recent leads / quotes
app.get('/api/quotes', (req, res) => {
  res.json({
    total: leadsLog.length,
    leads: leadsLog
  });
});

// -------------------------------------------------------------
// Development / Production Vite Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Silk Print Gráfica server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
