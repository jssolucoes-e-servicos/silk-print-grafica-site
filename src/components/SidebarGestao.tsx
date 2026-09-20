import React from 'react';
import {
  LayoutGrid,
  Users,
  Package,
  FileSpreadsheet,
  Layers,
  CalendarDays,
  ShoppingBag,
  Truck,
  ArrowLeft,
  LogOut,
  Store,
} from 'lucide-react';
import { GestaoRoute, SidebarMode, UserEmployee, AccessProfile } from '../types';
import { hasScreenPermission } from '../lib/permissionsEngine';

interface SidebarGestaoProps {
  currentRoute: string;
  onNavigate: (route: string, mode?: SidebarMode) => void;
  onLogout?: () => void;
  onNavigateToStore?: () => void;
  ordersCount: number;
  quotesCount: number;
  clientsCount: number;
  activeUser?: UserEmployee;
  profiles?: AccessProfile[];
}

export const SidebarGestao: React.FC<SidebarGestaoProps> = ({
  currentRoute,
  onNavigate,
  onLogout,
  onNavigateToStore,
  ordersCount,
  quotesCount,
  clientsCount,
  activeUser,
  profiles,
}) => {
  const menuItems = [
    {
      id: 'visao-geral',
      label: 'Visão Geral',
      icon: LayoutGrid,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      count: clientsCount,
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
    },
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      icon: FileSpreadsheet,
      count: quotesCount,
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: Layers,
      count: ordersCount,
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: CalendarDays,
    },
    {
      id: 'pedidos-online',
      label: 'Pedidos Online',
      icon: ShoppingBag,
      badge: '0 novos',
    },
    {
      id: 'logistica',
      label: 'Logística & Entregas',
      icon: Truck,
    },
    {
      id: 'loja',
      label: 'Loja Virtual',
      icon: Store,
      badge: 'E-commerce',
    },
  ];

  // Dynamically filter menu items based on active user's permissions
  const visibleMenuItems = activeUser && profiles
    ? menuItems.filter((item) => hasScreenPermission(activeUser, item.id, profiles))
    : menuItems;

  return (
    <aside
      id="sidebar-gestao-modulo"
      className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100 text-sm tracking-tight">Gestão</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase">
                Gráfica
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate">Silk Print Gráfica</p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          Módulo de Gestão
        </div>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentRoute === item.id ||
            (item.id === 'orcamentos' && currentRoute === 'novo-orcamento');

          return (
            <button
              key={item.id}
              id={`nav-gestao-${item.id}`}
              onClick={() => {
                if (item.id === 'loja') {
                  if (onNavigateToStore) {
                    onNavigateToStore();
                  } else {
                    onNavigate('loja', 'gestao');
                  }
                } else {
                  onNavigate(item.id, 'gestao');
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-zinc-800 text-zinc-400">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/70">
        {/* User profile snippet - Clickable to open Minha Conta */}
        {activeUser && (
          <button
            type="button"
            onClick={() => onNavigate('minha-conta', 'gestao')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
              currentRoute === 'minha-conta'
                ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                : 'bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/60 text-zinc-300 hover:border-zinc-700'
            }`}
            title="Ver e editar Minha Conta / 2FA"
          >
            {activeUser.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-200 truncate">
                {activeUser.name}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {activeUser.jobTitle || 'Minha Conta'}
              </div>
            </div>
            {activeUser.twoFactorEnabled && (
              <span title="2FA Ativo" className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
        )}

        {/* Back to Admin button */}
        <button
          onClick={() => onNavigate('dashboard', 'admin')}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Admin</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};
