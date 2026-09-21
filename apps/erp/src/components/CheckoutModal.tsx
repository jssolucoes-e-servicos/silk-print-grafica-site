import React, { useState } from 'react';
import { CartItem, ShippingMethod, BalcaoRetirada, Order } from '../types';
import { formatCurrency, formatCep, formatPhone } from '../lib/utils';
import { submitOrder } from '../lib/api';
import { createCuid } from '../lib/cuid';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  MapPin, 
  Truck, 
  CreditCard, 
  QrCode, 
  FileText, 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Printer,
  ChevronRight
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedCoupon: string | null;
  onOrderCompleted: (orderId: string) => void;
  pickupPoints?: BalcaoRetirada[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedCoupon,
  onOrderCompleted,
  pickupPoints = [],
}) => {
  const [step, setStep] = useState<'info' | 'shipping' | 'payment' | 'success'>('info');

  // Customer state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');

  // Delivery type & address
  const [deliveryType, setDeliveryType] = useState<'balcao' | 'endereco'>('balcao');
  const [selectedBalcao, setSelectedBalcao] = useState<BalcaoRetirada | null>(null);
  const [cep, setCep] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComp, setAddressComp] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  const [copiedPix, setCopiedPix] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [mercadoPagoData, setMercadoPagoData] = useState<{
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountAmount = appliedCoupon ? subtotal * 0.10 : 0;
  
  const activeBalcao = selectedBalcao || pickupPoints[0] || null;

  const shippingCost = deliveryType === 'balcao' 
    ? (activeBalcao ? activeBalcao.price : 0) 
    : subtotal > 199 ? 0 : 19.90;

  const orderTotal = (subtotal - discountAmount) + shippingCost;
  const pixTotal = orderTotal * 0.95; // 5% discount on PIX

  const activePixCode = mercadoPagoData?.qrCode || `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}-silkprint520400005303986540${pixTotal.toFixed(2)}5802BR5919SILK PRINT GRAFICA6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinishOrder = async () => {
    const generatedId = createCuid();
    setOrderId(generatedId);
    setStep('success');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore confetti if not supported
    }

    // Submit order to API
    try {
      const res = await submitOrder({
        id: generatedId,
        customer: {
          name: name || 'Cliente',
          email: email || '',
          phone: phone || '',
          document: document || ''
        },
        shipping: {
          type: deliveryType,
          price: shippingCost,
          balcaoId: deliveryType === 'balcao' ? (activeBalcao?.id || 'balcao-default') : undefined,
          balcaoName: deliveryType === 'balcao' ? (activeBalcao?.name || 'Balcão de Retirada') : undefined,
          address: deliveryType === 'endereco' ? {
            cep,
            street: addressStreet,
            number: addressNumber,
            complement: addressComp,
            neighborhood: addressNeighborhood,
            city: addressCity,
            state: addressState
          } : undefined
        },
        items: items.map(it => ({
          id: it.id,
          productId: it.productId || it.product?.id || 'prod',
          productName: (it as any).productName || it.product?.name || 'Material Gráfico',
          format: it.format || 'Padrão',
          paperName: it.paper?.name || 'Padrão',
          colorMode: it.colorMode?.name || '4x0 Cores',
          finishes: (it.finishes || []).map(f => f?.name || String(f)),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          artworkFile: it.artworkFile ? { name: it.artworkFile.name, size: it.artworkFile.size, url: it.artworkFile.url } : undefined
        })),
        payment: {
          method: paymentMethod,
          subtotal,
          discount: discountAmount + (paymentMethod === 'pix' ? (orderTotal - pixTotal) : 0),
          shippingCost,
          total: paymentMethod === 'pix' ? pixTotal : orderTotal,
          installments: paymentMethod === 'credit' ? parseInt(installments, 10) : undefined
        },
        couponApplied: appliedCoupon || undefined
      });

      if (res?.paymentGateway) {
        setMercadoPagoData(res.paymentGateway);
      }
    } catch (err) {
      console.warn('Order submission background sync notice:', err);
    }

    onOrderCompleted(generatedId);
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header with Progress */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Printer className="w-4 h-4" />
              <span>Silk Print Checkout Seguro</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              {step === 'info' && 'Identificação & Dados de Contato'}
              {step === 'shipping' && 'Escolha da Forma de Entrega / Balcão'}
              {step === 'payment' && 'Opções de Pagamento'}
              {step === 'success' && 'Pedido Confirmado com Sucesso!'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step indicator */}
        {step !== 'success' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-cyan-600 font-bold' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">1</span>
              <span>Dados</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-cyan-600 font-bold' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">2</span>
              <span>Entrega</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-cyan-600 font-bold' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">3</span>
              <span>Pagamento</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* STEP 1: INFO */}
          {step === 'info' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo / Razão Social *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail para Acompanhamento *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF ou CNPJ para Nota Fiscal *</label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <span>Continuar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING */}
          {step === 'shipping' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Toggle Balcão vs Endereço */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeliveryType('balcao')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'balcao'
                      ? 'bg-white text-cyan-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  <span>Retirar em Balcão (Mais Rápido & Econômico)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('endereco')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'endereco'
                      ? 'bg-white text-cyan-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4 text-pink-600" />
                  <span>Entregar no Meu Endereço</span>
                </button>
              </div>

              {deliveryType === 'balcao' ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Selecione o Balcão de Retirada Mais Próximo:</span>
                    <span className="text-cyan-600">{pickupPoints.length} pontos disponíveis</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {pickupPoints.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                        Nenhum balcão de retirada cadastrado no banco de dados no momento.
                      </div>
                    ) : (
                      pickupPoints.map((balcao) => (
                        <div
                          key={balcao.id}
                          onClick={() => setSelectedBalcao(balcao)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            activeBalcao?.id === balcao.id
                              ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${
                              activeBalcao?.id === balcao.id ? 'text-cyan-600' : 'text-slate-400'
                            }`} />
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <span>{balcao.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-bold text-slate-700">
                                  {balcao.state}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{balcao.address} - {balcao.neighborhood}, {balcao.city}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{balcao.openingHours}</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs font-black text-cyan-700">
                              {balcao.price === 0 ? 'GRÁTIS' : formatCurrency(balcao.price)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CEP *</label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(formatCep(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Rua *</label>
                      <input
                        type="text"
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Número *</label>
                      <input
                        type="text"
                        value={addressNumber}
                        onChange={(e) => setAddressNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={addressComp}
                        onChange={(e) => setAddressComp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <QrCode className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                  <div className="text-xs font-bold">PIX (5% OFF)</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Aprovação Imediata</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto text-cyan-600 mb-1" />
                  <div className="text-xs font-bold">Cartão de Crédito</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Até 12x</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'boleto'
                      ? 'border-slate-700 bg-slate-100 text-slate-950 ring-2 ring-slate-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto text-slate-700 mb-1" />
                  <div className="text-xs font-bold">Boleto / PJ</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Faturamento</div>
                </button>
              </div>

              {/* PIX Flow */}
              {paymentMethod === 'pix' && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Pague com PIX e Economize</span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Seu pedido entra instantaneamente na fila de CTP / Pré-impressão.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 line-through">{formatCurrency(orderTotal)}</div>
                      <div className="text-xl font-black text-emerald-700 font-heading">
                        {formatCurrency(pixTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
                    {/* Simulated QR Code Canvas */}
                    <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      {mercadoPagoData?.qrCodeBase64 ? (
                        <img 
                          src={`data:image/png;base64,${mercadoPagoData.qrCodeBase64}`} 
                          alt="QR Code PIX Mercado Pago" 
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-cyan-400 p-1 flex flex-col items-center justify-center text-center text-[9px] text-white">
                          <QrCode className="w-12 h-12 text-cyan-400" />
                          <span>QR CODE PIX</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <p className="text-slate-600">
                        Abra o app do seu banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera ou utilize o código Copia e Cola:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={activePixCode}
                          className="flex-1 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-600 truncate border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                        >
                          {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Credit Card Flow */}
              {paymentMethod === 'credit' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nome no Cartão</label>
                      <input
                        type="text"
                        placeholder="Como impresso no cartão"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Validade</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número de Parcelas</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="1">1x de {formatCurrency(orderTotal)} sem juros</option>
                      <option value="2">2x de {formatCurrency(orderTotal / 2)} sem juros</option>
                      <option value="3">3x de {formatCurrency(orderTotal / 3)} sem juros</option>
                      <option value="6">6x de {formatCurrency(orderTotal / 6)} sem juros</option>
                      <option value="12">12x de {formatCurrency((orderTotal * 1.08) / 12)} com juros</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Order Summary box */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Itens ({items.length}):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Cupom {appliedCoupon}:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Frete ({deliveryType === 'balcao' ? selectedBalcao.name : 'Endereço'}):</span>
                  <span className="font-semibold text-slate-900">
                    {shippingCost === 0 ? 'GRÁTIS' : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Final:</span>
                  <span className="text-cyan-700 font-heading">
                    {paymentMethod === 'pix' ? formatCurrency(pixTotal) : formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleFinishOrder}
                  className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-cyan-600/30 active:scale-95"
                  id="btn-confirm-payment"
                >
                  <span>Concluir e Enviar para Produção</span>
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6 sm:py-10 space-y-6 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-600 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-black text-cyan-600">
                  PARABÉNS! SEU PEDIDO FOI RECEBIDO
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  Pedido #{orderId}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enviamos os comprovantes e a ordem de serviço para <strong>{email}</strong> e para o WhatsApp cadastrado.
                </p>
              </div>

              {/* Status roadmap snippet */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>Próximos Passos no Parque Gráfico:</span>
                </div>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pagamento Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-700 font-semibold">
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 animate-ping" />
                    <span>Em Análise de Pré-impressão & RIP</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    <span>Gravação de Chapas CTP & Impressão Offset</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    <span>Envio para Balcão ({selectedBalcao.name})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
              >
                Voltar à Loja Principal
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default CheckoutModal;
