import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Truck, 
  Layers, 
  DollarSign, 
  Package, 
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'orcamentos' | 'balcoes' | 'estoque' | 'financeiro'>('kanban');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar do ERP */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight">SILK PRINT <span className="text-cyan-400">ERP</span></span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">PCP Industrial v2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold">Fábrica Operacional</span>
          </div>
        </div>
      </header>

      {/* Main Layout com Sidebar e Área de Trabalho */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de Módulos */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'kanban' 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kanban O.S. (PCP)</span>
            </button>

            <button
              onClick={() => setActiveTab('orcamentos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'orcamentos' 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Cálculo Gráfico & Orçamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('balcoes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'balcoes' 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Balcões de Retirada</span>
            </button>

            <button
              onClick={() => setActiveTab('estoque')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'estoque' 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Almoxarifado & Insumos</span>
            </button>

            <button
              onClick={() => setActiveTab('financeiro')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'financeiro' 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>DRE & Financeiro</span>
            </button>
          </nav>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <p className="font-bold text-slate-200 mb-1">Backend Conectado</p>
            <p className="text-slate-400">NestJS Express API</p>
            <div className="mt-2 text-[10px] text-cyan-400 font-mono">http://localhost:4000</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {activeTab === 'kanban' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-black text-white">Esteira de Produção Gráfica (Kanban PCP)</h1>
                  <p className="text-xs text-slate-400">Acompanhe as Ordens de Serviço desde a pré-impressão CTP até a expedição</p>
                </div>
              </div>

              {/* Colunas do Kanban */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: 'Aprovados / CTP', count: 4, color: 'border-cyan-500/50' },
                  { title: 'Impressão (Offset/Plotter)', count: 2, color: 'border-indigo-500/50' },
                  { title: 'Acabamento & Corte', count: 3, color: 'border-amber-500/50' },
                  { title: 'Pronto / Despacho', count: 5, color: 'border-emerald-500/50' },
                ].map((col, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl bg-slate-900/50 border ${col.color} flex flex-col min-h-[400px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-black text-slate-300">
                        {col.count}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400 mb-1">
                          <span>#OS-98421</span>
                          <span>24h</span>
                        </div>
                        <p className="font-bold text-white text-xs mb-1">1000 Cartões de Visita 4x4</p>
                        <p className="text-[11px] text-slate-400">Couché 300g + Laminação Fosca + Verniz Localizado</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400 mb-1">
                          <span>#OS-98422</span>
                          <span>48h</span>
                        </div>
                        <p className="font-bold text-white text-xs mb-1">5000 Panfletos A5 4x0</p>
                        <p className="text-[11px] text-slate-400">Couché 115g Brilho</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orcamentos' && (
            <div className="max-w-4xl">
              <h1 className="text-xl font-black text-white mb-2">Simulador de Custos Gráficos & Aproveitamento</h1>
              <p className="text-xs text-slate-400 mb-6">Cálculo de poses por folha (66x96cm), chapas CTP, quebra e margem de contribuição</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Formato da Folha Inteira</label>
                    <input type="text" defaultValue="66 x 96 cm (Padrão Gráfico)" disabled className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Poses por Folha (Aproveitamento)</label>
                    <input type="number" defaultValue={24} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Cores de Impressão</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                      <option value="4x4">4x4 (Colorido Frente e Verso - 8 Chapas CTP)</option>
                      <option value="4x0">4x0 (Colorido Só Frente - 4 Chapas CTP)</option>
                      <option value="1x1">1x1 (Preto Frente e Verso - 2 Chapas CTP)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">Resumo da Ordem Técnica</h4>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between"><span>Folhas Base:</span><strong className="text-white">42 folhas</strong></div>
                      <div className="flex justify-between"><span>Margem de Quebra:</span><strong className="text-amber-400">+25 folhas</strong></div>
                      <div className="flex justify-between"><span>Custo de Papel:</span><strong className="text-white">R$ 40,20</strong></div>
                      <div className="flex justify-between"><span>Custo Chapas CTP:</span><strong className="text-white">R$ 180,00</strong></div>
                      <div className="flex justify-between"><span>Hora/Máquina:</span><strong className="text-white">R$ 80,00</strong></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[11px] text-slate-400">Preço Sugerido (Markup 60%)</span>
                        <div className="text-2xl font-black text-emerald-400">R$ 480,32</div>
                      </div>
                      <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30">
                        Gerar Orçamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'balcoes' && (
            <div>
              <h1 className="text-xl font-black text-white mb-2">Rede de Balcões de Retirada Parceiros</h1>
              <p className="text-xs text-slate-400 mb-6">Gestão centralizada de pontos de coleta integrados ao cálculo de frete da Loja Virtual</p>
              
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-300">
                  Os balcões cadastrados são sincronizados em tempo real com o backend PostgreSQL e disponibilizados na finalização de compra do e-commerce.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'estoque' && (
            <div>
              <h1 className="text-xl font-black text-white mb-2">Almoxarifado & Insumos Industriais</h1>
              <p className="text-xs text-slate-400 mb-6">Controle de resmas de papel, chapas térmicas CTP, tintas offset e bobinas BOPP</p>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div>
              <h1 className="text-xl font-black text-white mb-2">DRE & Demonstrativo de Resultados</h1>
              <p className="text-xs text-slate-400 mb-6">Faturamento bruto, custo das mercadorias vendidas (CPV) e lucratividade líquida</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
