import React from 'react';
import { X, Sparkles, Check, Zap, Shield, ArrowRight } from 'lucide-react';

interface ModalUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalUpgrade: React.FC<ModalUpgradeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-upgrade-plano"
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Assinar Plano CatalogLab Pro
              </h3>
              <p className="text-xs text-zinc-400">
                Desbloqueie todos os recursos ilimitados para sua gráfica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Plan card */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-blue-500/10 to-zinc-950 border border-blue-500/30 relative">
            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-full">
              Mais Popular
            </span>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-zinc-100">Plano Gráfica PRO</h4>
                <p className="text-xs text-zinc-400">Catálogo digital + Gestão de produção completa</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400 font-mono">R$ 79,90</span>
                <span className="text-xs text-zinc-500">/mês</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 my-4">
              {[
                'Produtos e categorias ilimitados',
                'Quadro Kanban com 7 status',
                'Orçamentos com cálculo por m²',
                'Envio para WhatsApp com 1 clique',
                'Controle financeiro de receitas e caixa',
                'Domínio próprio e link @silkprint',
                'Suporte prioritário via WhatsApp',
                'Exportação em PDF e Planilhas',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                alert('Redirecionando para o checkout seguro de assinatura...');
                onClose();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>Assinar Agora com 7 Dias de Garantia</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Cancelamento a qualquer momento
            </span>
            <span>•</span>
            <span>Pagamento via Cartão ou PIX</span>
          </div>
        </div>
      </div>
    </div>
  );
};
