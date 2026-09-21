import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Layers, 
  PackageCheck,
  X,
  Save
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { RawMaterial } from '../../types';

const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'mat-1',
    code: 'PAP-COU-300',
    name: 'Papel Couché 300g Brilho 66x96cm',
    category: 'papel',
    unit: 'resmas (500 fls)',
    stockQty: 42,
    minStockQty: 15,
    costPrice: 395.00,
    supplierName: 'Suzano Papel & Celulose',
    location: 'Galpão A - Prateleira 01',
    lastRestockDate: '10/05/2026'
  },
  {
    id: 'mat-2',
    code: 'PAP-COU-150',
    name: 'Papel Couché 150g Fosco 66x96cm',
    category: 'papel',
    unit: 'resmas (500 fls)',
    stockQty: 8,
    minStockQty: 12, // Low stock!
    costPrice: 215.00,
    supplierName: 'Klabin / Distribuidora Papéis',
    location: 'Galpão A - Prateleira 02',
    lastRestockDate: '02/05/2026'
  },
  {
    id: 'mat-3',
    code: 'PAP-OFF-090',
    name: 'Papel Offset 90g 64x88cm',
    category: 'papel',
    unit: 'resmas (500 fls)',
    stockQty: 28,
    minStockQty: 10,
    costPrice: 118.00,
    supplierName: 'Sylvamo Papelaria',
    location: 'Galpão A - Prateleira 04',
    lastRestockDate: '08/05/2026'
  },
  {
    id: 'mat-4',
    code: 'CTP-PLA-030',
    name: 'Chapa CTP Térmica Offset 0.30mm (Formatos 650x550mm)',
    category: 'chapa_ctp',
    unit: 'chapas',
    stockQty: 140,
    minStockQty: 50,
    costPrice: 28.50,
    supplierName: 'Agfa Graphics Brasil',
    location: 'Sala Climatizada CTP',
    lastRestockDate: '11/05/2026'
  },
  {
    id: 'mat-5',
    code: 'CTP-PLA-015',
    name: 'Chapa CTP Digital Laser 0.15mm (SRA3)',
    category: 'chapa_ctp',
    unit: 'chapas',
    stockQty: 18,
    minStockQty: 30, // Low stock!
    costPrice: 14.20,
    supplierName: 'Kodak Graphic Systems',
    location: 'Sala Climatizada CTP',
    lastRestockDate: '25/04/2026'
  },
  {
    id: 'mat-6',
    code: 'TIN-ESC-CYN',
    name: 'Tinta Offset Escala Ciano (Lata 2.5kg)',
    category: 'tinta',
    unit: 'latas',
    stockQty: 14,
    minStockQty: 6,
    costPrice: 85.00,
    supplierName: 'Flint Group Tintas',
    location: 'Depósito de Químicos - Box 1',
    lastRestockDate: '05/05/2026'
  },
  {
    id: 'mat-7',
    code: 'TIN-ESC-MAG',
    name: 'Tinta Offset Escala Magenta (Lata 2.5kg)',
    category: 'tinta',
    unit: 'latas',
    stockQty: 12,
    minStockQty: 6,
    costPrice: 89.00,
    supplierName: 'Flint Group Tintas',
    location: 'Depósito de Químicos - Box 1',
    lastRestockDate: '05/05/2026'
  },
  {
    id: 'mat-8',
    code: 'TIN-ESC-YEL',
    name: 'Tinta Offset Escala Amarelo (Lata 2.5kg)',
    category: 'tinta',
    unit: 'latas',
    stockQty: 4,
    minStockQty: 6, // Low stock!
    costPrice: 82.00,
    supplierName: 'Flint Group Tintas',
    location: 'Depósito de Químicos - Box 1',
    lastRestockDate: '20/04/2026'
  },
  {
    id: 'mat-9',
    code: 'TIN-ESC-BLK',
    name: 'Tinta Offset Escala Preto Concentrado (Lata 2.5kg)',
    category: 'tinta',
    unit: 'latas',
    stockQty: 22,
    minStockQty: 8,
    costPrice: 78.00,
    supplierName: 'Flint Group Tintas',
    location: 'Depósito de Químicos - Box 1',
    lastRestockDate: '09/05/2026'
  },
  {
    id: 'mat-10',
    code: 'BOP-FOS-350',
    name: 'Bobina Filme Térmico BOPP Fosco 35cm x 3000m',
    category: 'acabamento',
    unit: 'rolos',
    stockQty: 6,
    minStockQty: 2,
    costPrice: 420.00,
    supplierName: 'Polo Films Indústria',
    location: 'Setor de Laminação',
    lastRestockDate: '03/05/2026'
  },
  {
    id: 'mat-11',
    code: 'VRN-UV-LOC',
    name: 'Verniz Serigráfico UV Localizado com Fotoiniciador (Galão 5L)',
    category: 'acabamento',
    unit: 'galões',
    stockQty: 5,
    minStockQty: 2,
    costPrice: 260.00,
    supplierName: 'Sun Chemical do Brasil',
    location: 'Setor de Serigrafia / UV',
    lastRestockDate: '29/04/2026'
  },
  {
    id: 'mat-12',
    code: 'EMB-CXA-001',
    name: 'Caixas de Papelão Microondulado para 1.000 Cartões de Visita',
    category: 'embalagem',
    unit: 'centenas',
    stockQty: 18,
    minStockQty: 5,
    costPrice: 48.00,
    supplierName: 'Embalagens São Paulo',
    location: 'Expedição',
    lastRestockDate: '07/05/2026'
  }
];

export const AdminRawMaterialsTab: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [adjustType, setAdjustType] = useState<'entry' | 'output'>('entry');
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Recebimento de Pedido de Compra / NF');

  // Form states for new/edit
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<RawMaterial['category']>('papel');
  const [formUnit, setFormUnit] = useState('resmas (500 fls)');
  const [formStockQty, setFormStockQty] = useState(10);
  const [formMinStockQty, setFormMinStockQty] = useState(5);
  const [formCostPrice, setFormCostPrice] = useState(100.00);
  const [formSupplierName, setFormSupplierName] = useState('');
  const [formLocation, setFormLocation] = useState('');

  // Calculations
  const totalStockValue = materials.reduce((sum, m) => sum + (m.stockQty * m.costPrice), 0);
  const criticalItems = materials.filter(m => m.stockQty <= m.minStockQty);

  // Filtered
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.supplierName.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenNewModal = () => {
    setSelectedMaterial(null);
    setFormCode(`INS-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory('papel');
    setFormUnit('resmas (500 fls)');
    setFormStockQty(20);
    setFormMinStockQty(5);
    setFormCostPrice(150.00);
    setFormSupplierName('Distribuidor Gráfico');
    setFormLocation('Almoxarifado');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: RawMaterial) => {
    setSelectedMaterial(m);
    setFormCode(m.code);
    setFormName(m.name);
    setFormCategory(m.category);
    setFormUnit(m.unit);
    setFormStockQty(m.stockQty);
    setFormMinStockQty(m.minStockQty);
    setFormCostPrice(m.costPrice);
    setFormSupplierName(m.supplierName);
    setFormLocation(m.location || '');
    setIsModalOpen(true);
  };

  const handleOpenAdjustModal = (m: RawMaterial, type: 'entry' | 'output') => {
    setSelectedMaterial(m);
    setAdjustType(type);
    setAdjustQty(type === 'entry' ? 10 : 2);
    setAdjustReason(type === 'entry' ? 'Entrada por NF de Fornecedor' : 'Baixa para O.S. de Produção');
    setIsStockAdjustOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (selectedMaterial) {
      setMaterials(prev => prev.map(item => item.id === selectedMaterial.id ? {
        ...item,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        stockQty: Number(formStockQty),
        minStockQty: Number(formMinStockQty),
        costPrice: Number(formCostPrice),
        supplierName: formSupplierName.trim(),
        location: formLocation.trim()
      } : item));
    } else {
      const newMat: RawMaterial = {
        id: `mat-${Date.now()}`,
        code: formCode.trim().toUpperCase() || `INS-${Date.now().toString().slice(-4)}`,
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        stockQty: Number(formStockQty),
        minStockQty: Number(formMinStockQty),
        costPrice: Number(formCostPrice),
        supplierName: formSupplierName.trim(),
        location: formLocation.trim(),
        lastRestockDate: new Date().toLocaleDateString('pt-BR')
      };
      setMaterials(prev => [newMat, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    setMaterials(prev => prev.map(item => {
      if (item.id === selectedMaterial.id) {
        const newQty = adjustType === 'entry' 
          ? item.stockQty + adjustQty 
          : Math.max(0, item.stockQty - adjustQty);
        return {
          ...item,
          stockQty: newQty,
          lastRestockDate: adjustType === 'entry' ? new Date().toLocaleDateString('pt-BR') : item.lastRestockDate
        };
      }
      return item;
    }));

    setIsStockAdjustOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Deseja realmente remover este insumo do almoxarifado?')) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" /> Almoxarifado & Insumos da Gráfica
          </h2>
          <p className="text-xs text-slate-400">
            Controle de estoque de bobinas/resmas de papel, chapas de CTP, tintas CMYK e laminação térmica
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Cadastrar Novo Insumo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total de Insumos</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{materials.length}</div>
          <div className="text-[10px] text-slate-500">5 categorias industriais</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          criticalItems.length > 0 
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300' 
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">Abaixo do Estoque Mínimo</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{criticalItems.length}</div>
          <div className="text-[10px] text-rose-300/80">Necessitam compra urgente de reposição</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Valor Total Imobilizado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatCurrency(totalStockValue)}</div>
          <div className="text-[10px] text-slate-500">Custo médio de aquisição</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Disponibilidade Média</span>
            <PackageCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {Math.round(((materials.length - criticalItems.length) / materials.length) * 100)}%
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">Chão de fábrica abastecido</div>
        </div>
      </div>

      {/* Critical Stock Alert Banner if items exist */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-rose-300 font-bold block">Atenção do Almoxarifado: Insumos com Estoque Baixo!</strong>
            <p className="text-rose-200/90 leading-relaxed">
              Os seguintes materiais estão abaixo do estoque de segurança: {criticalItems.map(c => `${c.name} (${c.stockQty} ${c.unit})`).join(', ')}. Clique no botão <strong>"+ Entrada"</strong> para lançar nova nota fiscal recebida.
            </p>
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, nome do insumo ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="papel">Papéis & Cartões</option>
              <option value="chapa_ctp">Chapas CTP</option>
              <option value="tinta">Tintas & Vernizes</option>
              <option value="acabamento">Laminação & Acabamentos</option>
              <option value="embalagem">Embalagens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Código / Insumo</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Estoque Atual</th>
                <th className="p-3.5">Mínimo</th>
                <th className="p-3.5">Custo Unitário</th>
                <th className="p-3.5">Total (R$)</th>
                <th className="p-3.5">Fornecedor</th>
                <th className="p-3.5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMaterials.map((m) => {
                const isCritical = m.stockQty <= m.minStockQty;
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] font-bold text-cyan-400">{m.code}</div>
                      <div className="font-bold text-white text-sm">{m.name}</div>
                      {m.location && (
                        <div className="text-[10px] text-slate-500">{m.location}</div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {m.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`text-sm font-black ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {m.stockQty}
                        </span>
                        <span className="text-[10px] text-slate-400">{m.unit}</span>
                      </div>
                      {isCritical && (
                        <span className="text-[9px] font-bold text-rose-400 flex items-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Reposição necessária
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-slate-400">
                      {m.minStockQty}
                    </td>

                    <td className="p-3.5 font-mono text-slate-200">
                      {formatCurrency(m.costPrice)}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {formatCurrency(m.stockQty * m.costPrice)}
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div className="font-medium truncate max-w-[150px]">{m.supplierName}</div>
                      <div className="text-[10px] text-slate-500">Última entrada: {m.lastRestockDate || '-'}</div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjustModal(m, 'entry')}
                          className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1"
                          title="Lançar Entrada de Estoque (NF)"
                        >
                          <TrendingUp className="w-3 h-3" /> + Entrada
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAdjustModal(m, 'output')}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-950/80 text-slate-300 hover:text-amber-300 border border-slate-700 text-[10px] font-bold flex items-center gap-1"
                          title="Lançar Baixa para Produção"
                        >
                          <TrendingDown className="w-3 h-3" /> - Baixa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="Editar Insumo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isStockAdjustOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                {adjustType === 'entry' ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Lançar Entrada de Estoque
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    Lançar Baixa de Produção
                  </>
                )}
              </h3>
              <button onClick={() => setIsStockAdjustOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-mono text-cyan-400">{selectedMaterial.code}</div>
              <div className="font-bold text-white text-sm">{selectedMaterial.name}</div>
              <div className="text-slate-400 mt-1">
                Estoque atual: <strong className="text-white">{selectedMaterial.stockQty} {selectedMaterial.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Quantidade a {adjustType === 'entry' ? 'Adicionar' : 'Subtrair'} ({selectedMaterial.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-base font-black focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Motivo / Documento</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 ${
                    adjustType === 'entry' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New/Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {selectedMaterial ? 'Editar Insumo Gráfico' : 'Cadastrar Novo Insumo Gráfico'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Código de Referência</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoria Industrial</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="papel">Papéis & Cartões</option>
                    <option value="chapa_ctp">Chapas CTP</option>
                    <option value="tinta">Tintas & Vernizes</option>
                    <option value="acabamento">Laminação & Acabamentos</option>
                    <option value="embalagem">Embalagens</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nome / Descrição do Material</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Papel Couché 250g 66x96cm..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unidade</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={formStockQty}
                    onChange={(e) => setFormStockQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formMinStockQty}
                    onChange={(e) => setFormMinStockQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fornecedor Principal</label>
                  <input
                    type="text"
                    value={formSupplierName}
                    onChange={(e) => setFormSupplierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Localização no Galpão / Setor</label>
                <input
                  type="text"
                  placeholder="Ex: Galpão A - Prateleira 03"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
