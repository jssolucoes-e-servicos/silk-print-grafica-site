import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);
  private memoryQuotes: any[] = [];

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {}

  async submitQuoteRequest(data: any) {
    const id = `lead_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const quoteRecord = {
      id,
      timestamp,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      materialType: data.materialType,
      quantity: data.quantity,
      dimensions: data.dimensions || '',
      finishing: data.finishing || '',
      message: data.message || '',
      urgency: data.urgency || 'normal',
      status: 'novo',
    };

    // 1. Disparo para o Webhook do n8n (se configurado)
    const n8nWebhookUrl = this.configService.get<string>('N8N_QUOTE_WEBHOOK_URL');
    if (n8nWebhookUrl) {
      try {
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'custom_quote_requested',
            quote: quoteRecord,
            source: 'silkprint-storefront',
          }),
        }).catch(err => this.logger.error(`Erro ao disparar webhook n8n: ${err?.message}`));
      } catch (err: any) {
        this.logger.error(`Falha no webhook n8n: ${err?.message}`);
      }
    }

    // 2. Disparo para a Evolution API (WhatsApp) se configurada
    const evoUrl = this.configService.get<string>('EVOLUTION_API_URL');
    const evoKey = this.configService.get<string>('EVOLUTION_API_KEY');
    const evoInstance = this.configService.get<string>('EVOLUTION_INSTANCE');
    const adminPhone = this.configService.get<string>('ADMIN_WHATSAPP') || '5511999998888';

    if (evoUrl && evoKey && evoInstance) {
      try {
        const textMsg = `🛎️ *NOVO ORÇAMENTO GRÁFICO - SILK PRINT*\n\n` +
          `👤 *Cliente:* ${data.name}\n` +
          `📱 *WhatsApp:* ${data.phone}\n` +
          `📦 *Material:* ${data.materialType}\n` +
          `🔢 *Tiragem:* ${data.quantity}\n` +
          `📐 *Medidas:* ${data.dimensions || 'Padrão'}\n` +
          `✨ *Acabamento:* ${data.finishing || 'Sem acabamento'}\n` +
          `📝 *Detalhes:* ${data.message || 'N/A'}`;

        fetch(`${evoUrl.replace(/\/$/, '')}/message/sendText/${evoInstance}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: evoKey,
          },
          body: JSON.stringify({
            number: adminPhone.replace(/\D/g, ''),
            text: textMsg,
          }),
        }).catch(err => this.logger.warn(`Erro enviando WhatsApp Evolution API: ${err?.message}`));
      } catch (evoErr: any) {
        this.logger.warn(`Evolution API não disparada: ${evoErr?.message}`);
      }
    }

    // 3. Grava no PostgreSQL
    if (this.db.isDatabaseConnected()) {
      try {
        await this.db.query(
          `INSERT INTO quote_leads (id, name, phone, email, material_type, quantity, dimensions, message, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            quoteRecord.id,
            quoteRecord.name,
            quoteRecord.phone,
            quoteRecord.email,
            quoteRecord.materialType,
            quoteRecord.quantity,
            quoteRecord.dimensions,
            quoteRecord.message,
            quoteRecord.status,
            timestamp,
          ],
        );
      } catch (dbErr: any) {
        this.logger.error(`Erro ao salvar orçamento no PostgreSQL: ${dbErr?.message}`);
      }
    }

    this.memoryQuotes.unshift(quoteRecord);
    return quoteRecord;
  }

  async getAll() {
    if (this.db.isDatabaseConnected()) {
      try {
        const res = await this.db.query('SELECT * FROM quote_leads ORDER BY created_at DESC LIMIT 100');
        if (res && Array.isArray(res.rows)) {
          return res.rows.map(r => ({
            id: r.id,
            timestamp: r.created_at,
            name: r.name,
            phone: r.phone,
            email: r.email || '',
            materialType: r.material_type,
            quantity: r.quantity,
            dimensions: r.dimensions || '',
            message: r.message || '',
            status: r.status,
          }));
        }
      } catch (e: any) {
        this.logger.warn(`Erro listando quotes do PostgreSQL: ${e?.message}`);
      }
    }
    return this.memoryQuotes;
  }
}
