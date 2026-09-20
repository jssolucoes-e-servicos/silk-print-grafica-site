import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Tags,
  Users,
  Scissors,
  DollarSign,
  BarChart3,
  TrendingUp,
  Settings,
  Sparkles,
  UserCheck,
  ShieldCheck,
  LogOut,
  User,
  Store,
} from 'lucide-react';
import { AdminRoute, SidebarMode, UserEmployee, AccessProfile } from '../types';
import { hasScreenPermission } from '../lib/permissionsEngine';

interface SidebarAdminProps {
  currentRoute: string;
  onNavigate: (route: string, mode?: SidebarMode) => void;
  onLogout?: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenCatalogPreview?: () => void;
  onNavigateToStore?: () => void;
  ordersCount: number;
  activeUser?: UserEmployee;
  profiles?: AccessProfile[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  mode: SidebarMode;
  targetRoute?: string;
  badge?: string;
}

export const SidebarAdmin: React.FC<SidebarAdminProps> = ({
  currentRoute,
  onNavigate,
  onLogout,
  onNavigateToStore,
  activeUser,
  profiles,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'loja',
      label: 'Loja Virtual',
      icon: Store,
      mode: 'admin' as SidebarMode,
      targetRoute: 'loja',
      badge: 'Online',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'gestao',
      label: 'Gestão',
      icon: ClipboardList,
      mode: 'gestao' as SidebarMode,
      targetRoute: 'visao-geral',
      //badge: 'PRO',
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'categorias',
      label: 'Categorias',
      icon: Tags,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'acabamentos',
      label: 'Acabamentos',
      icon: Scissors,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: DollarSign,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'metricas',
      label: 'Métricas',
      icon: TrendingUp,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'funcionarios',
      label: 'Colaboradores',
      icon: UserCheck,
      mode: 'admin' as SidebarMode,
    },
    {
      id: 'perfis',
      label: 'Perfis de Acesso',
      icon: ShieldCheck,
      mode: 'admin' as SidebarMode,
    },
  ];

  // Dynamic filter based on active user's permissions
  const visibleMenuItems = activeUser && profiles
    ? menuItems.filter((item) => {
        if (item.id === 'gestao') return true;
        return hasScreenPermission(activeUser, item.id, profiles);
      })
    : menuItems;

  return (
    <aside
      id="sidebar-admin-cataloglab"
      className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-100 text-sm tracking-tight">smartGraph</span>
              </div>
              <p className="text-xs text-zinc-400 truncate">Silk Print Gráfica</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          Menu Principal
        </div>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'gestao'
              ? currentRoute === 'gestao' || currentRoute === 'visao-geral'
              : currentRoute === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                if (item.id === 'loja') {
                  if (onNavigateToStore) {
                    onNavigateToStore();
                  } else {
                    onNavigate('loja', 'admin');
                  }
                } else if (item.id === 'gestao') {
                  onNavigate('visao-geral', 'gestao');
                } else {
                  onNavigate(item.id, 'admin');
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
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-800 text-blue-400 border border-blue-500/20'
                  }`}
                >
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
        <button
          type="button"
          onClick={() => onNavigate('minha-conta', 'admin')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
            currentRoute === 'minha-conta'
              ? 'bg-blue-600/20 border border-blue-500/40 text-white'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/60 text-zinc-300 hover:border-zinc-700'
          }`}
          title="Ver e editar Minha Conta / 2FA"
        >
          {activeUser?.avatar ? (
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-7 h-7 rounded-lg object-cover border border-zinc-700 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
              {activeUser ? activeUser.name.charAt(0) : 'S'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-200 truncate">
              {activeUser ? activeUser.name : 'Silk Print Gráfica'}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {activeUser?.jobTitle || 'Minha Conta'}
            </div>
          </div>
          {activeUser?.twoFactorEnabled ? (
            <span title="2FA Ativo" className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
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
