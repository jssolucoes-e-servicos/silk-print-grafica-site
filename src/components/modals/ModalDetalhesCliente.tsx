import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Package,
  Calendar,
  Clock,
  Printer,
  Edit3,
  Trash2,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  ChevronRight,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { Client, Order, Quote, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { STATUS_CONFIG } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface ModalDetalhesClienteProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  quotes: Quote[];
  transactions: Transaction[];
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onOpenNovoPedidoParaCliente?: (client: Client) => void;
  onOpenNovoOrcamentoParaCliente?: (client: Client) => void;
  onOpenNovaReceitaParaCliente?: (client: Client) => void;
  onOpenOrderDetails?: (order: Order) => void;
  onOpenTransactionDetails?: (transaction: Transaction) => void;
  onOpenWhatsAppChat?: (params: { clientName: string; clientPhone: string; initialMessage?: string }) => void;
}

export const ModalDetalhesCliente: React.FC<ModalDetalhesClienteProps> = ({
  client,
  isOpen,
  onClose,
  orders,
  quotes,
  transactions,
  onUpdateClient,
  onDeleteClient,
  onOpenNovoPedidoParaCliente,
  onOpenNovoOrcamentoParaCliente,
  onOpenNovaReceitaParaCliente,
  onOpenOrderDetails,
  onOpenTransactionDetails,
  onOpenWhatsAppChat,
}) => {
  if (!isOpen || !client) return null;

  const [activeTab, setActiveTab] = useState<'cadastro' | 'pedidos' | 'orcamentos' | 'financeiro' | 'impressao'>('cadastro');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Edit form state
  const [name, setName] = useState(client.name);
  const [whatsapp, setWhatsapp] = useState(client.whatsapp);
  const [email, setEmail] = useState(client.email || '');
  const [cpfCnpj, setCpfCnpj] = useState(client.cpfCnpj || '');
  const [cep, setCep] = useState(client.cep || '');
  const [endereco, setEndereco] = useState(client.endereco || '');
  const [numero, setNumero] = useState(client.numero || '');
  const [bairro, setBairro] = useState(client.bairro || '');
  const [cidade, setCidade] = useState(client.cidade || '');
  const [estado, setEstado] = useState(client.estado || '');
  const [observacoes, setObservacoes] = useState(client.observacoes || '');

  // Reset form when client changes
  React.useEffect(() => {
    if (client) {
      setName(client.name);
      setWhatsapp(client.whatsapp);
      setEmail(client.email || '');
      setCpfCnpj(client.cpfCnpj || '');
      setCep(client.cep || '');
      setEndereco(client.endereco || '');
      setNumero(client.numero || '');
      setBairro(client.bairro || '');
      setCidade(client.cidade || '');
      setEstado(client.estado || '');
      setObservacoes(client.observacoes || '');
      setIsEditing(false);
      setIsDeletingConfirm(false);
    }
  }, [client]);

  // Client-specific filtered data
  const clientOrders = orders.filter(
    (o) => o.clientId === client.id || o.clientName.toLowerCase() === client.name.toLowerCase()
  );
  const clientQuotes = quotes.filter(
    (q) => q.clientId === client.id || q.clientName.toLowerCase() === client.name.toLowerCase()
  );
  const clientTransactions = transactions.filter(
    (t) => t.clientId === client.id || (t.clientName && t.clientName.toLowerCase() === client.name.toLowerCase())
  );

  const totalSpentCalculated = clientOrders.reduce((sum, o) => sum + o.total, 0) || client.totalSpent || 0;
  const ordersCountCalculated = clientOrders.length || client.ordersCount || 0;
  const ticketMedio = ordersCountCalculated > 0 ? totalSpentCalculated / ordersCountCalculated : 0;
  const pendingOrders = clientOrders.filter((o) => o.paymentStatus === 'pendente' || o.paymentStatus === 'parcial');
  const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + (o.total - (o.paidAmount || 0)), 0);

  const cleanPhone = client.whatsapp.replace(/\D/g, '');

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(client.whatsapp);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Client = {
      ...client,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      cpfCnpj: cpfCnpj.trim() || undefined,
      cep: cep.trim() || undefined,
      endereco: endereco.trim() || undefined,
      numero: numero.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    };

    onUpdateClient?.(updated);
    setIsEditing(false);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  const handleSendWhatsappTemplate = (templateType: 'saudacao' | 'cobranca' | 'pos_venda' | 'orcamento') => {
    let msg = '';
    const firstName = client.name.split(' ')[0];

    switch (templateType) {
      case 'saudacao':
        msg = `Olá, *${firstName}*! 👋 Tudo bem?\nAqui é da *Silk Print Gráfica*. Como podemos te ajudar com impressões, banners ou materiais gráficos hoje?`;
        break;
      case 'cobranca':
        msg = `Olá, *${firstName}*! 💳 Passando para lembrar sobre a pendência financeira referente aos seus pedidos na *Silk Print Gráfica*. Total em aberto: *${formatCurrency(totalPendingAmount || totalSpentCalculated)}*. Qualquer dúvida estamos à disposição!`;
        break;
      case 'pos_venda':
        msg = `Olá, *${firstName}*! ✨ Esperamos que tenha gostado dos materiais recebidos da *Silk Print Gráfica*! Se precisar de novas tiragens ou orçamentos, conte conosco. Obrigado pela parceria! 🚀`;
        break;
      case 'orcamento':
        msg = `Olá, *${firstName}*! 📋 Temos novidades e condições especiais em materiais gráficos na *Silk Print Gráfica*. Gostaria de cotar novos itens hoje?`;
        break;
    }

    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat({
        clientName: client.name,
        clientPhone: client.whatsapp,
        initialMessage: msg,
      });
    } else {
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg font-mono">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">{client.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  ID: {client.id}
                </span>
                {ordersCountCalculated >= 3 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    VIP / Recorrente
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cliente cadastrado {client.createdAt ? `em ${formatDate(client.createdAt)}` : ''}
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
              type="button"
              onClick={() => {
                if (onOpenWhatsAppChat) {
                  onOpenWhatsAppChat({
                    clientName: client.name,
                    clientPhone: client.whatsapp,
                  });
                } else {
                  window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp (Evolution)</span>
            </button>

            <button
              onClick={() => onOpenNovoPedidoParaCliente?.(client)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <Package className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Novo Pedido</span>
            </button>

            <button
              onClick={() => onOpenNovoOrcamentoParaCliente?.(client)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Novo Orçamento</span>
            </button>

            <button
              onClick={() => onOpenNovaReceitaParaCliente?.(client)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lançar Receita</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('impressao')}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              title="Ficha Cadastral para Impressão"
            >
              <Printer className="w-4 h-4" />
            </button>

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
                title="Excluir Cliente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onDeleteClient?.(client.id);
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

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Total Comprado (LTV)</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {formatCurrency(totalSpentCalculated)}
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Pedidos Feitos</span>
            <span className="text-base font-bold font-mono text-zinc-100">
              {ordersCountCalculated}
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Ticket Médio</span>
            <span className="text-base font-bold font-mono text-blue-400">
              {formatCurrency(ticketMedio)}
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] text-zinc-400 block font-medium">Pendente / Aberto</span>
            <span
              className={`text-base font-bold font-mono ${
                totalPendingAmount > 0 ? 'text-amber-400' : 'text-zinc-500'
              }`}
            >
              {formatCurrency(totalPendingAmount)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-800 bg-zinc-900 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('cadastro')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cadastro'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cadastro & Contato
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Pedidos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
              {clientOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orcamentos')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orcamentos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Orçamentos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
              {clientQuotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financeiro')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'financeiro'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Financeiro</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
              {clientTransactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('impressao')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'impressao'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ficha Impressa
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* TAB 1: CADASTRO */}
          {activeTab === 'cadastro' && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome Completo / Razão Social *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        WhatsApp / Telefone *
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        CPF ou CNPJ
                      </label>
                      <input
                        type="text"
                        value={cpfCnpj}
                        onChange={(e) => setCpfCnpj(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Endereço (Rua, Av.)
                      </label>
                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Número e Complemento
                      </label>
                      <input
                        type="text"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Estado (UF)
                      </label>
                      <input
                        type="text"
                        value={estado}
                        maxLength={2}
                        onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Observações & Preferências
                    </label>
                    <textarea
                      rows={3}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Instruções de entrega, notas sobre faturamento ou preferências de arquivo..."
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
                  {/* WhatsApp Quick Message Templates */}
                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mensagens Rápidas de WhatsApp</span>
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{client.whatsapp}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <button
                        onClick={() => handleSendWhatsappTemplate('saudacao')}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 text-xs text-left transition-all"
                      >
                        <div className="font-semibold">👋 Saudação</div>
                        <div className="text-[10px] text-zinc-500">Como podemos ajudar?</div>
                      </button>
                      <button
                        onClick={() => handleSendWhatsappTemplate('orcamento')}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 text-xs text-left transition-all"
                      >
                        <div className="font-semibold">📋 Novo Orçamento</div>
                        <div className="text-[10px] text-zinc-500">Oferecer cotação</div>
                      </button>
                      <button
                        onClick={() => handleSendWhatsappTemplate('cobranca')}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 text-xs text-left transition-all"
                      >
                        <div className="font-semibold">💳 Cobrança / PIX</div>
                        <div className="text-[10px] text-zinc-500">Lembrar pendência</div>
                      </button>
                      <button
                        onClick={() => handleSendWhatsappTemplate('pos_venda')}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 text-xs text-left transition-all"
                      >
                        <div className="font-semibold">✨ Pós-Venda</div>
                        <div className="text-[10px] text-zinc-500">Agradecer pedido</div>
                      </button>
                    </div>
                  </div>

                  {/* Main Data Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contato */}
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Contato & Documentos</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">WhatsApp:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-zinc-200">{client.whatsapp}</span>
                            <button
                              onClick={handleCopyPhone}
                              className="p-1 hover:text-blue-400 text-zinc-500 transition-colors"
                              title="Copiar número"
                            >
                              {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">E-mail:</span>
                          <span className="text-zinc-200">{client.email || 'Não informado'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">CPF / CNPJ:</span>
                          <span className="font-mono text-zinc-200">{client.cpfCnpj || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>Endereço de Entrega</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start justify-between">
                          <span className="text-zinc-400">Logradouro:</span>
                          <span className="text-zinc-200 text-right">
                            {client.endereco ? `${client.endereco}, ${client.numero || 'S/N'}` : 'Não informado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Bairro:</span>
                          <span className="text-zinc-200">{client.bairro || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Cidade / UF:</span>
                          <span className="text-zinc-200">
                            {client.cidade ? `${client.cidade} - ${client.estado || ''}` : '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">CEP:</span>
                          <span className="font-mono text-zinc-200">{client.cep || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  {client.observacoes && (
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Observações Internas</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {client.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300">
                  Todos os Pedidos deste Cliente ({clientOrders.length})
                </h3>
                <button
                  onClick={() => onOpenNovoPedidoParaCliente?.(client)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Novo Pedido</span>
                </button>
              </div>

              {clientOrders.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 space-y-3">
                  <Package className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Nenhum pedido registrado para este cliente ainda.</p>
                  <button
                    onClick={() => onOpenNovoPedidoParaCliente?.(client)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Criar Primeiro Pedido</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientOrders.map((ord) => {
                    const st = STATUS_CONFIG[ord.status] || {
                      label: ord.status,
                      text: 'text-blue-400',
                      bg: 'bg-blue-500/10',
                      border: 'border-blue-500/25',
                      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      dotColor: 'bg-blue-500',
                      icon: '📦',
                    };
                    return (
                      <div
                        key={ord.id}
                        onClick={() => onOpenOrderDetails?.(ord)}
                        className="p-3.5 bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-300">
                            {ord.code}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-zinc-100 line-clamp-1">{ord.description}</div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span>📅 Entrega: {formatDate(ord.deliveryDate)}</span>
                              <span>•</span>
                              <span>{ord.itemsCount} itens</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${st.badgeBg || (st.bg + ' ' + st.text + ' ' + st.border)}`}
                          >
                            {st.label}
                          </span>
                          <span className="font-mono font-bold text-xs text-blue-400">
                            {formatCurrency(ord.total)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTÓRICO DE ORÇAMENTOS */}
          {activeTab === 'orcamentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300">
                  Orçamentos Solicitados ({clientQuotes.length})
                </h3>
                <button
                  onClick={() => onOpenNovoOrcamentoParaCliente?.(client)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Novo Orçamento</span>
                </button>
              </div>

              {clientQuotes.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 space-y-3">
                  <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Nenhum orçamento emitido para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-xs text-zinc-100">
                          {q.number || q.code || `Orçamento #${q.id.slice(-4)}`}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {q.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          Emitido em: {formatDate(q.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            q.status === 'aprovado' || q.status === 'convertido'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {q.status}
                        </span>
                        <span className="font-mono font-bold text-xs text-zinc-200">
                          {formatCurrency(q.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300">
                  Lançamentos Financeiros Vinculados ({clientTransactions.length})
                </h3>
                <button
                  onClick={() => onOpenNovaReceitaParaCliente?.(client)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Nova Receita</span>
                </button>
              </div>

              {clientTransactions.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 space-y-3">
                  <DollarSign className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Nenhum lançamento financeiro individual vinculado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => onOpenTransactionDetails?.(tx)}
                      className="p-3.5 bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-zinc-700"
                    >
                      <div>
                        <div className="font-semibold text-xs text-zinc-100">{tx.description}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {tx.paymentMethod || 'PIX'} • Venc: {tx.dueDate ? formatDate(tx.dueDate) : formatDate(tx.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === 'pago'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            tx.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.value)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FICHA IMPRESSA */}
          {activeTab === 'impressao' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs text-zinc-400">Prévia da Ficha Cadastral para Impressão</span>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Agora</span>
                </button>
              </div>

              {/* Printable Card Area */}
              <div className="p-6 bg-white text-zinc-900 rounded-xl border border-zinc-300 font-sans space-y-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-zinc-300 pb-4">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-zinc-950">SILK PRINT GRÁFICA</h2>
                    <p className="text-[11px] text-zinc-600">Ficha Cadastral e Histórico do Cliente</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-zinc-900">ID: {client.id}</div>
                    <div className="text-zinc-500 text-[10px]">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-bold uppercase">Nome do Cliente</span>
                    <span className="font-bold text-zinc-900 text-sm">{client.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-bold uppercase">WhatsApp / Contato</span>
                    <span className="font-semibold text-zinc-900">{client.whatsapp}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-bold uppercase">E-mail</span>
                    <span className="text-zinc-800">{client.email || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-bold uppercase">CPF / CNPJ</span>
                    <span className="font-mono text-zinc-800">{client.cpfCnpj || 'Não informado'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500 block text-[10px] font-bold uppercase">Endereço de Entrega</span>
                    <span className="text-zinc-800">
                      {client.endereco
                        ? `${client.endereco}, ${client.numero || 'S/N'} - ${client.bairro || ''}, ${client.cidade || ''}/${client.estado || ''} - CEP: ${client.cep || ''}`
                        : 'Não cadastrado'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-zinc-100 rounded">
                    <div className="text-[10px] text-zinc-500">Total Histórico (LTV)</div>
                    <div className="font-bold text-zinc-950 font-mono">{formatCurrency(totalSpentCalculated)}</div>
                  </div>
                  <div className="p-2 bg-zinc-100 rounded">
                    <div className="text-[10px] text-zinc-500">Pedidos Concluídos</div>
                    <div className="font-bold text-zinc-950 font-mono">{ordersCountCalculated}</div>
                  </div>
                  <div className="p-2 bg-zinc-100 rounded">
                    <div className="text-[10px] text-zinc-500">Ticket Médio</div>
                    <div className="font-bold text-zinc-950 font-mono">{formatCurrency(ticketMedio)}</div>
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
