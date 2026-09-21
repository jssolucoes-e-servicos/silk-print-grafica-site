import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Truck,
  TrendingUp,
  Clock,
  Package,
} from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface AgendaScreenProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export const AgendaScreen: React.FC<AgendaScreenProps> = ({ orders, onSelectOrder }) => {
  const [viewMode, setViewMode] = useState<'entregas' | 'vendas'>('entregas');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array (6 rows max)
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push(d);
  }

  const isToday = (d: number) => {
    // August 21, 2026 is current simulated date
    return year === 2026 && month === 7 && d === 21;
  };

  const getOrdersForDay = (d: number) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return orders.filter(
      (o) => o.deliveryDate?.startsWith(formattedDay) || o.createdAt?.startsWith(formattedDay)
    );
  };

  return (
    <div id="screen-agenda" className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
            Agenda de Pedidos
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Previsões de entrega por dia
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('entregas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'entregas'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Entregas</span>
          </button>
          <button
            onClick={() => setViewMode('vendas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'vendas'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Vendas</span>
          </button>
        </div>
      </div>

      {/* Month Navigator & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-zinc-100 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Hoje</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Vence em 2 dias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Entregas</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-3 sm:p-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-zinc-400">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-20 sm:h-24 md:h-28 opacity-0"></div>;
            }

            const currentDayOrders = getOrdersForDay(day);
            const activeToday = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`h-20 sm:h-24 md:h-28 rounded-xl p-2 flex flex-col justify-between transition-all border ${
                  activeToday
                    ? 'bg-blue-950/30 border-blue-600/60 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                    : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      activeToday ? 'text-blue-400 flex items-center gap-1' : 'text-zinc-300'
                    }`}
                  >
                    {day}
                    {activeToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                  </span>
                  {currentDayOrders.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-blue-400 font-semibold font-mono">
                      {currentDayOrders.length}
                    </span>
                  )}
                </div>

                {/* Orders Badges inside day */}
                <div className="space-y-1 overflow-y-auto no-scrollbar max-h-14">
                  {currentDayOrders.slice(0, 2).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder?.(order)}
                      className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 truncate hover:bg-emerald-500/20 transition-colors"
                      title={`#${order.code} - ${order.clientName}`}
                    >
                      #{order.code} {order.clientName}
                    </div>
                  ))}
                  {currentDayOrders.length > 2 && (
                    <div className="text-[9px] text-zinc-500 font-medium">
                      +{currentDayOrders.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
