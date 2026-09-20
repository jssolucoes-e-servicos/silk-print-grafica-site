import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PieChart, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter,
  Layers,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Order } from '../../types';

interface AdminFinancialTabProps {
  orders: Order[];
}

interface FinancialEntry {
  id: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'liquidado' | 'pendente';
  method: string;
}

const SAMPLE_ENTRIES: FinancialEntry[] = [
  { id: 'LAN-101', type: 'receita', category: 'Vendas Loja / O.S.', description: 'O.S. #2394 - Cartões Couché 300g (1.000 un)', amount: 119.80, date: '12/05/2026', status: 'liquidado', method: 'PIX' },
  { id: 'LAN-102', type: 'receita', category: 'Vendas Corporativas', description: 'O.S. #2395 - Encartes Supermercado (20.000 un)', amount: 1850.00, date: '12/05/2026', status: 'liquidado', method: 'Boleto 15dd' },
  { id: 'LAN-103', type: 'despesa', category: 'Insumos (Papel)', description: 'NF 4920 - 15 Resmas Couché 300g Suzano', amount: 5925.00, date: '11/05/2026', status: 'liquidado', method: 'TED / Faturado' },
  { id: 'LAN-104', type: 'despesa', category: 'Pré-impressão CTP', description: 'NF 1290 - 40 Chapas CTP Térmicas Agfa', amount: 1140.00, date: '10/05/2026', status: 'liquidado', method: 'Boleto' },
  { id: 'LAN-105', type: 'receita', category: 'Vendas Loja / O.S.', description: 'O.S. #2392 - Lona 440g c/ Ilhós (2x1m)', amount: 240.00, date: '10/05/2026', status: 'liquidado', method: 'Cartão de Crédito' },
  { id: 'LAN-106', type: 'despesa', category: 'Logística / Fretes', description: 'Repasse Semanal Balcões de Retirada Parceiros', amount: 840.00, date: '09/05/2026', status: 'liquidado', method: 'PIX' },
  { id: 'LAN-107', type: 'receita', category: 'Vendas Corporativas', description: 'Faturamento Agência Mídia - Pastas A4 e Brindes', amount: 3200.00, date: '15/05/2026', status: 'pendente', method: 'Boleto 30dd' },
  { id: 'LAN-108', type: 'despesa', category: 'Energia / Maquinário', description: 'Enel - Consumo Chão de Fábrica Offset e CTP', amount: 1950.00, date: '18/05/2026', status: 'pendente', method: 'Boleto' }
];

export const AdminFinancialTab: React.FC<AdminFinancialTabProps> = ({ orders }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>(SAMPLE_ENTRIES);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');

  // Calculate real orders revenue
  const totalOrdersRevenue = orders.reduce((sum, o) => sum + (o.payment?.total || 0), 0);
  const totalOrdersCount = orders.length || 1;
  const avgTicket = totalOrdersRevenue / totalOrdersCount;

  // DRE figures
  const totalRevenue = totalOrdersRevenue + 5050.00; // adding corporate contracts
  const costPaperAndInsumos = totalRevenue * 0.32; // ~32% CMV standard in graphic printing
  const costCtpAndPrinting = totalRevenue * 0.14; // ~14% machine & CTP consumables
  const costShipping = orders.reduce((sum, o) => sum + (o.payment?.shippingCost || 0), 0) + 840.00;
  const grossMargin = totalRevenue - (costPaperAndInsumos + costCtpAndPrinting + costShipping);
  const fixedExpenses = 3500.00; // energy, rent, equipment maintenance
  const netProfit = grossMargin - fixedExpenses;
  const netMarginPercent = (netProfit / totalRevenue) * 100;

  const filteredEntries = entries.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Painel Financeiro & DRE Gráfico
          </h2>
          <p className="text-xs text-slate-400">
            Demonstrativo de resultados industriais, CMV (papel, chapas, tintas), fluxo de caixa e contas a receber
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar Relatório DRE
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Faturamento Bruto Total</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[10px] text-emerald-400/90 font-medium">
            {orders.length} ordens de serviço ativas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CMV Gráfico (Insumos/Chapas)</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {formatCurrency(costPaperAndInsumos + costCtpAndPrinting)}
          </div>
          <div className="text-[10px] text-slate-500">46% da receita bruta</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lucro Operacional Líquido</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {formatCurrency(netProfit)}
          </div>
          <div className="text-[10px] text-cyan-400/90 font-mono font-bold">
            Margem Líquida: {netMarginPercent.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ticket Médio por O.S.</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(avgTicket > 0 ? avgTicket : 185.00)}
          </div>
          <div className="text-[10px] text-slate-500">Varejo + Revenda Gráfica</div>
        </div>
      </div>

      {/* DRE & Payment Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DRE Demonstrative Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Demonstrativo de Resultados do Exercício (DRE)
              </h3>
              <span className="text-[10px] text-slate-400">Visão consolidada de receitas, CMV e margens industriais</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Mês Vigente
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-800/80">
            {/* 1. Receita Bruta */}
            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-white">(+) RECEITA BRUTA DE VENDAS</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalRevenue)}</span>
            </div>

            {/* 2. Deduções e impostos */}
            <div className="flex justify-between items-center py-2 text-slate-400">
              <span className="pl-4">(-) Impostos / Simples Nacional Gráfico (6%)</span>
              <span className="font-mono text-rose-400">-{formatCurrency(totalRevenue * 0.06)}</span>
            </div>

            {/* Receita Líquida */}
            <div className="flex justify-between items-center py-2 font-semibold text-slate-200">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span className="font-mono">{formatCurrency(totalRevenue * 0.94)}</span>
            </div>

            {/* 3. Custos CMV */}
            <div className="flex justify-between items-center py-2 text-slate-400">
              <span className="pl-4">(-) Custo Papéis e Cartões (Bobinas/Resmas)</span>
              <span className="font-mono text-rose-400">-{formatCurrency(costPaperAndInsumos)}</span>
            </div>

            <div className="flex justify-between items-center py-2 text-slate-400">
              <span className="pl-4">(-) Custo Chapas CTP, Tintas e Solventes</span>
              <span className="font-mono text-rose-400">-{formatCurrency(costCtpAndPrinting)}</span>
            </div>

            <div className="flex justify-between items-center py-2 text-slate-400">
              <span className="pl-4">(-) Custos de Logística e Balcões de Retirada</span>
              <span className="font-mono text-rose-400">-{formatCurrency(costShipping)}</span>
            </div>

            {/* Margem de Contribuição */}
            <div className="flex justify-between items-center py-2 font-bold text-cyan-300 bg-cyan-950/20 px-2 rounded-lg">
              <span>(=) MARGEM DE CONTRIBUIÇÃO INDUSTRIAL</span>
              <span className="font-mono">{formatCurrency(grossMargin)}</span>
            </div>

            {/* 4. Custos Fixos */}
            <div className="flex justify-between items-center py-2 text-slate-400">
              <span className="pl-4">(-) Despesas Operacionais (Energia, Manutenção Maquinário)</span>
              <span className="font-mono text-rose-400">-{formatCurrency(fixedExpenses)}</span>
            </div>

            {/* 5. Lucro Líquido Final */}
            <div className="flex justify-between items-center py-3 font-black text-sm text-emerald-400 bg-emerald-950/30 px-3 rounded-xl border border-emerald-800/60">
              <span>(=) RESULTADO LÍQUIDO DO PERÍODO:</span>
              <span className="font-mono text-base">{formatCurrency(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods & Receivable (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Payment Methods Breakdown */}
          <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Formas de Recebimento
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>PIX Instantâneo (À Vista)</span>
                  <span className="font-mono font-bold text-emerald-400">58% ({formatCurrency(totalRevenue * 0.58)})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[58%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cartão de Crédito (Loja Online)</span>
                  <span className="font-mono font-bold text-cyan-400">27% ({formatCurrency(totalRevenue * 0.27)})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full w-[27%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Boleto Faturado B2B (Agências/Revenda)</span>
                  <span className="font-mono font-bold text-amber-400">15% ({formatCurrency(totalRevenue * 0.15)})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[15%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Receivable Card */}
          <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Contas a Receber (Faturado)
              </h3>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                Total: R$ 3.200,00
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Agência Mídia Prime</div>
                  <div className="text-[10px] text-slate-400">Pastas A4 + 5.000 Flyers (Vencimento 15/05)</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">R$ 3.200,00</div>
                  <span className="text-[9px] font-bold text-amber-400">A Vencer</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Financial Entries Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" /> Livro Caixa & Lançamentos Recentes
            </h3>
            <span className="text-xs text-slate-400">Histórico detalhado de entradas e saídas do parque fabril</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterType === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('receita')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterType === 'receita' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Receitas
              </button>
              <button
                type="button"
                onClick={() => setFilterType('despesa')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterType === 'despesa' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Despesas
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Código</th>
                <th className="p-3">Descrição / Lançamento</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Forma</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEntries.map((entry) => {
                const isRevenue = entry.type === 'receita';
                return (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{entry.date}</td>
                    <td className="p-3 font-mono font-bold text-cyan-400">{entry.id}</td>
                    <td className="p-3 font-bold text-white">{entry.description}</td>
                    <td className="p-3 text-slate-300">{entry.category}</td>
                    <td className="p-3 text-slate-400">{entry.method}</td>
                    <td className={`p-3 text-right font-mono font-bold ${isRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isRevenue ? '+' : '-'} {formatCurrency(entry.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.status === 'liquidado' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {entry.status === 'liquidado' ? 'Liquidado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
