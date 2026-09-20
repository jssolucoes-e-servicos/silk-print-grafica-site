import React from 'react';
import { Order, OrderStatus } from '../../types';
import { 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Eye, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AdminKanbanBoardProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
}

interface ColumnConfig {
  status: OrderStatus;
  title: string;
  badgeBg: string;
  borderColor: string;
  nextStatus?: OrderStatus;
  nextActionText?: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'aprovado',
    title: 'Aguardando Produção',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/20',
    nextStatus: 'pre_impressao',
    nextActionText: 'Iniciar CTP'
  },
  {
    status: 'pre_impressao',
    title: 'Pré-Impressão / CTP',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/20',
    nextStatus: 'impressao',
    nextActionText: 'P/ Impressora'
  },
  {
    status: 'impressao',
    title: 'Em Impressão',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500/20',
    nextStatus: 'acabamento',
    nextActionText: 'P/ Acabamento'
  },
  {
    status: 'acabamento',
    title: 'Acabamento & Refile',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/20',
    nextStatus: 'embalado',
    nextActionText: 'P/ Expedição'
  },
  {
    status: 'embalado',
    title: 'Pronto / Balcão',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/20',
    nextStatus: 'entregue',
    nextActionText: 'Entregue'
  }
];

export const AdminKanbanBoard: React.FC<AdminKanbanBoardProps> = ({
  orders,
  onSelectOrder,
  onAdvanceStatus,
}) => {
  return (
    <div className="overflow-x-auto pb-4 pt-1">
      <div className="flex gap-4 min-w-[1250px]">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className={`flex-1 min-w-[240px] max-w-[280px] bg-slate-900/50 rounded-2xl border ${col.borderColor} flex flex-col h-[680px] shadow-lg`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {col.title}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border font-mono ${col.badgeBg}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                {colOrders.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-xs text-center p-4">
                    <Layers className="w-6 h-6 mb-1 opacity-40" />
                    <span>Nenhuma O.S. nesta etapa</span>
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const firstItem = order.items?.[0] as any;
                    const itemQty = Number(firstItem?.config?.quantity || firstItem?.quantity || 1000);
                    const itemsSummary = firstItem 
                      ? `${itemQty.toLocaleString('pt-BR')}un ${firstItem.productName}`
                      : 'Itens diversos';

                    return (
                      <div
                        key={order.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 shadow-sm transition-all group"
                      >
                        {/* Top: ID & Value */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-mono font-bold text-cyan-400 group-hover:underline cursor-pointer" onClick={() => onSelectOrder(order)}>
                            #{order.id}
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(order.payment.total)}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="text-xs font-bold text-white truncate">
                          {order.customer?.name || 'Cliente'}
                        </div>

                        {/* Items preview */}
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-medium">
                          {itemsSummary}
                          {order.items?.length > 1 && (
                            <span className="text-cyan-400 font-bold ml-1">+{order.items.length - 1} item(ns)</span>
                          )}
                        </div>

                        {/* Delivery type */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">
                            {order.shipping?.type === 'pickup' 
                              ? (order.shipping.pickupPoint?.city || (order.shipping as any).balcaoName || 'Balcão') 
                              : 'Envio Domiciliar'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectOrder(order)}
                            className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Ver detalhes completos da O.S."
                          >
                            <Eye className="w-3 h-3" /> Ver O.S.
                          </button>

                          {col.nextStatus && (
                            <button
                              type="button"
                              onClick={() => onAdvanceStatus(order.id, col.nextStatus!)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                              title={`Mover para ${col.nextActionText}`}
                            >
                              <span>{col.nextActionText}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
