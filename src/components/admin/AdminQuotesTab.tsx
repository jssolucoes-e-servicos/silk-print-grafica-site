import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Share2,
  Printer,
  Trash2,
  Eye,
  Send,
  User,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Package,
  Ruler,
  AlertCircle,
  Copy,
  ChevronDown
} from 'lucide-react';
import { Product } from '../../types';

export interface QuoteItem {
  id: string;
  name: string;
  category: string;
  type: 'catalogo' | 'm2' | 'interno' | 'personalizado';
  quantity: number;
  unitPrice: number;
  total: number;
  widthCm?: number;
  heightCm?: number;
  m2Total?: number;
  finishingNotes?: string;
}

export interface Quote {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  clientDocument?: string;
  clientEmail?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'convertido';
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  deadlineDays: number;
  validUntil: string;
  notes: string;
  createdAt: string;
}

interface AdminQuotesTabProps {
  products?: Product[];
  onConvertToOrder?: (quote: Quote) => void;
}

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'orc-101',
    code: 'ORC-2026-1042',
    clientName: 'Dra. Camila Torres',
    clientPhone: '11988776655',
    clientDocument: '234.567.890-12',
    clientEmail: 'camila.torres@odonto.com.br',
    status: 'pendente',
    items: [
      {
        id: 'item-1',
        name: 'Cartão de Visita Couché 300g 4x4',
        category: 'Cartões de Visita',
        type: 'catalogo',
        quantity: 1000,
        unitPrice: 0.089,
        total: 89.0,
        finishingNotes: 'Laminação Fosca Bopp + Verniz UV Localizado Frente e Verso'
      }
    ],
    subtotal: 89.0,
    discount: 0,
    shippingFee: 15.0,
    total: 104.0,
    deadlineDays: 2,
    validUntil: '2026-09-25',
    notes: 'Cliente solicitou entrega no balcão de Santo Amaro.',
    createdAt: '2026-09-14'
  },
  {
    id: 'orc-102',
    code: 'ORC-2026-1043',
    clientName: 'Restaurante & Hamburgueria Sabor Real',
    clientPhone: '11977665544',
    clientDocument: '12.345.678/0001-90',
    clientEmail: 'contato@saborreal.com.br',
    status: 'aprovado',
    items: [
      {
        id: 'item-2',
        name: 'Banner Fachada Lona 440g com Brilho',
        category: 'Comunicação Visual',
        type: 'm2',
        widthCm: 200,
        heightCm: 100,
        m2Total: 2.0,
        quantity: 2,
        unitPrice: 65.0,
        total: 260.0,
        finishingNotes: 'Bainha reforçada com solda térmica + Ilhós a cada 30cm nas pontas'
      },
      {
        id: 'item-3',
        name: 'Cardápio Couché 300g Laminação Fosca A4',
        category: 'Cardápios & Folders',
        type: 'catalogo',
        quantity: 50,
        unitPrice: 4.5,
        total: 225.0,
        finishingNotes: 'Laminação Fosca 2 lados com vinco central'
      }
    ],
    subtotal: 485.0,
    discount: 25.0,
    shippingFee: 0,
    total: 460.0,
    deadlineDays: 3,
    validUntil: '2026-09-28',
    notes: 'Pagamento: 50% de entrada via PIX e 50% na retirada.',
    createdAt: '2026-09-13'
  },
  {
    id: 'orc-103',
    code: 'ORC-2026-1044',
    clientName: 'Academia Corpo & Movimento',
    clientPhone: '11999887711',
    clientDocument: '34.567.890/0001-11',
    clientEmail: 'financeiro@corpoemovimento.com',
    status: 'convertido',
    items: [
      {
        id: 'item-4',
        name: 'Panfletos Couché 90g 10x14cm 4x0',
        category: 'Panfletos & Flyers',
        type: 'catalogo',
        quantity: 5000,
        unitPrice: 0.038,
        total: 190.0,
        finishingNotes: 'Refile padrão gráfico'
      }
    ],
    subtotal: 190.0,
    discount: 10.0,
    shippingFee: 20.0,
    total: 200.0,
    deadlineDays: 2,
    validUntil: '2026-09-20',
    notes: 'Pedido gerado sob OS-2026-883.',
    createdAt: '2026-09-12'
  }
];

export const AdminQuotesTab: React.FC<AdminQuotesTabProps> = ({
  products = [],
  onConvertToOrder
}) => {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('silkprint_erp_quotes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_QUOTES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | Quote['status']>('todos');
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);

  // New Quote Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(2);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Orçamento válido por 7 dias. Produção iniciada após aprovação formal da arte.');
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  // Items currently being added
  const [stagedItems, setStagedItems] = useState<QuoteItem[]>([]);
  const [itemType, setItemType] = useState<'catalogo' | 'm2' | 'personalizado'>('catalogo');

  // Fields for M²
  const [m2Name, setM2Name] = useState('Banner Lona 440g Fosca');
  const [m2Width, setM2Width] = useState(100);
  const [m2Height, setM2Height] = useState(100);
  const [m2UnitPrice, setM2UnitPrice] = useState(55);
  const [m2Qty, setM2Qty] = useState(1);
  const [m2Finishing, setM2Finishing] = useState('Bainha e Ilhós');

  // Fields for Catalog
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(null);
  const [catalogQty, setCatalogQty] = useState(1000);
  const [catalogPrice, setCatalogPrice] = useState(89);

  // Fields for Custom
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [customNotes, setCustomNotes] = useState('');

  const saveQuotesToStorage = (updated: Quote[]) => {
    setQuotes(updated);
    localStorage.setItem('silkprint_erp_quotes', JSON.stringify(updated));
  };

  const handleAddStagedCatalogItem = () => {
    if (!selectedCatalogProduct) return;
    const total = catalogPrice;
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: selectedCatalogProduct.name,
      category: selectedCatalogProduct.category || 'Catálogo',
      type: 'catalogo',
      quantity: catalogQty,
      unitPrice: total / (catalogQty || 1),
      total,
      finishingNotes: selectedCatalogProduct.finishings?.join(', ') || 'Padrão'
    };
    setStagedItems([...stagedItems, newItem]);
  };

  const handleAddStagedM2Item = () => {
    const areaM2 = (m2Width / 100) * (m2Height / 100);
    const itemTotal = areaM2 * m2UnitPrice * m2Qty;
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: `${m2Name} (${m2Width}x${m2Height}cm)`,
      category: 'Comunicação Visual M²',
      type: 'm2',
      widthCm: m2Width,
      heightCm: m2Height,
      m2Total: Number(areaM2.toFixed(3)),
      quantity: m2Qty,
      unitPrice: m2UnitPrice,
      total: Number(itemTotal.toFixed(2)),
      finishingNotes: m2Finishing
    };
    setStagedItems([...stagedItems, newItem]);
  };

  const handleAddStagedCustomItem = () => {
    if (!customName.trim()) return;
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: customName,
      category: 'Serviço Personalizado',
      type: 'personalizado',
      quantity: customQty,
      unitPrice: customPrice,
      total: Number((customQty * customPrice).toFixed(2)),
      finishingNotes: customNotes
    };
    setStagedItems([...stagedItems, newItem]);
    setCustomName('');
    setCustomPrice(0);
    setCustomNotes('');
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems(stagedItems.filter((i) => i.id !== id));
  };

  const stagedSubtotal = stagedItems.reduce((acc, item) => acc + item.total, 0);
  const stagedTotal = Math.max(0, stagedSubtotal - Number(discount || 0) + Number(shippingFee || 0));

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }
    if (stagedItems.length === 0) {
      alert('Adicione pelo menos um item ao orçamento.');
      return;
    }

    const code = `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quote = {
      id: `orc-${Date.now()}`,
      code,
      clientName: clientName.trim(),
      clientPhone: clientPhone.replace(/\D/g, ''),
      clientDocument: clientDocument.trim(),
      clientEmail: clientEmail.trim(),
      status: 'pendente',
      items: stagedItems,
      subtotal: stagedSubtotal,
      discount: Number(discount) || 0,
      shippingFee: Number(shippingFee) || 0,
      total: stagedTotal,
      deadlineDays: Number(deadlineDays) || 2,
      validUntil,
      notes: notes.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveQuotesToStorage([newQuote, ...quotes]);
    setIsNewQuoteModalOpen(false);

    // Reset Form
    setClientName('');
    setClientPhone('');
    setClientDocument('');
    setClientEmail('');
    setStagedItems([]);
    setDiscount(0);
    setShippingFee(0);
  };

  const handleSendWhatsApp = (quote: Quote) => {
    const phone = quote.clientPhone.replace(/\D/g, '');
    const itemsText = quote.items
      .map(
        (it, idx) =>
          `• *Item ${idx + 1}:* ${it.name} | Qtd: ${it.quantity} un | Subtotal: R$ ${it.total.toFixed(2)}${
            it.finishingNotes ? ` (${it.finishingNotes})` : ''
          }`
      )
      .join('\n');

    const message = `Olá, *${quote.clientName}*! 👋\nAqui está a sua proposta comercial da *Silk Print Gráfica*:\n\n📄 *Orçamento:* ${quote.code}\n📅 *Validade:* até ${quote.validUntil}\n⏱️ *Prazo de Produção:* ${quote.deadlineDays} dias úteis\n\n*Itens Solicitados:*\n${itemsText}\n\n💵 *Subtotal:* R$ ${quote.subtotal.toFixed(2)}\n🏷️ *Desconto:* R$ ${quote.discount.toFixed(2)}\n🚚 *Frete/Entrega:* R$ ${quote.shippingFee.toFixed(2)}\n⭐ *VALOR TOTAL:* R$ ${quote.total.toFixed(2)}\n\n📌 *Condições:* ${quote.notes}\n\nPara aprovar sua proposta e enviar o arquivo de impressão para pré-análise CTP, basta responder este WhatsApp!`;

    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    const updated = quotes.map((q) => (q.id === id ? { ...q, status } : q));
    saveQuotesToStorage(updated);
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta comercial?')) {
      const updated = quotes.filter((q) => q.id !== id);
      saveQuotesToStorage(updated);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-quotes-tab" className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Orçamentos & Propostas Comerciais
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geração de orçamentos rápidos por m², catálogo ou serviço sob medida com envio instantâneo no WhatsApp e impressão A4.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewQuoteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento Rápido
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Propostas</span>
          <div className="text-2xl font-black text-white mt-1">{quotes.length}</div>
          <span className="text-[10px] text-cyan-400">cadastradas no ERP</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Em Aberto</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {quotes.filter((q) => q.status === 'pendente').length}
          </div>
          <span className="text-[10px] text-slate-400">aguardando cliente</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Aprovados</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {quotes.filter((q) => q.status === 'aprovado' || q.status === 'convertido').length}
          </div>
          <span className="text-[10px] text-slate-400">prontos para O.S.</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Volume em Negociação</span>
          <div className="text-2xl font-black text-white mt-1">
            R${' '}
            {quotes
              .filter((q) => q.status === 'pendente' || q.status === 'aprovado')
              .reduce((acc, q) => acc + q.total, 0)
              .toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">pipeline ativo</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, código ORC ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="convertido">Convertido em Pedido</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Proposta</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Itens Principais</th>
                <th className="py-3 px-4">Prazo</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Nenhum orçamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <div>{q.code}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{q.createdAt}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{q.clientName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {q.clientPhone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="truncate text-slate-200 font-medium">
                        {q.items.map((i) => `${i.quantity}x ${i.name}`).join(' | ')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {q.items.length} {q.items.length === 1 ? 'item' : 'itens'} adicionados
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-200">{q.deadlineDays} dias úteis</span>
                      <div className="text-[10px] text-slate-500">Válido até {q.validUntil}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-sm font-black text-white">R$ {q.total.toFixed(2)}</div>
                      {q.discount > 0 && (
                        <div className="text-[10px] text-emerald-400">Desc: R$ {q.discount.toFixed(2)}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          q.status === 'aprovado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : q.status === 'convertido'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : q.status === 'pendente'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {q.status === 'aprovado' && <CheckCircle2 className="w-3 h-3" />}
                        {q.status === 'convertido' && <Layers className="w-3 h-3" />}
                        {q.status === 'pendente' && <Clock className="w-3 h-3" />}
                        {q.status === 'rejeitado' && <XCircle className="w-3 h-3" />}
                        {q.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Send */}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(q)}
                          title="Enviar proposta no WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-800 hover:text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Proposal */}
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteForPrint(q)}
                          title="Visualizar e Imprimir Proposta"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Convert to Order */}
                        {q.status === 'aprovado' && onConvertToOrder && (
                          <button
                            type="button"
                            onClick={() => {
                              onConvertToOrder(q);
                              handleUpdateStatus(q.id, 'convertido');
                            }}
                            title="Converter em Pedido / Ordem de Serviço"
                            className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 hover:bg-cyan-700 hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Change Status Dropdown */}
                        <select
                          value={q.status}
                          onChange={(e) => handleUpdateStatus(q.id, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-1 py-1 focus:outline-none"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="aprovado">Aprovar</option>
                          <option value="convertido">Convertido</option>
                          <option value="rejeitado">Rejeitar</option>
                        </select>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(q.id)}
                          title="Excluir proposta"
                          className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO ORÇAMENTO RÁPIDO */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Criar Nova Proposta Comercial Gráfica</h3>
                  <p className="text-xs text-slate-400">Preencha os dados do cliente e monte os itens do orçamento.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewQuoteModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="p-6 space-y-6">
              {/* Client Info Grid */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> 1. Dados do Cliente
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome / Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva ME"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">WhatsApp / Telefone *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">CPF ou CNPJ</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={clientDocument}
                      onChange={(e) => setClientDocument(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="contato@cliente.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items Builder */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 2. Adicionar Itens à Proposta
                  </span>

                  {/* Mode selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setItemType('catalogo')}
                      className={`px-2.5 py-1 rounded font-bold ${
                        itemType === 'catalogo' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Do Catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemType('m2')}
                      className={`px-2.5 py-1 rounded font-bold ${
                        itemType === 'm2' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Por M² (Lonas / Adesivos)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemType('personalizado')}
                      className={`px-2.5 py-1 rounded font-bold ${
                        itemType === 'personalizado' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Item Sob Medida
                    </button>
                  </div>
                </div>

                {/* Sub-form based on itemType */}
                {itemType === 'catalogo' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Selecionar Produto</label>
                      <select
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          if (prod) {
                            setSelectedCatalogProduct(prod);
                            setCatalogPrice(prod.price || 50);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="">Selecione um produto do catálogo...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category}) - R$ {p.price?.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Tiragem / Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={catalogQty}
                        onChange={(e) => setCatalogQty(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Valor Total (R$)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={catalogPrice}
                          onChange={(e) => setCatalogPrice(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleAddStagedCatalogItem}
                          disabled={!selectedCatalogProduct}
                          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shrink-0"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {itemType === 'm2' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Tipo de Mídia / Lona</label>
                        <select
                          value={m2Name}
                          onChange={(e) => setM2Name(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="Banner Lona 440g Fosca">Banner Lona 440g Fosca</option>
                          <option value="Banner Lona 440g Brilho">Banner Lona 440g Brilho</option>
                          <option value="Faixa Lona Frontlight 380g">Faixa Lona Frontlight 380g</option>
                          <option value="Adesivo Vinil Brilho Impressão Digital">Adesivo Vinil Brilho Digital</option>
                          <option value="Adesivo Vinil Fosco Impressão Digital">Adesivo Vinil Fosco Digital</option>
                          <option value="Adesivo Perfurado para Vidros">Adesivo Perfurado para Vidros</option>
                          <option value="Lona Backlight para Luminosos">Lona Backlight para Luminosos</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Largura (cm)</label>
                          <input
                            type="number"
                            min="10"
                            value={m2Width}
                            onChange={(e) => setM2Width(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Altura (cm)</label>
                          <input
                            type="number"
                            min="10"
                            value={m2Height}
                            onChange={(e) => setM2Height(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Preço / m²</label>
                          <input
                            type="number"
                            value={m2UnitPrice}
                            onChange={(e) => setM2UnitPrice(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Peças</label>
                          <input
                            type="number"
                            min="1"
                            value={m2Qty}
                            onChange={(e) => setM2Qty(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Área Calc.</label>
                          <div className="text-xs font-bold text-cyan-400 py-2">
                            {((m2Width / 100) * (m2Height / 100) * m2Qty).toFixed(2)} m²
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Acabamentos da Lona/Vinil</label>
                        <input
                          type="text"
                          placeholder="Ex: Bainha reforçada + Ilhós a cada 30cm nas pontas"
                          value={m2Finishing}
                          onChange={(e) => setM2Finishing(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddStagedM2Item}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold mt-5 shrink-0"
                      >
                        + Adicionar M²
                      </button>
                    </div>
                  </div>
                )}

                {itemType === 'personalizado' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição do Serviço</label>
                      <input
                        type="text"
                        placeholder="Ex: Confecção de Faca de Corte Especial"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Detalhes / Obs</label>
                      <input
                        type="text"
                        placeholder="Ex: Lâmina 2pt para papel cartão"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Qtd</label>
                        <input
                          type="number"
                          min="1"
                          value={customQty}
                          onChange={(e) => setCustomQty(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Unit. R$</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStagedCustomItem}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                    >
                      Adicionar Item
                    </button>
                  </div>
                )}

                {/* Staged Items List */}
                <div className="border border-slate-800 rounded-xl overflow-hidden mt-4">
                  <div className="bg-slate-900 px-3 py-2 text-[11px] font-bold text-slate-300 uppercase">
                    Itens Inclusos na Proposta ({stagedItems.length})
                  </div>
                  {stagedItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Nenhum item adicionado ainda. Escolha uma modalidade acima e clique em Adicionar.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800 text-xs">
                      {stagedItems.map((item, idx) => (
                        <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-900/40">
                          <div>
                            <span className="font-bold text-white">
                              {idx + 1}. {item.name}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              Qtd: {item.quantity} un {item.finishingNotes && `| Acabamento: ${item.finishingNotes}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-cyan-400 font-mono">R$ {item.total.toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedItem(item.id)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Totals and Commercial Conditions */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 3. Prazos, Frete & Totais
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Prazo de Produção</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-bold"
                      />
                      <span className="text-xs text-slate-400 whitespace-nowrap">dias úteis</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Validade da Proposta</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Desconto Especial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Frete / Entrega (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Condições & Observações</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Final Total Summary */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-sm">
                  <span className="text-slate-400 font-bold">Total do Orçamento:</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">
                    R$ {stagedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-lg shadow-cyan-600/25 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAÇÃO / IMPRESSÃO DE PROPOSTA COMERCIAL A4 */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl p-8 my-8 font-sans space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="text-xs text-slate-500 uppercase font-bold">
                Visualização de Impressão Oficial A4
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Gerar PDF
                </button>
                <button
                  onClick={() => setSelectedQuoteForPrint(null)}
                  className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Header with Graphic Logo */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">SILK PRINT GRÁFICA</h1>
                <p className="text-xs text-slate-600">Parque Gráfico & Soluções em Impressão Offset e Digital</p>
                <p className="text-[11px] text-slate-500">CNPJ: 00.000.000/0001-00 | Tel/WhatsApp: (11) 99999-9999</p>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-slate-900">{selectedQuoteForPrint.code}</div>
                <div className="text-xs text-slate-600">Data: {selectedQuoteForPrint.createdAt}</div>
                <div className="text-xs text-slate-600 font-bold">Validade: {selectedQuoteForPrint.validUntil}</div>
              </div>
            </div>

            {/* Client Card */}
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 text-xs">
              <div className="font-bold uppercase text-slate-700 mb-1">DADOS DO CLIENTE:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold">Nome:</span> {selectedQuoteForPrint.clientName}
                </div>
                <div>
                  <span className="font-bold">Contato:</span> {selectedQuoteForPrint.clientPhone}
                </div>
                {selectedQuoteForPrint.clientDocument && (
                  <div>
                    <span className="font-bold">CPF/CNPJ:</span> {selectedQuoteForPrint.clientDocument}
                  </div>
                )}
                {selectedQuoteForPrint.clientEmail && (
                  <div>
                    <span className="font-bold">E-mail:</span> {selectedQuoteForPrint.clientEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-200 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Item</th>
                  <th className="p-2 border-r border-slate-300">Especificação Gráfica & Acabamento</th>
                  <th className="p-2 text-center border-r border-slate-300">Qtd</th>
                  <th className="p-2 text-right border-r border-slate-300">Unitário</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {selectedQuoteForPrint.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="p-2 font-bold border-r border-slate-300">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300">
                      <div className="font-bold">{it.name}</div>
                      {it.finishingNotes && (
                        <div className="text-[10px] text-slate-600">{it.finishingNotes}</div>
                      )}
                    </td>
                    <td className="p-2 text-center border-r border-slate-300 font-bold">{it.quantity}</td>
                    <td className="p-2 text-right border-r border-slate-300">
                      R$ {it.unitPrice?.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-black font-mono">
                      R$ {it.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-between items-start pt-2">
              <div className="max-w-md text-xs space-y-1">
                <div className="font-bold text-slate-800">Prazo de Produção:</div>
                <div className="text-slate-600">
                  {selectedQuoteForPrint.deadlineDays} dias úteis após a aprovação formal do arquivo digital.
                </div>
                <div className="font-bold text-slate-800 mt-2">Condições Comerciais:</div>
                <div className="text-slate-600">{selectedQuoteForPrint.notes}</div>
              </div>

              <div className="w-64 bg-slate-100 p-3 rounded border border-slate-300 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">R$ {selectedQuoteForPrint.subtotal.toFixed(2)}</span>
                </div>
                {selectedQuoteForPrint.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto:</span>
                    <span>- R$ {selectedQuoteForPrint.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete / Entrega:</span>
                  <span>R$ {selectedQuoteForPrint.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-400 pt-1 text-sm font-black text-slate-900">
                  <span>TOTAL GERAL:</span>
                  <span>R$ {selectedQuoteForPrint.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t flex justify-between text-[11px] text-slate-600 text-center">
              <div>
                <div className="w-48 border-t border-black mb-1 mx-auto" />
                <span>Silk Print Gráfica</span>
              </div>

              <div>
                <div className="w-48 border-t border-black mb-1 mx-auto" />
                <span>De Acordo do Cliente</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
