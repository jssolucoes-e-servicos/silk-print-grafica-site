import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, AlertTriangle, Layers, Palette, ShieldAlert } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface GabaritosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GabaritosModal: React.FC<GabaritosModalProps> = ({ isOpen, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: string, ext: string) => {
    setDownloadSuccess(`Download do gabarito ${format} (${ext}) iniciado com sucesso!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Central de Gabaritos & Padrões Gráficos</h3>
              <p className="text-xs text-slate-400">Linhas de sangria, margens de segurança e padrão de cor CMYK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Technical Specs Guide Box */}
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-950 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-cyan-700" />
              <span>Regras de Fechamento de Arquivo para Não Errar</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="p-2.5 bg-white rounded-xl border border-cyan-100">
                <span className="font-bold text-cyan-900 block mb-0.5">1. Sangria de 2mm</span>
                <p className="text-[11px] text-slate-500">Estenda o fundo da sua arte 2mm além da linha de corte para evitar bordas brancas.</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-cyan-100">
                <span className="font-bold text-cyan-900 block mb-0.5">2. Margem de Segurança 3mm</span>
                <p className="text-[11px] text-slate-500">Mantenha textos e logos a no mínimo 3mm para dentro da linha de corte.</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-cyan-100">
                <span className="font-bold text-cyan-900 block mb-0.5">3. Perfil de Cor CMYK</span>
                <p className="text-[11px] text-slate-500">Converta todas as imagens em CMYK 300 DPI e textos em curvas (vetores).</p>
              </div>
            </div>
          </div>

          {/* List of downloadable templates by product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Modelos de Gabaritos Disponíveis para Download
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {PRODUCTS.map((prod) => (
                <div key={prod.id} className="p-4 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">Formato: {prod.defaultFormat} • Sangria {prod.bleedSpecs.bleedMm}mm</div>
                    </div>
                  </div>

                  {/* Format extensions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownload(prod.defaultFormat, 'PDF')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(prod.defaultFormat, 'CDR')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors"
                    >
                      CorelDRAW
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(prod.defaultFormat, 'AI')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition-colors"
                    >
                      Illustrator
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(prod.defaultFormat, 'PSD')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors"
                    >
                      Photoshop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default GabaritosModal;
