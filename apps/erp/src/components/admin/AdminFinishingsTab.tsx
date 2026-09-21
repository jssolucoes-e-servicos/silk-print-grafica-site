import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  DollarSign,
  Tag
} from 'lucide-react';

export interface FinishingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  pricingType: 'unidade' | 'm2' | 'fixo';
  isActive: boolean;
  description?: string;
}

const INITIAL_FINISHINGS: FinishingItem[] = [
  {
    id: 'fin-1',
    name: 'Laminação Fosca Bopp (2 Lados)',
    category: 'Laminação & Plastificação',
    price: 0.045,
    pricingType: 'unidade',
    isActive: true,
    description: 'Toque aveludado de proteção fosca térmica'
  },
  {
    id: 'fin-2',
    name: 'Verniz UV Localizado Frente e Verso',
    category: 'Vernizes & Efeitos',
    price: 0.065,
    pricingType: 'unidade',
    isActive: true,
    description: 'Brilho pontual com máscara digital ou serigráfica'
  },
  {
    id: 'fin-3',
    name: 'Bainha Reforçada com Solda Térmica',
    category: 'Comunicação Visual (Lonas)',
    price: 8.5,
    pricingType: 'm2',
    isActive: true,
    description: 'Reforço de borda para tensão e vento'
  },
  {
    id: 'fin-4',
    name: 'Ilhós Metálico com Arruela a cada 50cm',
    category: 'Comunicação Visual (Lonas)',
    price: 1.2,
    pricingType: 'unidade',
    isActive: true,
    description: 'Fixação antiferrugem em latão niquelado'
  },
  {
    id: 'fin-5',
    name: 'Faca Especial de Corte e Vinco',
    category: 'Corte Especial',
    price: 85.0,
    pricingType: 'fixo',
    isActive: true,
    description: 'Confecção da madeira laser com lâminas de dobra e corte'
  },
  {
    id: 'fin-6',
    name: 'Hot Stamping Ouro / Prata',
    category: 'Efeitos Nobres',
    price: 0.12,
    pricingType: 'unidade',
    isActive: true,
    description: 'Fita metálica térmica com clichê'
  },
  {
    id: 'fin-7',
    name: 'Dobra e Vinco Máquina (Folders / Folhetos)',
    category: 'Dobra & Encadernação',
    price: 0.025,
    pricingType: 'unidade',
    isActive: true,
    description: 'Dobra sanfona ou cruzada de alta velocidade'
  },
  {
    id: 'fin-8',
    name: 'Numeração Tipográfica Sequencial',
    category: 'Impressão Especial',
    price: 0.035,
    pricingType: 'unidade',
    isActive: true,
    description: 'Numeradores mecânicos para blocos, ingressos e rifas'
  }
];

export const AdminFinishingsTab: React.FC = () => {
  const [finishings, setFinishings] = useState<FinishingItem[]>(() => {
    const saved = localStorage.getItem('silkprint_erp_finishings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FINISHINGS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [isAdding, setIsAdding] = useState(false);

  // New finishing form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laminação & Plastificação');
  const [price, setPrice] = useState('0.05');
  const [pricingType, setPricingType] = useState<'unidade' | 'm2' | 'fixo'>('unidade');
  const [description, setDescription] = useState('');

  const saveFinishings = (updated: FinishingItem[]) => {
    setFinishings(updated);
    localStorage.setItem('silkprint_erp_finishings', JSON.stringify(updated));
  };

  const handleAddFinishing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: FinishingItem = {
      id: `fin-${Date.now()}`,
      name: name.trim(),
      category,
      price: parseFloat(price.replace(',', '.')) || 0,
      pricingType,
      isActive: true,
      description: description.trim()
    };

    saveFinishings([...finishings, newItem]);
    setName('');
    setDescription('');
    setIsAdding(false);
  };

  const handleToggleActive = (id: string) => {
    const updated = finishings.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f));
    saveFinishings(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este acabamento gráfico?')) {
      const updated = finishings.filter((f) => f.id !== id);
      saveFinishings(updated);
    }
  };

  const categories = Array.from(new Set(finishings.map((f) => f.category)));

  const filteredFinishings = finishings.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todas' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-finishings-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Scissors className="w-6 h-6 text-cyan-400" />
            Tabela de Acabamentos Gráficos Especiais
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre os custos e preços de venda para laminação, vernizes UV, facas de corte, ilhós, soldas e dobras.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Fechar Formulário' : 'Novo Acabamento'}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddFinishing}
          className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4" /> Cadastro de Acabamento Gráfico
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Nome do Acabamento *</label>
              <input
                type="text"
                required
                placeholder="Ex: Verniz UV Total com Brilho Intenso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Laminação & Plastificação">Laminação & Plastificação</option>
                <option value="Vernizes & Efeitos">Vernizes & Efeitos</option>
                <option value="Corte Especial">Corte Especial</option>
                <option value="Comunicação Visual (Lonas)">Comunicação Visual (Lonas)</option>
                <option value="Dobra & Encadernação">Dobra & Encadernação</option>
                <option value="Efeitos Nobres">Efeitos Nobres</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tipo de Cobrança</label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="unidade">Por Unidade (un)</option>
                <option value="m2">Por Metro Quadrado (m²)</option>
                <option value="fixo">Custo Fixo por Lote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Preço Cobrado (R$)</label>
              <input
                type="text"
                placeholder="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Descrição / Especificação Técnica</label>
              <input
                type="text"
                placeholder="Ex: Aplicação em máquina serigráfica com cura UV ultravioleta"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
            >
              Salvar Acabamento
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar acabamento por nome ou especificação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="todas">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Finishings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFinishings.map((item) => (
          <div
            key={item.id}
            className={`bg-slate-900 border rounded-2xl p-4 transition-all flex flex-col justify-between ${
              item.isActive ? 'border-slate-800 hover:border-cyan-500/40' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400">
                  {item.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.isActive ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <h4 className="font-bold text-sm text-white mt-2">{item.name}</h4>
              {item.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Valor Base</span>
                <div className="text-base font-black text-cyan-400 font-mono">
                  R$ {item.price.toFixed(item.price < 1 ? 3 : 2)}
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    / {item.pricingType === 'unidade' ? 'un' : item.pricingType === 'm2' ? 'm²' : 'lote'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                title="Remover acabamento"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
