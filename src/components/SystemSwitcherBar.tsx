import React from 'react';
import { Store, Printer, ExternalLink, ArrowRight, Shield } from 'lucide-react';

interface SystemSwitcherBarProps {
  activeSystem: 'store' | 'erp';
  onSwitchToStore: () => void;
  onSwitchToErp: () => void;
}

export const SystemSwitcherBar: React.FC<SystemSwitcherBarProps> = ({
  activeSystem,
  onSwitchToStore,
  onSwitchToErp,
}) => {
  return (
    <div
      id="system-switcher-bar"
      className="bg-slate-950 border-b border-slate-800 text-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none z-50 sticky top-0"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
          Alternar Sistema:
        </span>

        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 shadow-inner">
          <button
            id="switch-btn-store"
            type="button"
            onClick={onSwitchToStore}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSystem === 'store'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Acessar a Loja Virtual / E-commerce público (/) da Silk Print"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Loja Virtual</span>
            <span className="font-mono text-[10px] opacity-75 hidden md:inline">(/)</span>
            {activeSystem === 'store' && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
            )}
          </button>

          <button
            id="switch-btn-erp"
            type="button"
            onClick={onSwitchToErp}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSystem === 'erp'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Acessar o Painel Administrativo / ERP Industrial (/erp)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ERP Industrial</span>
            <span className="font-mono text-[10px] opacity-75 hidden md:inline">(/erp)</span>
            {activeSystem === 'erp' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        {activeSystem === 'store' ? (
          <div className="flex items-center gap-2 text-cyan-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Você está navegando na <strong>Loja Virtual</strong> (E-commerce da gráfica)</span>
            <button
              onClick={onSwitchToErp}
              className="ml-2 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ir para o ERP (/erp)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Você está no <strong>ERP Industrial & PCP</strong> (Gestão interna)</span>
            <button
              onClick={onSwitchToStore}
              className="ml-2 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver Loja Virtual (/)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
