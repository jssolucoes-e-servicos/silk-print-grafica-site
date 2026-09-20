import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Send,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  CreditCard,
  Truck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
  Edit3,
  QrCode,
  DollarSign,
  Info,
} from 'lucide-react';
import { Order, OrderStatus, OrderMessage } from '../../types';
import { STATUS_CONFIG } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ModalDetalhesPedidoProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus?: (orderId: string, newPaymentStatus: 'pago' | 'pendente' | 'parcial') => void;
  onAddMessage?: (orderId: string, message: OrderMessage) => void;
  onOpenDeclaracao?: (order: Order) => void;
  onOpenWhatsAppChat?: (params: { clientName: string; clientPhone: string; initialMessage?: string; orderCode?: string }) => void;
}

export const ModalDetalhesPedido: React.FC<ModalDetalhesPedidoProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onAddMessage,
  onOpenDeclaracao,
  onOpenWhatsAppChat,
}) => {
  if (!isOpen || !order) return null;

  const [activeTab, setActiveTab] = useState<'geral' | 'pagamento' | 'mensagens' | 'impressao'>('geral');
  const [copiedPix, setCopiedPix] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [localMessages, setLocalMessages] = useState<OrderMessage[]>(
    order.messages || [
      {
        id: 'msg-1',
        sender: 'sistema',
        text: `Pedido ${order.code} gerado no sistema com previsão para ${formatDate(order.deliveryDate)}.`,
        timestamp: `${formatDate(order.createdAt)} 09:30`,
      },
    ]
  );

  const statusConf = STATUS_CONFIG[order.status];
  const pixKey = order.pixKey || 'pix@silkprintgrafica.com.br';
  const cleanPhone = order.clientWhatsapp.replace(/\D/g, '');

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSendWhatsappTemplate = (templateType: string) => {
    let msg = '';
    const nome = order.clientName.split(' ')[0];

    switch (templateType) {
      case 'arte':
        msg = `Olá, *${nome}*! 👋 Aqui é da *Silk Print Gráfica*.\n\nSua arte do pedido *${order.code}* (${order.description}) está pronta para aprovação! 🎨\n\nPodemos prosseguir com a produção?`;
        break;
      case 'producao':
        msg = `Olá, *${nome}*! 🏭 Seu pedido *${order.code}* entrou em produção na *Silk Print Gráfica*!\n\nPrevisão de entrega: *${formatDate(order.deliveryDate)}*.`;
        break;
      case 'retirada':
        msg = `Olá, *${nome}*! 📦 Seu pedido *${order.code}* está pronto para retirada em nosso balcão!\n\n📍 Av. Paulista, 1000 - Bela Vista, SP.\nHorário: 08h às 18h.`;
        break;
      case 'transporte':
        msg = `Olá, *${nome}*! 🚚 Seu pedido *${order.code}* saiu para entrega!\n\nFique atento ao endereço informado. Qualquer dúvida estamos à disposição!`;
        break;
      case 'pagamento':
        msg = `Olá, *${nome}*! 💳 Segue os dados para pagamento do pedido *${order.code}*:\n\n*Valor Total:* ${formatCurrency(order.total)}\n*Chave PIX:* ${pixKey}\n*Beneficiário:* Silk Print Gráfica Ltda\n\nPor favor, nos envie o comprovante após a transferência. Obrigado! 🙏`;
        break;
      case 'entregue':
        msg = `Olá, *${nome}*! 🟢 Seu pedido *${order.code}* foi entregue com sucesso!\n\nAgradecemos pela preferência e parceria com a *Silk Print Gráfica*! Se precisar de algo mais, é só chamar! ⭐`;
        break;
      default:
        msg = `Olá, *${nome}*! Informações sobre o seu pedido *${order.code}* na Silk Print Gráfica.`;
    }

    const newMsg: OrderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'grafica',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLocalMessages((prev) => [...prev, newMsg]);
    if (onAddMessage) onAddMessage(order.id, newMsg);

    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat({
        clientName: order.clientName,
        clientPhone: order.clientWhatsapp,
        initialMessage: msg,
        orderCode: order.code,
      });
    } else {
      const encoded = encodeURIComponent(msg);
      const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
      window.open(url, '_blank');
    }
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const newMsg: OrderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'grafica',
      text: customMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLocalMessages((prev) => [...prev, newMsg]);
    if (onAddMessage) onAddMessage(order.id, newMsg);

    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat({
        clientName: order.clientName,
        clientPhone: order.clientWhatsapp,
        initialMessage: customMsg,
        orderCode: order.code,
      });
    } else {
      const encoded = encodeURIComponent(customMsg);
      const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
      window.open(url, '_blank');
    }
    setCustomMsg('');
  };

  const handlePrint = () => {
    window.print();
  };

  const stages: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'criando_arte', label: 'Arte', icon: '🎨' },
    { status: 'em_aberto', label: 'Aberto', icon: '🕒' },
    { status: 'em_producao', label: 'Produção', icon: '🏭' },
    { status: 'aguardando_retirada', label: 'Retirada', icon: '📦' },
    { status: 'em_transporte', label: 'Transporte', icon: '🚚' },
    { status: 'entregue', label: 'Entregue', icon: '🟢' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.status === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-black text-blue-400 text-base shrink-0">
              {order.code.replace('#', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                  Pedido {order.code}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusConf.badgeBg}`}>
                  {statusConf.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    order.paymentStatus === 'pago'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cliente: <strong className="text-zinc-200">{order.clientName}</strong> • Criado em {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir Pedido / OS"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Imprimir OS</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Production Pipeline Stepper */}
        <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] gap-2">
            {stages.map((st, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = order.status === st.status;

              return (
                <button
                  key={st.status}
                  onClick={() => {
                    onUpdateStatus(order.id, st.status);
                    if (st.status === 'entregue') {
                      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                    }
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-xs'
                      : isPast
                      ? 'bg-zinc-900/80 border-emerald-500/40 text-emerald-400 hover:bg-zinc-800'
                      : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-base">{st.icon}</span>
                  <span className="text-[11px] font-semibold tracking-tight truncate">
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'geral'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Visão Geral & Itens</span>
          </button>

          <button
            onClick={() => setActiveTab('pagamento')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pagamento'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagamento & PIX</span>
          </button>

          <button
            onClick={() => setActiveTab('mensagens')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mensagens'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp & Mensagens</span>
          </button>

          <button
            onClick={() => setActiveTab('impressao')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'impressao'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Ordem de Serviço (A4)</span>
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
          {/* TAB 1: VISÃO GERAL & ITENS */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Client & Shipping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Details */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>Dados do Cliente</span>
                    </span>
                    <a
                      href={`https://wa.me/55${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.clientWhatsapp}</span>
                    </a>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Nome / Razão:</span>
                      <span className="font-semibold text-zinc-200">{order.clientName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">E-mail:</span>
                      <span className="text-zinc-300">{order.clientEmail || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">CPF / CNPJ:</span>
                      <span className="font-mono text-zinc-300">{order.clientCpf || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>Entrega & Prazos</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      Prazo: {formatDate(order.deliveryDate)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Endereço:</span>
                      <span className="text-zinc-300 text-right max-w-xs truncate">
                        {order.endereco ? `${order.endereco}, ${order.numero || 'S/N'}` : 'Balcão / Retirada'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Cidade / UF:</span>
                      <span className="text-zinc-300">{order.cidade || 'São Paulo'} - {order.estado || 'SP'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">CEP:</span>
                      <span className="font-mono text-zinc-300">{order.cep || '01310-100'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span>Especificação dos Itens & Acabamentos</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {order.itemsCount || 1} item(ns)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Item / Produto</th>
                        <th className="py-2.5 px-4 text-center">Qtd</th>
                        <th className="py-2.5 px-4 text-right">Valor Unit.</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-3 px-4">
                              <div className="font-bold text-zinc-100">{item.name}</div>
                              {item.description && (
                                <div className="text-[11px] text-zinc-400">{item.description}</div>
                              )}
                              {item.finishings && item.finishings.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.finishings.map((f, fIdx) => (
                                    <span
                                      key={fIdx}
                                      className="text-[9px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded"
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-400">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-zinc-100">
                              {formatCurrency(item.total || item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-100">{order.description}</div>
                            <div className="text-[11px] text-zinc-400">Produção gráfica sob medida</div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">1</td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-400">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-zinc-100">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-zinc-950/80 border-t border-zinc-800 font-bold">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-right text-zinc-400 uppercase text-[11px]">
                          Valor Total do Pedido:
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-blue-400">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs space-y-1">
                  <span className="font-bold text-zinc-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Observações de Produção:</span>
                  </span>
                  <p className="text-zinc-300">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAGAMENTO & PIX */}
          {activeTab === 'pagamento' && (
            <div className="space-y-6">
              {/* Financial Balance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400">Valor Total</span>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {formatCurrency(order.total)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400">Status do Pagamento</span>
                  <div className="mt-1">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) =>
                        onUpdatePaymentStatus &&
                        onUpdatePaymentStatus(order.id, e.target.value as 'pago' | 'pendente' | 'parcial')
                      }
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 cursor-pointer"
                    >
                      <option value="pago">🟢 Pago Integral</option>
                      <option value="parcial">🟡 Parcial (50% Sinal)</option>
                      <option value="pendente">🔴 Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400">Forma / Chave</span>
                  <div className="text-xs font-mono font-semibold text-zinc-200 mt-1 truncate">
                    PIX / Chave Gráfica
                  </div>
                </div>
              </div>

              {/* PIX Quick Box */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Cobrança via Chave PIX Instantânea</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-500 font-semibold block">CHAVE PIX:</span>
                    <span className="text-xs font-mono font-bold text-zinc-200 truncate block">
                      {pixKey}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Copiar Chave</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleSendWhatsappTemplate('pagamento')}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Cobrança no WhatsApp do Cliente</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onUpdatePaymentStatus) onUpdatePaymentStatus(order.id, 'pago');
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marcar como Pago</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP & MENSAGENS */}
          {activeTab === 'mensagens' && (
            <div className="space-y-6">
              {/* Quick Template Triggers */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mensagens Rápidas (Disparo com 1 Clique):</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSendWhatsappTemplate('arte')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>🎨 Arte pronta p/ aprovação</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleSendWhatsappTemplate('producao')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>🏭 Entrou em Produção</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleSendWhatsappTemplate('retirada')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>📦 Pronto para Retirada</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleSendWhatsappTemplate('transporte')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>🚚 Saiu para Entrega</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleSendWhatsappTemplate('pagamento')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>💳 Chave PIX / Cobrança</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>

                  <button
                    onClick={() => handleSendWhatsappTemplate('entregue')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>🟢 Agradecimento / Entregue</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">
                  Histórico de Comunicação do Pedido
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {localMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1 ${
                        m.sender === 'sistema'
                          ? 'bg-zinc-950/60 border border-zinc-800/80 text-zinc-400'
                          : m.sender === 'grafica'
                          ? 'bg-blue-600/15 border border-blue-500/20 text-zinc-200 ml-4'
                          : 'bg-emerald-600/15 border border-emerald-500/20 text-zinc-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="font-semibold uppercase tracking-wider">
                          {m.sender === 'sistema' ? 'Sistema' : m.sender === 'grafica' ? 'Silk Print' : order.clientName}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                {/* Custom Message Input Form */}
                <form onSubmit={handleSendCustomMessage} className="pt-2 border-t border-zinc-800 flex gap-2">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Digite uma mensagem personalizada..."
                    className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: IMPRESSÃO / ORDEM DE SERVIÇO A4 */}
          {activeTab === 'impressao' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Espelho da Ordem de Serviço (A4 Pronto para Impressão)
                </span>
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir em PDF</span>
                </button>
              </div>

              {/* Printable Paper Preview Sheet */}
              <div
                id="pedido-print-sheet"
                className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl text-[10px] leading-tight font-sans space-y-4 border border-zinc-300 select-none"
              >
                {/* Header */}
                <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-lg font-black tracking-tight">SILK PRINT GRÁFICA</h1>
                    <p className="text-[10px] text-zinc-700">Comunicação Visual & Impressão Rápida</p>
                    <p className="text-[9px] text-zinc-600 mt-1">
                      CNPJ: 12.345.678/0001-90 • Av. Paulista, 1000 - Bela Vista, SP
                    </p>
                    <p className="text-[9px] text-zinc-600">WhatsApp: (11) 98765-4321</p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-black border-2 border-black px-3 py-1 bg-zinc-100 inline-block">
                      ORDEM DE SERVIÇO {order.code}
                    </div>
                    <p className="text-[9px] text-zinc-600 mt-1">Data: {formatDate(order.createdAt)}</p>
                    <p className="text-[9px] font-bold text-black">Entrega: {formatDate(order.deliveryDate)}</p>
                  </div>
                </div>

                {/* Client Info Block */}
                <div className="border border-black p-3 space-y-1 bg-zinc-50">
                  <div className="font-bold text-[10px] border-b border-black pb-1 uppercase tracking-wider">
                    DADOS DO CLIENTE & ENTREGA
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                    <div>
                      <strong>Cliente:</strong> {order.clientName}
                    </div>
                    <div>
                      <strong>Telefone/WhatsApp:</strong> {order.clientWhatsapp}
                    </div>
                    <div>
                      <strong>CPF/CNPJ:</strong> {order.clientCpf || 'Não informado'}
                    </div>
                    <div>
                      <strong>E-mail:</strong> {order.clientEmail || 'Não informado'}
                    </div>
                    <div className="col-span-2">
                      <strong>Endereço:</strong> {order.endereco || 'Retirada em balcão'} {order.numero ? `, nº ${order.numero}` : ''} {order.bairro ? ` - ${order.bairro}` : ''} {order.cidade ? `(${order.cidade}/${order.estado || 'SP'})` : ''} {order.cep ? `• CEP: ${order.cep}` : ''}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-black">
                  <div className="bg-zinc-100 font-bold text-center p-1.5 border-b border-black uppercase text-[9px]">
                    DISCRIMINAÇÃO DOS SERVIÇOS / PRODUTOS
                  </div>
                  <table className="w-full text-left text-[9px]">
                    <thead className="border-b border-black">
                      <tr>
                        <th className="p-1.5 border-r border-black font-bold">ITEM / DESCRIÇÃO</th>
                        <th className="p-1.5 w-16 text-center border-r border-black font-bold">QTD</th>
                        <th className="p-1.5 w-24 text-right border-r border-black font-bold">VALOR UNIT.</th>
                        <th className="p-1.5 w-24 text-right font-bold">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5 border-r border-black">
                              <span className="font-bold">{it.name}</span>
                              {it.description && <div className="text-[8px] text-zinc-600">{it.description}</div>}
                            </td>
                            <td className="p-1.5 text-center border-r border-black font-mono">{it.quantity}</td>
                            <td className="p-1.5 text-right border-r border-black font-mono">
                              {formatCurrency(it.unitPrice)}
                            </td>
                            <td className="p-1.5 text-right font-mono font-bold">
                              {formatCurrency(it.total || it.quantity * it.unitPrice)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-1.5 border-r border-black font-bold">{order.description}</td>
                          <td className="p-1.5 text-center border-r border-black font-mono">1</td>
                          <td className="p-1.5 text-right border-r border-black font-mono">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold bg-zinc-100 border-t-2 border-black text-[10px]">
                        <td colSpan={3} className="p-2 text-right border-r border-black uppercase">
                          VALOR TOTAL DO PEDIDO:
                        </td>
                        <td className="p-2 text-right font-mono">{formatCurrency(order.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signature Stub */}
                <div className="border-t-2 border-dashed border-black pt-4 flex justify-between items-end text-[8px]">
                  <div>
                    <p>Status do Pagamento: <strong>{order.paymentStatus.toUpperCase()}</strong></p>
                    <p>Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-56 border-t border-black pt-1">
                      Assinatura do Cliente / Recebimento
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
