import React from 'react';
import { Order, OrderStatus } from '../../types';
import { 
  X, 
  Printer, 
  ExternalLink, 
  FileText, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Download,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AdminOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; text: string; next?: OrderStatus; nextLabel?: string }> = {
  pendente_pagamento: {
    label: 'Aguardando Pagamento',
    bg: 'bg-amber-950/60 border-amber-800',
    text: 'text-amber-400',
    next: 'aprovado',
    nextLabel: 'Confirmar Pagamento'
  },
  aprovado: {
    label: 'Pago / Aguardando Produção',
    bg: 'bg-blue-950/60 border-blue-800',
    text: 'text-blue-400',
    next: 'pre_impressao',
    nextLabel: 'Iniciar Pré-Impressão / CTP'
  },
  pre_impressao: {
    label: 'Pré-Impressão & CTP',
    bg: 'bg-indigo-950/60 border-indigo-800',
    text: 'text-indigo-400',
    next: 'impressao',
    nextLabel: 'Enviar para Impressora'
  },
  impressao: {
    label: 'Em Impressão',
    bg: 'bg-cyan-950/60 border-cyan-800',
    text: 'text-cyan-400',
    next: 'acabamento',
    nextLabel: 'Enviar para Acabamento'
  },
  acabamento: {
    label: 'Acabamento & Refile',
    bg: 'bg-purple-950/60 border-purple-800',
    text: 'text-purple-400',
    next: 'embalado',
    nextLabel: 'Marcar como Embalado / Pronto'
  },
  embalado: {
    label: 'Pronto / Expedição',
    bg: 'bg-emerald-950/60 border-emerald-800',
    text: 'text-emerald-400',
    next: 'pronto_retirada',
    nextLabel: 'Disponibilizar p/ Retirada / Envio'
  },
  pronto_retirada: {
    label: 'Pronto no Balcão de Retirada',
    bg: 'bg-emerald-950/60 border-emerald-800',
    text: 'text-emerald-400',
    next: 'entregue',
    nextLabel: 'Confirmar Retirada pelo Cliente'
  },
  entregue: {
    label: 'Finalizado / Entregue',
    bg: 'bg-slate-900 border-slate-700',
    text: 'text-slate-300'
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-rose-950/60 border-rose-800',
    text: 'text-rose-400'
  },
  criando_arte: {
    label: 'Criando Arte',
    bg: 'bg-purple-950/60 border-purple-800',
    text: 'text-purple-400',
    next: 'pre_impressao',
    nextLabel: 'Enviar p/ Aprovação / CTP'
  },
  em_aberto: {
    label: 'Em Aberto',
    bg: 'bg-blue-950/60 border-blue-800',
    text: 'text-blue-400',
    next: 'em_producao',
    nextLabel: 'Iniciar Produção'
  },
  em_producao: {
    label: 'Em Produção',
    bg: 'bg-amber-950/60 border-amber-800',
    text: 'text-amber-400',
    next: 'aguardando_retirada',
    nextLabel: 'Finalizar Produção'
  },
  aguardando_retirada: {
    label: 'Aguardando Retirada',
    bg: 'bg-cyan-950/60 border-cyan-800',
    text: 'text-cyan-400',
    next: 'entregue',
    nextLabel: 'Confirmar Entrega'
  },
  em_transporte: {
    label: 'Em Transporte / Despachado',
    bg: 'bg-indigo-950/60 border-indigo-800',
    text: 'text-indigo-400',
    next: 'entregue',
    nextLabel: 'Confirmar Entrega'
  },
  aguardando_pagamento: {
    label: 'Aguardando Pagamento',
    bg: 'bg-amber-950/60 border-amber-800',
    text: 'text-amber-400',
    next: 'aprovado',
    nextLabel: 'Confirmar Pagamento'
  }
};

export const AdminOrderModal: React.FC<AdminOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}) => {
  if (!isOpen || !order) return null;

  const statusConfig: {
    label: string;
    bg: string;
    text: string;
    next?: OrderStatus;
    nextLabel?: string;
  } = STATUS_LABELS[order.status] || {
    label: order.status,
    bg: 'bg-slate-800 border-slate-700',
    text: 'text-slate-300',
    next: undefined,
    nextLabel: undefined,
  };

  const handlePrintOS = () => {
    window.print();
  };

  const cleanPhone = (order.customer?.phone || '').replace(/\D/g, '');
  const customerWhatsAppUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá ${order.customer.name}! Aqui é da Silk Print Gráfica referente ao seu pedido #${order.id}. O status atual é: ${statusConfig.label}.`
  )}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        
        {/* Header - Screen only */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-heading">
                  Ordem de Serviço #{order.id}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Emitido em: {new Date(order.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOS}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Imprimir espelho da O.S. para prancheta"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Ficha O.S.</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Header - Visible only in Print */}
        <div className="hidden print:block p-6 border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">SILK PRINT GRÁFICA & EDITORA</h1>
              <p className="text-sm">Parque Gráfico & Produção Industrial</p>
              <p className="text-xs text-gray-600">FICHA TÉCNICA DE PRODUÇÃO / ORDEM DE SERVIÇO</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-black">#{order.id}</div>
              <div className="text-xs">{new Date(order.timestamp).toLocaleString('pt-BR')}</div>
              <div className="text-xs font-bold mt-1">STATUS: {statusConfig.label.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          
          {/* Action Pipeline Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Etapa Atual da Esteira:</div>
              <div className="text-base font-black text-white">{statusConfig.label}</div>
            </div>

            <div className="flex items-center gap-2">
              {statusConfig.next && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, statusConfig.next!)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
                >
                  <span>{statusConfig.nextLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer & Delivery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer info */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 print:bg-white print:border-gray-300">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 print:text-black">
                Dados do Cliente & Contato
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 print:text-gray-600">Nome: </span>
                  <strong className="text-white print:text-black">{order.customer.name}</strong>
                </div>
                {order.customer.document && (
                  <div>
                    <span className="text-slate-400 print:text-gray-600">CPF / CNPJ: </span>
                    <strong className="text-white print:text-black font-mono">{order.customer.document}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 print:text-gray-600">Telefone: </span>
                  <span className="text-white print:text-black font-mono">{order.customer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-600">E-mail: </span>
                  <span className="text-white print:text-black">{order.customer.email}</span>
                </div>

                {customerWhatsAppUrl && (
                  <div className="pt-2 print:hidden">
                    <a
                      href={customerWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Chamar no WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery info */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 print:bg-white print:border-gray-300">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 print:text-black">
                <MapPin className="w-3.5 h-3.5" /> Entrega / Expedição
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 print:text-gray-600">Modalidade: </span>
                  <strong className="text-white print:text-black">
                    {order.shipping.type === 'pickup' ? 'Balcão de Retirada' : 'Entrega por Transportadora / Correios'}
                  </strong>
                </div>

                {order.shipping.pickupPoint ? (
                  <div>
                    <span className="text-slate-400 print:text-gray-600">Balcão Selecionado: </span>
                    <strong className="text-cyan-400 print:text-black">{order.shipping.pickupPoint.name}</strong>
                    <p className="text-slate-400 print:text-gray-600 mt-0.5">
                      {order.shipping.pickupPoint.address} - {order.shipping.pickupPoint.city}/{order.shipping.pickupPoint.state}
                    </p>
                  </div>
                ) : order.shipping.address ? (
                  <div>
                    <span className="text-slate-400 print:text-gray-600">Endereço de Entrega: </span>
                    <p className="text-white print:text-black font-medium mt-0.5">
                      {order.shipping.address.street}, {order.shipping.address.number}
                      {order.shipping.address.complement ? ` (${order.shipping.address.complement})` : ''} - {order.shipping.address.neighborhood}
                    </p>
                    <p className="text-slate-400 print:text-gray-600 font-mono">
                      {order.shipping.address.city}/{order.shipping.address.state} - CEP: {order.shipping.address.cep}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">Endereço não informado.</p>
                )}

                <div>
                  <span className="text-slate-400 print:text-gray-600">Frete: </span>
                  <strong className="text-emerald-400 print:text-black font-mono">
                    {order.shipping.cost > 0 ? formatCurrency(order.shipping.cost) : 'Grátis'}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Items Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-black">
            <div className="bg-slate-900 p-3 border-b border-slate-800 font-bold text-xs text-white uppercase tracking-wider print:bg-gray-100 print:text-black print:border-black">
              Especificações Técnicas dos Produtos
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 print:bg-gray-50 print:text-black print:border-black">
                <tr>
                  <th className="p-3">Item / Produto</th>
                  <th className="p-3">Formato / Papel</th>
                  <th className="p-3">Cores & Acabamento</th>
                  <th className="p-3 text-center">Tiragem</th>
                  <th className="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black">
                {order.items.map((item: any, idx) => {
                  const itemFormat = item.config?.format || item.format || 'Padrão';
                  const itemPaper = item.config?.paper || item.paperName || 'Couché';
                  const itemColor = item.config?.colorMode || item.colorMode || '4x0';
                  const itemFinish = item.config?.finish || (Array.isArray(item.finishes) ? item.finishes.join(', ') : item.finishes) || 'Padrão';
                  const itemQty = Number(item.config?.quantity || item.quantity || 100);
                  const itemArt = item.artwork;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="p-3">
                        <div className="font-bold text-white print:text-black text-sm">{item.productName}</div>
                        {itemArt && (
                          <div className="mt-1 flex items-center gap-1.5 print:hidden">
                            <a
                              href={itemArt.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800"
                            >
                              <Download className="w-3 h-3" /> Baixar Arte ({itemArt.fileName || 'Arquivo'})
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-white print:text-black font-medium">{itemFormat}</div>
                        <div className="text-slate-400 print:text-gray-600">{itemPaper}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white print:text-black font-mono">{itemColor}</div>
                        <div className="text-cyan-400 print:text-gray-700">{itemFinish}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-white print:text-black font-mono">
                        {itemQty.toLocaleString('pt-BR')} un
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 print:text-black font-mono">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end print:bg-white print:border-black">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400 print:text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(order.payment.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-600">
                  <span>Frete:</span>
                  <span className="font-mono">{formatCurrency(order.payment.shippingCost)}</span>
                </div>
                {order.payment.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 print:text-black">
                    <span>Desconto ({order.payment.couponCode || 'Cupom'}):</span>
                    <span className="font-mono">-{formatCurrency(order.payment.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800 print:text-black print:border-black">
                  <span>TOTAL DA O.S.:</span>
                  <span className="text-emerald-400 print:text-black font-mono">{formatCurrency(order.payment.total)}</span>
                </div>
                <div className="text-[10px] text-slate-500 print:text-gray-600 text-right pt-0.5">
                  Método: {order.payment.method.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Control Checklist - visible on print */}
          <div className="hidden print:block mt-6 border border-black p-4">
            <h4 className="font-black text-xs uppercase mb-2">Controle de Qualidade & Assinaturas do Parque Fabril</h4>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="border border-gray-400 p-2 h-20">
                <span className="font-bold">Pré-Impressão / CTP:</span>
                <div className="mt-8 border-t border-gray-400 pt-1 text-[10px]">Visto / Data</div>
              </div>
              <div className="border border-gray-400 p-2 h-20">
                <span className="font-bold">Impressão Offset:</span>
                <div className="mt-8 border-t border-gray-400 pt-1 text-[10px]">Operador / Maq.</div>
              </div>
              <div className="border border-gray-400 p-2 h-20">
                <span className="font-bold">Acabamento & Vinco:</span>
                <div className="mt-8 border-t border-gray-400 pt-1 text-[10px]">Visto / Data</div>
              </div>
              <div className="border border-gray-400 p-2 h-20">
                <span className="font-bold">Expedição & Pacote:</span>
                <div className="mt-8 border-t border-gray-400 pt-1 text-[10px]">Conferido por</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer - Screen only */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-400">
            Silk Print ERP • Ordem de Serviço #{order.id}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
