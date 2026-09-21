import React, { useState, useEffect } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, Printer, PackageCheck, AlertCircle, Loader2 } from 'lucide-react';
import { trackOrder } from '../lib/api';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, initialOrderId }) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderId || 'cjk19x08y0000a1b2c3d4e5f6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const order = await trackOrder(code.trim());
      if (order) {
        setOrderData(order);
      } else {
        setError(`Nenhum pedido encontrado com o ID "${code}". Verifique o código e tente novamente.`);
        setOrderData(null);
      }
    } catch (err) {
      setError('Erro ao consultar o servidor de rastreio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialOrderId) {
        setOrderQuery(initialOrderId);
        fetchTracking(initialOrderId);
      } else {
        fetchTracking(orderQuery);
      }
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  const defaultTimeline = [
    { step: 'Pedido Recebido & Pagamento Aprovado', description: 'PIX compensado e ordem gerada no sistema ERP.', done: true, timestamp: 'Hoje, 09:14' },
    { step: 'Pré-impressão & RIP de Arquivos', description: 'Checagem de sangria, conversão CMYK e imposição de chapas CTP.', done: true, timestamp: 'Hoje, 10:30' },
    { step: 'Impressão em Máquina Offset Heidelberg', description: 'Rodagem do papel Couché 300g com controle densitométrico de cor.', done: true, current: true, timestamp: 'Hoje, 11:45' },
    { step: 'Enobrecimento & Acabamento', description: 'Laminação Fosca Soft Touch e aplicação de Verniz UV Localizado.', done: false, timestamp: 'Previsão: Hoje, 15:30' },
    { step: 'Controle de Qualidade & Embalagem', description: 'Inspeção visual e separação para logística.', done: false, timestamp: 'Previsão: Hoje, 17:00' },
    { step: 'Disponível no Balcão de Retirada', description: 'Pronto para você retirar ou em rota com transportadora.', done: false, timestamp: 'Previsão: Amanhã, 10:00' },
  ];

  const timelineSteps = orderData?.timeline || defaultTimeline;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Rastreamento de Produção em Tempo Real</h3>
              <p className="text-xs text-slate-400">Acompanhe cada etapa do seu pedido dentro da nossa gráfica</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            fetchTracking(orderQuery);
          }} 
          className="p-6 border-b border-slate-200 bg-slate-50 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Digite o ID CUID do pedido (ex: cjk19x08y0000a1b2c3d4e5f6)..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-mono font-bold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Rastrear</span>
          </button>
        </form>

        {/* Body Timeline */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{error}</p>
                <p className="mt-1 text-amber-700">Dica: Você pode testar com o ID de exemplo <strong className="font-mono cursor-pointer underline" onClick={() => { setOrderQuery('cjk19x08y0000a1b2c3d4e5f6'); fetchTracking('cjk19x08y0000a1b2c3d4e5f6'); }}>cjk19x08y0000a1b2c3d4e5f6</strong>.</p>
              </div>
            </div>
          )}

          {orderData && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Status do Pedido</span>
                  <div className="text-base font-black text-slate-900 font-mono">{orderData.id}</div>
                  {orderData.customer?.name && (
                    <div className="text-xs text-slate-500 mt-0.5">Cliente: {orderData.customer.name}</div>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
                  <span className="capitalize">{orderData.status.replace('_', ' ')}</span>
                </span>
              </div>

              {/* Steps timeline */}
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker */}
                    <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      step.done 
                        ? 'bg-cyan-600 border-cyan-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-300'
                    }`}>
                      {step.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <h4 className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.step}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">{step.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items summary */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Itens do Pedido</h5>
                  <div className="space-y-2">
                    {orderData.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600">
                        <span>{it.quantity}x {it.productName} ({it.format})</span>
                        <span className="font-bold text-slate-800">R$ {it.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default OrderTrackingModal;
