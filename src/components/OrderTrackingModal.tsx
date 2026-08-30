import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, Printer, PackageCheck, AlertCircle } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderQuery, setOrderQuery] = useState('SP-2026-9812');
  const [hasSearched, setHasSearched] = useState(true);

  if (!isOpen) return null;

  const timelineSteps = [
    { title: 'Pedido Recebido & Pagamento Aprovado', desc: 'PIX compensado e ordem gerada no sistema ERP.', done: true, time: 'Hoje, 09:14' },
    { title: 'Pré-impressão & RIP de Arquivos', desc: 'Checagem de sangria, conversão CMYK e imposição de chapas CTP.', done: true, time: 'Hoje, 10:30' },
    { title: 'Impressão em Máquina Offset Heidelberg', desc: 'Rodagem do papel Couché 300g com controle densitométrico de cor.', done: true, current: true, time: 'Hoje, 11:45' },
    { title: 'Enobrecimento & Acabamento', desc: 'Laminação Fosca Soft Touch e aplicação de Verniz UV Localizado.', done: false, time: 'Previsão: Hoje, 15:30' },
    { title: 'Controle de Qualidade & Embalagem', desc: 'Inspeção visual e separação para logística.', done: false, time: 'Previsão: Hoje, 17:00' },
    { title: 'Disponível no Balcão de Retirada', desc: 'Pronto para você retirar ou em rota com transportadora.', done: false, time: 'Previsão: Amanhã, 10:00' },
  ];

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
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Digite o número do seu pedido (ex: SP-2026-9812)..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 uppercase font-mono font-bold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => setHasSearched(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Rastrear
          </button>
        </div>

        {/* Body Timeline */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {hasSearched && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Status do Pedido</span>
                  <div className="text-base font-black text-slate-900 font-mono">{orderQuery}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
                  <span>Em Produção</span>
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
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default OrderTrackingModal;
