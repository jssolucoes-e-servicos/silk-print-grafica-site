import React from 'react';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Store,
  Plus,
  Database,
} from 'lucide-react';
import { SidebarMode, UserEmployee } from '../types';
import { LogOut, UserCircle } from 'lucide-react';

interface TopHeaderProps {
  sidebarMode: SidebarMode;
  currentRoute: string;
  activeUser?: UserEmployee;
  onLogout?: () => void;
  onNavigateToMyAccount?: () => void;
  onToggleSidebarMode: () => void;
  onOpenCatalogPreview: () => void;
  onOpenNovaReceita: () => void;
  onNavigateToNovoOrcamento: () => void;
  onMobileMenuToggle: () => void;
  onOpenDataControls?: () => void;
  onOpenEcommerceStorefront?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  sidebarMode,
  currentRoute,
  activeUser,
  onLogout,
  onNavigateToMyAccount,
  onToggleSidebarMode,
  onOpenCatalogPreview,
  onOpenNovaReceita,
  onNavigateToNovoOrcamento,
  onMobileMenuToggle,
  onOpenDataControls,
  onOpenEcommerceStorefront,
}) => {
  const getBreadcrumb = () => {
    const isGestao = sidebarMode === 'gestao';
    const mainSection = isGestao ? 'Gestão Gráfica' : 'smartGraph';

    const routeNames: Record<string, string> = {
      dashboard: 'Dashboard',
      'visao-geral': 'Visão Geral',
      clientes: 'Clientes',
      'novo-orcamento': 'Novo Orçamento',
      orcamentos: 'Orçamentos',
      pedidos: 'Pedidos',
      produtos: 'Produtos',
      'produtos-internos': 'Produtos Internos',
      acabamentos: 'Acabamentos',
      agenda: 'Agenda',
      'pedidos-online': 'Pedidos Online',
      'declaracao-conteudo': 'Declaração de Conteúdo',
      financeiro: 'Financeiro',
      relatorios: 'Relatórios',
      categorias: 'Categorias',
      precificacao: 'Precificação',
      metricas: 'Métricas',
      exportar: 'Exportar',
      aparencia: 'Aparência',
      pagamentos: 'Pagamentos',
      integracoes: 'Integrações',
      funcionarios: 'Colaboradores',
      perfis: 'Perfis de Acesso',
      'minha-conta': 'Minha Conta',
    };

    return {
      main: mainSection,
      sub: routeNames[currentRoute] || currentRoute,
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-14 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          aria-label="Abrir Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300 flex items-center gap-1.5">
            {sidebarMode === 'gestao' ? (
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            )}
            {breadcrumb.main}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="font-semibold text-zinc-100">{breadcrumb.sub}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Real Data Status Badge Button */}
        {onOpenDataControls && (
          <button
            onClick={onOpenDataControls}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
            title="Clique para gerenciar o banco de dados real, sincronização e persistência"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Banco Real Ativo</span>
          </button>
        )}

        {/* Ver Loja Virtual / Ecommerce Button */}
        {onOpenEcommerceStorefront && (
          <button
            onClick={onOpenEcommerceStorefront}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Acessar o E-commerce / Loja Virtual pública (/)"
          >
            <Store className="w-3.5 h-3.5 text-cyan-400" />
            <span>Loja Virtual</span>
            <span className="font-mono text-[10px] text-cyan-400/80 hidden lg:inline">(/)</span>
          </button>
        )}

        {/* Toggle Mode Button */}
        <button
          onClick={onToggleSidebarMode}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
        >
          {sidebarMode === 'admin' ? (
            <>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Ir para Módulo Gestão</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Voltar ao CatalogLab</span>
            </>
          )}
        </button>

        {/* User Info & Logout */}
        {activeUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={onNavigateToMyAccount}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors text-left cursor-pointer"
              title="Minha Conta e Segurança 2FA"
            >
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                  {activeUser.name.charAt(0)}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-200 leading-tight truncate max-w-[140px]">
                  {activeUser.name}
                </span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wide uppercase">
                  {activeUser.jobTitle || 'Minha Conta'}
                </span>
              </div>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/50 border border-zinc-800 text-zinc-400 transition-colors cursor-pointer"
                title="Encerrar Sessão (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

