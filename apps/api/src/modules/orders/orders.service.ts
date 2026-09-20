import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { DatabaseService } from '../../common/database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private mpClient: MercadoPagoConfig | null = null;
  private memoryOrders: any[] = [];

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {}

  onModuleInit() {
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    if (accessToken) {
      this.mpClient = new MercadoPagoConfig({ accessToken });
      this.logger.log(' Mercado Pago SDK v2 inicializado com sucesso.');
    } else {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado. Pagamentos em modo sandbox/simulado.');
    }
  }

  async createOrder(data: CreateOrderDto) {
    const orderId = `SP-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    let qrCodePix = '';
    let qrCodePixBase64 = '';
    let paymentId = '';
    let mercadoPagoStatus = 'pending';

    // Processamento via Mercado Pago
    if (data.payment.method === 'pix') {
      if (this.mpClient) {
        try {
          const payment = new Payment(this.mpClient);
          const response = await payment.create({
            body: {
              transaction_amount: Number(data.payment.total),
              description: `Pedido ${orderId} - Silk Print Gráfica`,
              payment_method_id: 'pix',
              payer: {
                email: data.customer.email,
                first_name: data.customer.name.split(' ')[0],
                last_name: data.customer.name.split(' ').slice(1).join(' ') || 'Cliente',
                identification: {
                  type: data.customer.document.length > 14 ? 'CNPJ' : 'CPF',
                  number: data.customer.document.replace(/\D/g, ''),
                },
              },
            },
          });

          if (response?.id) {
            paymentId = String(response.id);
            qrCodePix = response.point_of_interaction?.transaction_data?.qr_code || '';
            qrCodePixBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64 || '';
            mercadoPagoStatus = response.status || 'pending';
          }
        } catch (mpErr: any) {
          this.logger.error(`Erro Mercado Pago Pix: ${mpErr?.message}`);
        }
      }

      // Fallback para ambiente de teste se Pix da API não retornar
      if (!qrCodePix) {
        qrCodePix = `00020126580014br.gov.bcb.pix0136pix@silkprint.com.br520400005303986540${Number(data.payment.total).toFixed(2)}5802BR5919SILK PRINT GRAFICA6009SAO PAULO62070503***6304`;
      }
    }

    const newOrder = {
      id: orderId,
      timestamp: now,
      status: 'pendente_pagamento',
      customer: data.customer,
      shipping: data.shipping,
      items: data.items,
      payment: {
        ...data.payment,
        paymentId,
        mercadoPagoStatus,
        qrCodePix,
        qrCodePixBase64,
      },
      couponApplied: data.couponApplied,
      timeline: [
        {
          step: 'Pedido Criado',
          description: 'Aguardando confirmação do pagamento',
          done: true,
          current: true,
          timestamp: now,
        },
        {
          step: 'Pagamento Aprovado',
          description: 'Compensação financeira aprovada',
          done: false,
          timestamp: '',
        },
        {
          step: 'Em Produção',
          description: 'Ordem de serviço em impressão e acabamento',
          done: false,
          timestamp: '',
        },
        {
          step: 'Pronto / Despachado',
          description: 'Disponível no balcão de retirada ou enviado por transportadora',
          done: false,
          timestamp: '',
        },
      ],
    };

    // Salva no PostgreSQL
    if (this.db.isDatabaseConnected()) {
      try {
        await this.db.query(
          `INSERT INTO orders (id, status, customer_name, customer_email, customer_phone, total_amount, payment_method, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newOrder.id,
            newOrder.status,
            newOrder.customer.name,
            newOrder.customer.email,
            newOrder.customer.phone,
            newOrder.payment.total,
            newOrder.payment.method,
            JSON.stringify(newOrder),
            now,
          ],
        );
      } catch (dbErr: any) {
        this.logger.error(`Erro ao gravar pedido no PostgreSQL: ${dbErr?.message}`);
      }
    }

    this.memoryOrders.unshift(newOrder);
    return newOrder;
  }

  async getAllOrders() {
    if (this.db.isDatabaseConnected()) {
      try {
        const res = await this.db.query('SELECT details FROM orders ORDER BY created_at DESC LIMIT 200');
        if (res && res.rows && res.rows.length > 0) {
          return res.rows.map(r => (typeof r.details === 'string' ? JSON.parse(r.details) : r.details));
        }
      } catch (e: any) {
        this.logger.warn(`Erro buscando orders do Postgres: ${e?.message}`);
      }
    }
    return this.memoryOrders;
  }

  async getOrderById(id: string) {
    const orders = await this.getAllOrders();
    return orders.find(o => o.id === id) || null;
  }

  async updateOrderStatus(id: string, status: string, notes?: string) {
    const order = await this.getOrderById(id);
    if (!order) return null;

    order.status = status;
    if (notes) {
      order.productionNotes = notes;
    }

    // Atualiza timeline
    const now = new Date().toISOString();
    const currentStep = order.timeline.find((t: any) => !t.done);
    if (currentStep) {
      currentStep.done = true;
      currentStep.current = false;
      currentStep.timestamp = now;
    }

    if (this.db.isDatabaseConnected()) {
      try {
        await this.db.query('UPDATE orders SET status = $1, details = $2 WHERE id = $3', [
          status,
          JSON.stringify(order),
          id,
        ]);
      } catch (err: any) {
        this.logger.error(`Erro ao atualizar status do pedido no DB: ${err?.message}`);
      }
    }

    return order;
  }
}
