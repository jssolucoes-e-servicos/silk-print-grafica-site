import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Server,
  Zap,
  HardDrive,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  fetchRealDataStatus,
  clearDemoDataAndStartFresh,
  syncAllToPostgresDatabase,
} from '../../lib/realDataApi';

interface ModalGerenciarDadosReaisProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
  onNavigateToIntegracoes?: () => void;
}

export const ModalGerenciarDadosReais: React.FC<ModalGerenciarDadosReaisProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
  onNavigateToIntegracoes,
}) => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRealDataStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setActionMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearDemo = async () => {
    if (
      !window.confirm(
        'Tem certeza que deseja limpar os dados de demonstração? Isso removerá os cadastros de exemplo e deixará o banco de dados pronto para sua produção 100% real.'
      )
    ) {
      return;
    }

    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await clearDemoDataAndStartFresh();
      setActionMessage({ type: 'success', text: res.message || 'Dados de demonstração limpos com sucesso!' });
      await loadStatus();
      onDataReloaded();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao limpar demonstração.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncPostgres = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await syncAllToPostgresDatabase();
      setActionMessage({
        type: res.success ? 'success' : 'error',
        text: res.message || (res.success ? 'Sincronizado com PostgreSQL!' : 'Falha na sincronização.'),
      });
      await loadStatus();
      onDataReloaded();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao sincronizar com PostgreSQL.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Central de Dados Reais & Persistência</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ATIVO
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                PostgreSQL + Prisma ORM + Armazenamento Centralizado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Notification banner */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/30 border-red-800 text-red-300'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Infrastructure Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>PostgreSQL</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {status?.postgresConnected ? 'Conectado & Sincronizado' : 'Pronto p/ Conexão'}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Prisma Client Habilitado
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>MinIO S3</span>
              </div>
              <p className="text-[11px] text-zinc-400">Armazenamento de Arquivos</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-purple-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Uploads até 50MB
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>n8n Webhooks</span>
              </div>
              <p className="text-[11px] text-zinc-400">Automação de Eventos</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Disparos em Tempo Real
              </div>
            </div>
          </div>

          {/* Counts Overview */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-zinc-300 mb-3 flex items-center justify-between">
              <span>Registros Persistidos Atualmente</span>
              <button
                onClick={loadStatus}
                disabled={isLoading}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Clientes:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.clientsCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Pedidos:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.ordersCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Orçamentos:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.quotesCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Produtos:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.productsCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Acabamentos:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.finishingsCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Transações:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.transactionsCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Colaboradores:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.employeesCount ?? 0}</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[11px]">Perfis Acesso:</span>
                <p className="text-base font-bold text-white mt-0.5">{status?.profilesCount ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Real Data Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300">Ações de Manutenção de Dados</h4>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleSyncPostgres}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                Sincronizar com PostgreSQL
              </button>

              <button
                onClick={handleClearDemo}
                disabled={isLoading}
                className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/80 text-red-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                title="Remove registros de exemplo para começar sua produção do zero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Demonstração (Iniciar Banco Limpo)
              </button>
            </div>

            {onNavigateToIntegracoes && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToIntegracoes();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Configurar Credenciais PostgreSQL / MinIO / n8n</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 ml-auto" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Persistência garantida</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
