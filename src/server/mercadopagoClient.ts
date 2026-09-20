import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

let mpClient: MercadoPagoConfig | null = null;
let paymentInstance: Payment | null = null;
let preferenceInstance: Preference | null = null;

export function getMercadoPago(): { payment: Payment; preference: Preference } | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  try {
    if (!mpClient) {
      mpClient = new MercadoPagoConfig({ accessToken: token });
      paymentInstance = new Payment(mpClient);
      preferenceInstance = new Preference(mpClient);
    }
    return {
      payment: paymentInstance!,
      preference: preferenceInstance!,
    };
  } catch (err) {
    console.error('[MercadoPago] Error initializing Mercado Pago SDK:', err);
    return null;
  }
}

/**
 * Creates a real dynamic PIX payment with immediate status check via Mercado Pago
 */
export async function createMercadoPagoPixPayment(params: {
  orderId: string;
  amount: number;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification?: {
      type: 'CPF' | 'CNPJ';
      number: string;
    };
  };
}) {
  const mp = getMercadoPago();
  if (!mp) {
    return null;
  }

  try {
    const cleanDoc = params.payer.identification?.number?.replace(/\D/g, '') || '11111111111';
    const isCnpj = cleanDoc.length > 11;

    const response = await mp.payment.create({
      body: {
        transaction_amount: Number(params.amount.toFixed(2)),
        description: params.description,
        payment_method_id: 'pix',
        payer: {
          email: params.payer.email || 'cliente@silkprintgrafica.com.br',
          first_name: params.payer.first_name || 'Cliente',
          last_name: params.payer.last_name || 'Silk Print',
          identification: {
            type: isCnpj ? 'CNPJ' : 'CPF',
            number: cleanDoc,
          },
        },
        external_reference: params.orderId,
        notification_url: process.env.APP_URL 
          ? `${process.env.APP_URL}/api/webhooks/mercadopago`
          : undefined,
      },
    });

    const pointOfInteraction = response.point_of_interaction?.transaction_data;

    return {
      paymentId: response.id,
      status: response.status,
      qrCode: pointOfInteraction?.qr_code,
      qrCodeBase64: pointOfInteraction?.qr_code_base64,
      ticketUrl: pointOfInteraction?.ticket_url,
    };
  } catch (error) {
    console.error('[MercadoPago] Error creating PIX payment:', error);
    return null;
  }
}

/**
 * Process credit card token payment directly
 */
export async function createMercadoPagoCardPayment(params: {
  token: string;
  orderId: string;
  amount: number;
  installments: number;
  paymentMethodId: string;
  issuerId?: string;
  payer: {
    email: string;
    identification: {
      type: 'CPF' | 'CNPJ';
      number: string;
    };
  };
}) {
  const mp = getMercadoPago();
  if (!mp) return null;

  try {
    const cleanDoc = params.payer.identification.number.replace(/\D/g, '');
    const isCnpj = cleanDoc.length > 11;

    const response = await mp.payment.create({
      body: {
        token: params.token,
        transaction_amount: Number(params.amount.toFixed(2)),
        installments: params.installments || 1,
        payment_method_id: params.paymentMethodId,
        issuer_id: params.issuerId ? Number(params.issuerId) : undefined,
        payer: {
          email: params.payer.email,
          identification: {
            type: isCnpj ? 'CNPJ' : 'CPF',
            number: cleanDoc,
          },
        },
        external_reference: params.orderId,
      },
    });

    return {
      paymentId: response.id,
      status: response.status,
      statusDetail: response.status_detail,
    };
  } catch (error) {
    console.error('[MercadoPago] Card payment error:', error);
    return null;
  }
}
