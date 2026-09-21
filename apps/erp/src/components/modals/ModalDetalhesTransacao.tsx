import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  FileText,
  User,
  Package,
  Printer,
  Edit3,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  MessageCircle,
  QrCode,
  Share2,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Transaction, Client, Order } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ModalDetalhesTransacaoProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  clients?: Client[];
  orders?: Order[];
  onUpdateTransaction?: (updatedTx: Transaction) => void;
  onDeleteTransaction?: (txId: string) => void;
  onToggleStatus?: (txId: string, newStatus: 'pago' | 'pendente') => void;
  onDuplicateTransaction?: (tx: Transaction) => void;
  onOpenClientDetails?: (client: Client) => void;
  onOpenOrderDetails?: (order: Order) => void;
}

export const ModalDetalhesTransacao: React.FC<ModalDetalhesTransacaoProps> = ({
  transaction,
  isOpen,
  onClose,
  clients = [],
  orders = [],
  onUpdateTransaction,
  onDeleteTransaction,
  onToggleStatus,
  onDuplicateTransaction,
  onOpenClientDetails,
  onOpenOrderDetails,
}) => {
  if (!isOpen || !transaction) return null;

  const [activeTab, setActiveTab] = useState<'detalhes' | 'recibo' | 'qrcode'>('detalhes');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Edit form state
  const [description, setDescription] = useState(transaction.description);
  const [value, setValue] = useState(transaction.value.toString());
  const [type, setType] = useState(transaction.type);
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod || 'PIX');
  const [status, setStatus] = useState(transaction.status);
  const [dueDate, setDueDate] = useState(transaction.dueDate || '');
  const [category, setCategory] = useState(transaction.category || (transaction.type === 'receita' ? 'Vendas Balcão' : 'Insumos'));
  const [clientName, setClientName] = useState(transaction.clientName || '');
  const [observations, setObservations] = useState(transaction.observations || '');

  React.useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setValue(transaction.value.toString());
      setType(transaction.type);
      setPaymentMethod(transaction.paymentMethod || 'PIX');
      setStatus(transaction.status);
      setDueDate(transaction.dueDate || '');
      setCategory(transaction.category || (transaction.type === 'receita' ? 'Vendas Balcão' : 'Insumos'));
      setClientName(transaction.clientName || '');
      setObservations(transaction.observations || '');
      setIsEditing(false);
      setIsDeletingConfirm(false);
    }
  }, [transaction]);

  const isReceita = transaction.type === 'receita';
  const isPago = transaction.status === 'pago';

  // Match linked client & order if any
  const matchedClient = clients.find(
    (c) =>
      (transaction.clientId && c.id === transaction.clientId) ||
      (transaction.clientName && c.name.toLowerCase() === transaction.clientName.toLowerCase())
  );

  const matchedOrder = orders.find(
    (o) =>
      (transaction.orderId && o.id === transaction.orderId) ||
      (transaction.orderCode && o.code === transaction.orderCode) ||
      o.clientName.toLowerCase() === (transaction.clientName || '').toLowerCase()
  );

  const pixKey = 'pix@silkprintgrafica.com.br';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleToggleCurrentStatus = () => {
    const nextStatus = isPago ? 'pendente' : 'pago';
    onToggleStatus?.(transaction.id, nextStatus);
    setStatus(nextStatus);
    if (nextStatus === 'pago') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(value.replace(',', '.'));
    if (!description.trim() || isNaN(val) || val <= 0) return;

    const updated: Transaction = {
      ...transaction,
      description: description.trim(),
      value: val,
      type,
      paymentMethod,
      status,
      dueDate: dueDate.trim() || undefined,
      category: category.trim() || undefined,
      clientName: clientName.trim() || undefined,
      observations: observations.trim() || undefined,
      paidAt: status === 'pago' ? new Date().toISOString() : undefined,
    };

    onUpdateTransaction?.(updated);
    setIsEditing(false);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
  };

  const handleSendWhatsappReceipt = () => {
    if (!matchedClient && !transaction.clientName) return;
    const clientPhone = matchedClient?.whatsapp.replace(/\D/g, '') || '';
    const nome = transaction.clientName?.split(' ')[0] || 'Cliente';

    let msg = '';
    if (isPago) {
      msg = `Olá, *${nome}*! 👋 Segue o comprovante de quitação do seu lançamento na *Silk Print Gráfica*:\n\n*Descrição:* ${transaction.description}\n*Valor:* ${formatCurrency(transaction.value)}\n*Forma de Pagamento:* ${transaction.paymentMethod || 'PIX'}\n*Status:* PAGO / QUITADO ✅\n*Autenticação:* ${transaction.id}\n\nAgradecemos a preferência! 🙏`;
    } else {
      msg = `Olá, *${nome}*! 💳 Seguem os dados para pagamento referente a *${transaction.description}* na *Silk Print Gráfica*:\n\n*Valor:* ${formatCurrency(transaction.value)}\n*Vencimento:* ${transaction.dueDate ? formatDate(transaction.dueDate) : 'Imediato'}\n*Chave PIX:* ${pixKey}\n*Beneficiário:* Silk Print Gráfica Ltda\n\nPor favor, nos envie o comprovante após a transferência. Obrigado! 🚀`;
    }

    const encoded = encodeURIComponent(msg);
    if (clientPhone) {
      window.open(`https://wa.me/55${clientPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                isReceita
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {isReceita ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">{transaction.description}</h2>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isReceita
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isReceita ? 'Receita' : 'Despesa'}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isPago
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isPago ? 'Pago / Concluído' : 'Pendente'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Registro: <span className="font-mono text-zinc-300">{transaction.id}</span>
                {transaction.createdAt ? ` em ${formatDate(transaction.createdAt)}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Toolbar */}
        <div className="px-5 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCurrentStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs ${
                isPago
                  ? 'bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isPago ? 'Reabrir (Marcar Pendente)' : 'Dar Baixa (Marcar Pago)'}</span>
            </button>

            <button
              onClick={handleSendWhatsappReceipt}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('recibo')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Recibo Digital</span>
            </button>

            <button
              onClick={() => onDuplicateTransaction?.(transaction)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelando...' : 'Editar'}</span>
            </button>

            {!isDeletingConfirm ? (
              <button
                onClick={() => setIsDeletingConfirm(true)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Estornar / Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onDeleteTransaction?.(transaction.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setIsDeletingConfirm(false)}
                  className="px-2 py-1 bg-zinc-800 text-zinc-300 text-[11px] rounded-lg"
                >
                  Não
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Valor Total</span>
            <span
              className={`text-lg font-black font-mono ${
                isReceita ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isReceita ? '+' : '-'} {formatCurrency(transaction.value)}
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Forma de Pagamento</span>
            <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1 mt-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>{transaction.paymentMethod || 'PIX'}</span>
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Categoria / Centro</span>
            <span className="text-xs font-semibold text-zinc-200 mt-1 block truncate">
              {transaction.category || (isReceita ? 'Vendas' : 'Despesas')}
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Vencimento</span>
            <span className="text-xs font-mono font-semibold text-zinc-200 mt-1 block">
              {transaction.dueDate ? formatDate(transaction.dueDate) : 'À Vista'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-800 bg-zinc-900 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('detalhes')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'detalhes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Detalhes do Lançamento
          </button>

          <button
            onClick={() => setActiveTab('recibo')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'recibo'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Recibo / Comprovante Timbrado</span>
          </button>

          {!isPago && isReceita && (
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'qrcode'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>QR Code PIX</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* TAB 1: DETALHES */}
          {activeTab === 'detalhes' && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Descrição do Lançamento *
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Tipo de Operação
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'receita' | 'despesa')}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="receita">Receita (Entrada)</option>
                        <option value="despesa">Despesa (Saída)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Forma de Pagamento
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="PIX">PIX</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Boleto">Boleto</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Transferência">Transferência</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Status do Pagamento
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="pago">Pago / Quitado</option>
                        <option value="pendente">Pendente / Aguardando</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Categoria / Centro de Custo
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome do Cliente / Fornecedor
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Observações / Justificativa
                    </label>
                    <textarea
                      rows={3}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Linked Entities (Client & Order) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cliente Vinculado */}
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>Cliente / Pagador</span>
                        </span>
                        {matchedClient && (
                          <button
                            onClick={() => onOpenClientDetails?.(matchedClient)}
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Ver Ficha</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-bold text-zinc-100">
                          {transaction.clientName || 'Não especificado'}
                        </div>
                        {matchedClient && (
                          <div className="text-zinc-400 text-[11px]">
                            <div>WhatsApp: {matchedClient.whatsapp}</div>
                            {matchedClient.cpfCnpj && <div>Doc: {matchedClient.cpfCnpj}</div>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pedido Vinculado */}
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pedido Vinculado</span>
                        </span>
                        {matchedOrder && (
                          <button
                            onClick={() => onOpenOrderDetails?.(matchedOrder)}
                            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Abrir Pedido</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        {matchedOrder ? (
                          <div>
                            <span className="font-bold font-mono text-zinc-100">{matchedOrder.code}</span>
                            <div className="text-zinc-400 text-[11px] line-clamp-1">{matchedOrder.description}</div>
                          </div>
                        ) : (
                          <div className="text-zinc-500">Lançamento Avulso / Direto</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  {transaction.observations && (
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-1">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Observações do Lançamento
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap">{transaction.observations}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECIBO TIMBRADO */}
          {activeTab === 'recibo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs text-zinc-400">Recibo / Comprovante Oficial</span>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Recibo</span>
                </button>
              </div>

              {/* Printable Receipt Card */}
              <div className="p-6 bg-white text-zinc-900 rounded-xl border border-zinc-300 font-sans space-y-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-zinc-300 pb-3">
                  <div>
                    <h2 className="text-base font-black tracking-tight text-zinc-950">SILK PRINT GRÁFICA</h2>
                    <p className="text-[11px] text-zinc-600">Comprovante de Lançamento Financeiro</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-zinc-900">Nº {transaction.id}</div>
                    <div className="text-zinc-500 text-[10px]">Data: {new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-zinc-50 rounded border border-zinc-200 flex justify-between items-center">
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase font-bold">Natureza</span>
                      <span className="font-bold text-zinc-900">{isReceita ? 'Recebimento de Cliente' : 'Pagamento / Despesa'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase font-bold">Valor do Documento</span>
                      <span className="text-base font-black font-mono text-zinc-950">{formatCurrency(transaction.value)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-bold uppercase">Referente a</span>
                      <span className="font-semibold text-zinc-900">{transaction.description}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-bold uppercase">Favorecido / Sacado</span>
                      <span className="font-semibold text-zinc-900">{transaction.clientName || 'Silk Print Gráfica'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-bold uppercase">Forma de Pagamento</span>
                      <span className="text-zinc-800">{transaction.paymentMethod || 'PIX'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-bold uppercase">Situação</span>
                      <span className="font-bold text-zinc-900 uppercase">{isPago ? 'PAGO / QUITADO' : 'PENDENTE'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 text-center text-[10px] text-zinc-500">
                  Documento emitido eletronicamente pelo Sistema de Gestão Silk Print Gráfica • Autenticação: {transaction.id}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE PIX */}
          {activeTab === 'qrcode' && (
            <div className="p-6 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">Pagamento Instantâneo via PIX</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Valor a receber: <span className="font-bold font-mono text-emerald-400">{formatCurrency(transaction.value)}</span>
                </p>
              </div>

              {/* PIX Key Box */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
                <div className="text-left text-xs font-mono text-zinc-200 truncate">{pixKey}</div>
                <button
                  onClick={handleCopyPix}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
