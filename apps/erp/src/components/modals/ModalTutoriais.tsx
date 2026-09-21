import React from 'react';
import { X, GraduationCap, Play, CheckCircle2, BookOpen } from 'lucide-react';

interface ModalTutoriaisProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalTutoriais: React.FC<ModalTutoriaisProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tutoriais = [
    {
      title: '1. Como cadastrar produtos e tabelas por m²',
      duration: '4 min',
      desc: 'Aprenda a cadastrar lonas, adesivos e configurar preços por metro quadrado.',
    },
    {
      title: '2. Criando e enviando orçamentos profissionais',
      duration: '3 min',
      desc: 'Como montar orçamentos rápidos, adicionar itens sob medida e enviar no WhatsApp.',
    },
    {
      title: '3. Gerenciando o fluxo de produção no Kanban',
      duration: '5 min',
      desc: 'Como mover pedidos entre os 7 status e avisar clientes automaticamente.',
    },
    {
      title: '4. Configurando a chave PIX e vendas rápidas',
      duration: '2 min',
      desc: 'Lançando entradas de caixa e vendas de balcão no módulo financeiro.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-tutoriais"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Aprenda a usar o CatalogLab
              </h3>
              <p className="text-xs text-zinc-400">
                Vídeos rápidos e passo a passo para dominar a plataforma
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

        {/* Content */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {tutoriais.map((tut, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-blue-500/40 transition-colors group cursor-pointer"
              onClick={() => alert(`Iniciando vídeo: "${tut.title}"`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {tut.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{tut.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                  {tut.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Central de Ajuda Silk Print
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
