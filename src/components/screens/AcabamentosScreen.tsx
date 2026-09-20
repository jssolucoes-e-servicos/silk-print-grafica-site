import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Edit2,
  Layers,
  Clock,
  Shirt,
  FileText,
  Eye,
  DollarSign,
  Info,
  Tag,
  Sparkles,
} from 'lucide-react';
import { FinishingItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const LINK_GROUPS = [
  { id: 'all', label: 'Todos os Grupos', icon: Layers },
  { id: 'textil', label: 'Confecção & Têxtil (Camisetas, Polos, Uniformes)', icon: Shirt },
  { id: 'papelaria', label: 'Papelaria & Gráfica (Cartões, Folders, Pastas)', icon: FileText },
  { id: 'comunicacao_visual', label: 'Comunicação Visual (Lonas, Banners, Adesivos)', icon: Tag },
  { id: 'brindes', label: 'Brindes & Personalizados (Canecas, Copos, Squeezes)', icon: Sparkles },
  { id: 'geral', label: 'Geral / Todos os Produtos', icon: Info },
] as const;

export const GROUP_LABELS: Record<string, string> = {
  textil: 'Confecção & Têxtil',
  papelaria: 'Papelaria & Gráfica',
  comunicacao_visual: 'Comunicação Visual',
  brindes: 'Brindes & Personalizados',
  geral: 'Geral / Universal',
};

interface AcabamentosScreenProps {
  finishings: FinishingItem[];
  onAddFinishing: (finishing: FinishingItem) => void;
  onUpdateFinishing?: (finishing: FinishingItem) => void;
  onRemoveFinishing: (id: string) => void;
}

export const AcabamentosScreen: React.FC<AcabamentosScreenProps> = ({
  finishings,
  onAddFinishing,
  onUpdateFinishing,
  onRemoveFinishing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<FinishingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for modal (both Add and Edit)
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Confecção & Têxtil');
  const [formLinkGroup, setFormLinkGroup] = useState<'textil' | 'papelaria' | 'comunicacao_visual' | 'brindes' | 'geral'>('textil');
  const [formPricingType, setFormPricingType] = useState<'unidade' | 'm2' | 'fixo'>('unidade');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formExtraDays, setFormExtraDays] = useState('0');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Open modal for new finishing
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Confecção & Têxtil');
    setFormLinkGroup('textil');
    setFormPricingType('unidade');
    setFormPrice('');
    setFormCost('');
    setFormExtraDays('0');
    setFormDescription('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  // Open modal for editing existing finishing
  const handleOpenEdit = (fin: FinishingItem) => {
    setEditingItem(fin);
    setFormName(fin.name);
    setFormCategory(fin.category || 'Geral');
    setFormLinkGroup((fin.linkGroup as any) || 'textil');
    setFormPricingType(fin.pricingType || 'unidade');
    setFormPrice(fin.price ? fin.price.toString() : '0');
    setFormCost(fin.cost !== undefined ? fin.cost.toString() : '');
    setFormExtraDays(fin.extraDays !== undefined ? fin.extraDays.toString() : '0');
    setFormDescription(fin.description || '');
    setFormActive(fin.active !== false && fin.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const priceNum = parseFloat(formPrice.replace(',', '.')) || 0;
    const costNum = formCost.trim() ? parseFloat(formCost.replace(',', '.')) : undefined;
    const extraDaysNum = parseInt(formExtraDays, 10) || 0;

    if (editingItem) {
      // Update existing
      const updated: FinishingItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory.trim(),
        linkGroup: formLinkGroup,
        pricingType: formPricingType,
        price: priceNum,
        cost: costNum,
        extraDays: Math.max(0, extraDaysNum),
        description: formDescription.trim() || undefined,
        active: formActive,
        isActive: formActive,
        unit: formPricingType === 'm2' ? 'm²' : formPricingType === 'fixo' ? 'serviço' : 'un',
      };
      onUpdateFinishing?.(updated);
    } else {
      // Create new
      const created: FinishingItem = {
        id: `acab-${Date.now()}`,
        name: formName.trim(),
        category: formCategory.trim(),
        linkGroup: formLinkGroup,
        pricingType: formPricingType,
        price: priceNum,
        cost: costNum,
        extraDays: Math.max(0, extraDaysNum),
        description: formDescription.trim() || undefined,
        active: formActive,
        isActive: formActive,
        unit: formPricingType === 'm2' ? 'm²' : formPricingType === 'fixo' ? 'serviço' : 'un',
      };
      onAddFinishing(created);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Filtered list
  const filteredFinishings = useMemo(() => {
    return finishings.filter((f) => {
      const matchSearch =
        !searchTerm.trim() ||
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchGroup =
        selectedGroup === 'all' ||
        f.linkGroup === selectedGroup ||
        (!f.linkGroup && selectedGroup === 'geral');

      return matchSearch && matchGroup;
    });
  }, [finishings, searchTerm, selectedGroup]);

  // Counts by group
  const totalCount = finishings.length;
  const textilCount = finishings.filter((f) => f.linkGroup === 'textil').length;
  const papelariaCount = finishings.filter((f) => f.linkGroup === 'papelaria').length;
  const cvCount = finishings.filter((f) => f.linkGroup === 'comunicacao_visual').length;
  const brindesCount = finishings.filter((f) => f.linkGroup === 'brindes').length;

  return (
    <div id="screen-acabamentos" className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Gestão de Acabamentos & Opcionais
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
              Cadastre e edite acabamentos com grupos de vínculo, valores globais e prazos adicionais em dias úteis.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Acabamento</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
          <div className="text-[11px] text-zinc-400 font-medium">Total de Acabamentos</div>
          <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">{totalCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
          <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <Shirt className="w-3 h-3" />
            <span>Confecção & Têxtil</span>
          </div>
          <div className="text-xl font-bold text-purple-300 font-mono mt-0.5">{textilCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
          <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Papelaria & Gráfica</span>
          </div>
          <div className="text-xl font-bold text-blue-300 font-mono mt-0.5">{papelariaCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Comunicação Visual</span>
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono mt-0.5">{cvCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar acabamento por nome, categoria ou descrição..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 transition-all"
            />
          </div>

          <div className="text-xs text-zinc-400 font-medium self-end md:self-auto">
            Exibindo <span className="font-bold text-zinc-200">{filteredFinishings.length}</span> acabamentos
          </div>
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {LINK_GROUPS.map((grp) => {
            const IconComp = grp.icon;
            const isSelected = selectedGroup === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => setSelectedGroup(grp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{grp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Finishings Grid */}
      {filteredFinishings.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-800/80 rounded-2xl text-center space-y-3 bg-zinc-950/40">
          <Scissors className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-semibold text-zinc-300">Nenhum acabamento encontrado</div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchTerm || selectedGroup !== 'all'
              ? 'Tente ajustar os filtros ou termo de busca acima.'
              : 'Cadastre o primeiro acabamento clicando no botão "Novo Acabamento" acima.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Acabamento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFinishings.map((item) => {
            const isTextil = item.linkGroup === 'textil';
            const extraDaysNum = item.extraDays || 0;
            const margin =
              item.cost && item.price > 0
                ? (((item.price - item.cost) / item.price) * 100).toFixed(0)
                : null;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                {/* Header & Badges */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isTextil
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : item.linkGroup === 'papelaria'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                              : item.linkGroup === 'comunicacao_visual'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {GROUP_LABELS[item.linkGroup || 'geral'] || item.linkGroup}
                        </span>

                        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-zinc-100 mt-1.5 leading-snug group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-zinc-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors"
                        title="Editar Acabamento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/40 p-1 rounded-lg">
                          <button
                            onClick={() => {
                              onRemoveFinishing(item.id);
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 text-[10px] font-bold"
                            title="Confirmar Exclusão"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-zinc-400 hover:text-zinc-200 text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Pricing & Production Days Footer */}
                <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Prazo Adicional:</span>
                    </span>
                    <span
                      className={`font-semibold font-mono ${
                        extraDaysNum > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {extraDaysNum > 0
                        ? `+${extraDaysNum} ${extraDaysNum === 1 ? 'dia útil' : 'dias úteis'}`
                        : '0 dias úteis (imediato)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500">
                        {item.pricingType === 'fixo'
                          ? 'Setup / Valor Fixo'
                          : item.pricingType === 'm2'
                          ? 'Por Metro Quadrado (m²)'
                          : 'Por Unidade'}
                        {item.cost ? ` • Custo: ${formatCurrency(item.cost)}` : ''}
                      </div>
                      {margin && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Margem: {margin}%
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-purple-300">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Adicionar / Editar Acabamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {editingItem ? 'Editar Acabamento' : 'Novo Acabamento & Opcional'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Defina nome, grupo de vínculo, valores globais e prazo em dias úteis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4 overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Acabamento / Opcional *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Dobra e Embalagem Individual em Saquinho"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Grupo de Vínculo e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Grupo de Vínculo do Produto *
                  </label>
                  <select
                    value={formLinkGroup}
                    onChange={(e) => setFormLinkGroup(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="textil">👕 Confecção & Têxtil (Camisetas, Polos, Uniformes)</option>
                    <option value="papelaria">📄 Papelaria & Gráfica (Cartões, Tags, Folders)</option>
                    <option value="comunicacao_visual">🏷️ Comunicação Visual (Lonas, Banners, Adesivos)</option>
                    <option value="brindes">✨ Brindes & Personalizados (Canecas, Copos)</option>
                    <option value="geral">🌐 Geral / Todos os Produtos</option>
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Define em quais tipos de produtos este acabamento será sugerido.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoria Interna
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Embalagem & Apresentação"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Preço de Venda, Custo e Tipo de Precificação */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tipo de Cobrança
                  </label>
                  <select
                    value={formPricingType}
                    onChange={(e) => setFormPricingType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="unidade">Por Peça / Unidade</option>
                    <option value="m2">Por Metro Quadrado (m²)</option>
                    <option value="fixo">Fixo por Pedido (Setup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Preço de Venda Padrão (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Prazo de Produção Adicional (NUMERAL DIAS ÚTEIS) */}
              <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-zinc-200">
                  Prazo de Produção Adicional (Dias Úteis) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-36">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={formExtraDays}
                      onChange={(e) => setFormExtraDays(e.target.value)}
                      required
                      className="w-full pl-3 pr-14 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-mono font-bold focus:outline-hidden focus:border-purple-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 pointer-events-none">
                      dias
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {parseInt(formExtraDays, 10) === 0
                      ? 'Nenhum acréscimo de prazo (produz no mesmo dia)'
                      : `Acrescenta +${formExtraDays} ${
                          parseInt(formExtraDays, 10) === 1 ? 'dia útil' : 'dias úteis'
                        } ao prazo do pedido.`}
                  </span>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição Técnica / Comercial
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Instruções de aplicação ou detalhes que aparecem para o cliente e operador..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Status Ativo */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Acabamento Ativo</div>
                  <p className="text-[11px] text-zinc-400">
                    Disponível para vincular a produtos e orçamentos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Salvar Alterações' : 'Cadastrar Acabamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

