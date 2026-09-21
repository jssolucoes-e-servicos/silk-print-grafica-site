import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  DollarSign,
  Layers,
  Save,
  Check,
  HelpCircle,
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  Scale,
  RefreshCw,
  Info,
  BadgePercent
} from 'lucide-react';

interface CategoryMarkup {
  id: string;
  category: string;
  markup: number;
  minMargin: number;
  targetMargin: number;
}

interface QuantityTierDiscount {
  id: string;
  minQty: number;
  maxQty: number;
  discountPercent: number;
}

export const AdminPricingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'categorias' | 'escalas' | 'custos' | 'simulador'>('geral');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Regras Gerais
  const [markupGeral, setMarkupGeral] = useState('2.5');
  const [margemLucroMinima, setMargemLucroMinima] = useState('35');
  const [margemLucroAlvo, setMargemLucroAlvo] = useState('50');
  const [taxaCartao, setTaxaCartao] = useState('3.99');
  const [descontoPix, setDescontoPix] = useState('5');
  const [roundingRule, setRoundingRule] = useState<'90' | '99' | '00' | 'none'>('90');

  // Custos Operacionais Industriais
  const [custoHoraMaquina, setCustoHoraMaquina] = useState('45.00');
  const [custoHoraMaoDeObra, setCustoHoraMaoDeObra] = useState('30.00');
  const [custoM2Lona, setCustoM2Lona] = useState('18.50');
  const [custoM2Adesivo, setCustoM2Adesivo] = useState('14.00');
  const [custoChapaCTP, setCustoChapaCTP] = useState('28.00');
  const [custoMilheiroOffset, setCustoMilheiroOffset] = useState('45.00');

  // Categorias de Markup Gráfico
  const [categoryMarkups, setCategoryMarkups] = useState<CategoryMarkup[]>([
    { id: 'cat-1', category: 'Banners & Lonas 440g', markup: 2.8, minMargin: 40, targetMargin: 55 },
    { id: 'cat-2', category: 'Adesivos & Vinil Brilho/Fosco', markup: 3.0, minMargin: 45, targetMargin: 60 },
    { id: 'cat-3', category: 'Papelaria & Cartões de Visita', markup: 2.2, minMargin: 30, targetMargin: 45 },
    { id: 'cat-4', category: 'Folders, Panfletos & Folhetos', markup: 2.4, minMargin: 35, targetMargin: 48 },
    { id: 'cat-5', category: 'Brindes & Canecas Personalizadas', markup: 2.5, minMargin: 35, targetMargin: 50 },
    { id: 'cat-6', category: 'Sinalização & Placas Rígidas ACM/PS', markup: 2.9, minMargin: 42, targetMargin: 58 }
  ]);

  // Escalas Progressivas de Quantidade / Tiragem
  const [quantityTiers, setQuantityTiers] = useState<QuantityTierDiscount[]>([
    { id: 'tier-1', minQty: 1, maxQty: 10, discountPercent: 0 },
    { id: 'tier-2', minQty: 11, maxQty: 50, discountPercent: 5 },
    { id: 'tier-3', minQty: 51, maxQty: 100, discountPercent: 12 },
    { id: 'tier-4', minQty: 101, maxQty: 500, discountPercent: 20 },
    { id: 'tier-5', minQty: 501, maxQty: 99999, discountPercent: 28 }
  ]);

  // Simulador Interativo
  const [simCustoInsumos, setSimCustoInsumos] = useState('50.00');
  const [simCustoAcabamento, setSimCustoAcabamento] = useState('15.00');
  const [simTempoProducaoHoras, setSimTempoProducaoHoras] = useState('0.5');
  const [simQuantidade, setSimQuantidade] = useState('10');
  const [simMarkup, setSimMarkup] = useState('2.5');

  // Cálculos do simulador
  const custoInsumosNum = parseFloat(simCustoInsumos) || 0;
  const custoAcabamentoNum = parseFloat(simCustoAcabamento) || 0;
  const tempoHorasNum = parseFloat(simTempoProducaoHoras) || 0;
  const qtdNum = parseInt(simQuantidade) || 1;
  const markupNum = parseFloat(simMarkup) || 1;

  const custoOperacionalHora = (parseFloat(custoHoraMaquina) || 0) + (parseFloat(custoHoraMaoDeObra) || 0);
  const custoOperacionalLote = tempoHorasNum * custoOperacionalHora;
  const custoTotalProducao = custoInsumosNum + custoAcabamentoNum + custoOperacionalLote;
  const custoUnitario = custoTotalProducao / qtdNum;

  // Preço de Venda Bruto
  let precoVendaTotal = custoTotalProducao * markupNum;
  let precoUnitarioVenda = precoVendaTotal / qtdNum;

  // Aplicação da regra de arredondamento
  if (roundingRule === '90') {
    precoUnitarioVenda = Math.floor(precoUnitarioVenda) + 0.9;
    precoVendaTotal = precoUnitarioVenda * qtdNum;
  } else if (roundingRule === '99') {
    precoUnitarioVenda = Math.floor(precoUnitarioVenda) + 0.99;
    precoVendaTotal = precoUnitarioVenda * qtdNum;
  } else if (roundingRule === '00') {
    precoUnitarioVenda = Math.round(precoUnitarioVenda);
    precoVendaTotal = precoUnitarioVenda * qtdNum;
  }

  const taxaCartaoNum = parseFloat(taxaCartao) || 0;
  const valorTaxaCartao = precoVendaTotal * (taxaCartaoNum / 100);
  const lucroBrutoTotal = precoVendaTotal - custoTotalProducao - valorTaxaCartao;
  const margemLucroReal = precoVendaTotal > 0 ? (lucroBrutoTotal / precoVendaTotal) * 100 : 0;

  const handleSaveAll = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddCategory = () => {
    const newCat: CategoryMarkup = {
      id: `cat-${Date.now()}`,
      category: 'Nova Categoria Gráfica',
      markup: 2.5,
      minMargin: 35,
      targetMargin: 50
    };
    setCategoryMarkups([...categoryMarkups, newCat]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategoryMarkups(categoryMarkups.filter((c) => c.id !== id));
  };

  return (
    <div id="admin-pricing-tab" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-cyan-400" />
            Engenharia de Precificação & Markups Gráficos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure margens alvo, custos de horas-máquinas, taxas de cartão/PIX, escalas de tiragem e simule lucros líquidos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Regras Salvas!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'geral', label: 'Políticas Gerais & Arredondamento', icon: Sliders },
          { id: 'custos', label: 'Custos Operacionais & Máquinas', icon: DollarSign },
          { id: 'categorias', label: 'Markups por Categoria', icon: Layers },
          { id: 'escalas', label: 'Escalas de Tiragem', icon: BadgePercent },
          { id: 'simulador', label: 'Simulador em Tempo Real', icon: Scale }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GERAL */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" /> Markups & Margens Globais
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Markup Base Padrão (Multiplicador de Custo)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={markupGeral}
                    onChange={(e) => setMarkupGeral(e.target.value)}
                    className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-slate-400">
                    ex: custo R$ 10,00 x 2.5 = R$ 25,00 preço de venda
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Margem Mínima Segura (%)</label>
                  <input
                    type="number"
                    value={margemLucroMinima}
                    onChange={(e) => setMargemLucroMinima(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Margem Alvo Desejada (%)</label>
                  <input
                    type="number"
                    value={margemLucroAlvo}
                    onChange={(e) => setMargemLucroAlvo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Taxas & Arredondamento Comercial
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Taxa Média Cartão (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxaCartao}
                    onChange={(e) => setTaxaCartao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Desconto à Vista PIX (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={descontoPix}
                    onChange={(e) => setDescontoPix(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Regra de Final de Preço (Psicológico)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '90', label: 'Terminar em ,90' },
                    { id: '99', label: 'Terminar em ,99' },
                    { id: '00', label: 'Arredondar ,00' },
                    { id: 'none', label: 'Exato (Sem regra)' }
                  ].map((rule) => (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setRoundingRule(rule.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        roundingRule === rule.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rule.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOS OPERACIONAIS */}
      {activeTab === 'custos' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyan-400" /> Custos de Máquina e Matéria-Prima Base
          </h3>
          <p className="text-xs text-slate-400">
            Valores base utilizados como referência nos orçamentos e na formação de preço industrial.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Hora/Máquina (Offset / CTP / Plotter)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoHoraMaquina}
                  onChange={(e) => setCustoHoraMaquina(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Depreciação + Energia</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Hora Homem (Acabamento / Triagem)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoHoraMaoDeObra}
                  onChange={(e) => setCustoHoraMaoDeObra(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Salário + Encargos</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Chapa Térmica CTP (unidade)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoChapaCTP}
                  onChange={(e) => setCustoChapaCTP(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Gravação laser / revelação</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Lona 440g Fosca / Brilho (m²)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoM2Lona}
                  onChange={(e) => setCustoM2Lona(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Custo bruto da bobina</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Adesivo Vinil Calandrado (m²)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoM2Adesivo}
                  onChange={(e) => setCustoM2Adesivo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Linha de corte e impressão</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Milheiro Impressão Offset (Batida)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.5"
                  value={custoMilheiroOffset}
                  onChange={(e) => setCustoMilheiroOffset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Tinta de escala + lavagem</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIAS */}
      {activeTab === 'categorias' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Markups Específicos por Categoria
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste o multiplicador de lucro de acordo com a complexidade técnica de cada linha.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              Adicionar Categoria
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Linha Gráfica / Categoria</th>
                  <th className="py-3 px-4">Markup (Fator)</th>
                  <th className="py-3 px-4">Margem Mínima (%)</th>
                  <th className="py-3 px-4">Margem Alvo (%)</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categoryMarkups.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryMarkups(categoryMarkups.map((c) => (c.id === cat.id ? { ...c, category: val } : c)));
                        }}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 text-white font-bold focus:outline-none w-full"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.1"
                        value={cat.markup}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          setCategoryMarkups(categoryMarkups.map((c) => (c.id === cat.id ? { ...c, markup: val } : c)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={cat.minMargin}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCategoryMarkups(categoryMarkups.map((c) => (c.id === cat.id ? { ...c, minMargin: val } : c)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-400 font-bold focus:border-cyan-500 focus:outline-none"
                      />
                      %
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={cat.targetMargin}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCategoryMarkups(categoryMarkups.map((c) => (c.id === cat.id ? { ...c, targetMargin: val } : c)));
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                      />
                      %
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ESCALAS PROGRESSIVAS */}
      {activeTab === 'escalas' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-cyan-400" /> Escalas Progressivas de Tiragem
          </h3>
          <p className="text-xs text-slate-400">
            Descontos automáticos por volume de produção (diluição de custo de chapa e acerto de máquina).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {quantityTiers.map((tier, idx) => (
              <div key={tier.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-cyan-400">Faixa {idx + 1}</div>
                <div className="text-xs text-slate-300">
                  {tier.minQty} a {tier.maxQty > 10000 ? 'Ilimitado' : `${tier.maxQty} un`}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs text-slate-400">Desc:</span>
                  <input
                    type="number"
                    value={tier.discountPercent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setQuantityTiers(quantityTiers.map((t) => (t.id === tier.id ? { ...t, discountPercent: val } : t)));
                    }}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-bold text-xs focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SIMULADOR INTERATIVO */}
      {activeTab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" /> Parâmetros de Custo do Lote
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custo Insumos / Papel (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simCustoInsumos}
                    onChange={(e) => setSimCustoInsumos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custo Acabamentos (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simCustoAcabamento}
                    onChange={(e) => setSimCustoAcabamento(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tempo Máquina (h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simTempoProducaoHoras}
                    onChange={(e) => setSimTempoProducaoHoras(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tiragem (Qtd)</label>
                  <input
                    type="number"
                    value={simQuantidade}
                    onChange={(e) => setSimQuantidade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Markup Desejado</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simMarkup}
                    onChange={(e) => setSimMarkup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Resultado Econômico Projetado
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Custo Total de Produção:</span>
                  <span className="font-bold text-white font-mono">R$ {custoTotalProducao.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Custo Unitário Industrial:</span>
                  <span className="font-bold text-slate-300 font-mono">R$ {custoUnitario.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Taxa Estimada de Cartão ({taxaCartao}%):</span>
                  <span className="font-bold text-rose-400 font-mono">- R$ {valorTaxaCartao.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Lucro Líquido do Lote:</span>
                  <span className="font-bold text-emerald-400 font-mono">R$ {lucroBrutoTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Margem Líquida Real:</span>
                  <span className="font-bold text-emerald-400 font-mono">{margemLucroReal.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Preço de Venda Sugerido</span>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  R$ {precoVendaTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Unitário: R$ {precoUnitarioVenda.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  {margemLucroReal >= parseFloat(margemLucroMinima) ? 'Margem Saudável' : 'Abaixo do Mínimo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
