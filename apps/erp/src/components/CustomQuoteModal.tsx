import React, { useState } from 'react';
import { X, Send, MessageCircle, FileText, CheckCircle2, ShieldCheck, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { formatPhone } from '../lib/utils';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [material, setMaterial] = useState('Cartões de Visita Especiais / Hot Stamping');
  const [quantity, setQuantity] = useState('5.000 unidades');
  const [dimensions, setDimensions] = useState('');
  const [finishing, setFinishing] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999998888';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const description = `Tipo de Material: ${material}\n` +
      `Tiragem Estimada: ${quantity}\n` +
      (dimensions ? `Medidas: ${dimensions}\n` : '') +
      (finishing ? `Acabamentos: ${finishing}\n` : '') +
      (message ? `Observações: ${message}` : '');

    try {
      // Dispatches lead to /api/quote for admin email alert & n8n webhook automation
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          description: description.trim(),
          channel: 'whatsapp',
          source: 'Modal de Orçamento Personalizado'
        })
      });
    } catch (err) {
      console.warn('Backend quote lead logging fallback:', err);
    } finally {
      setIsSubmitting(false);
    }

    const payload = `*SOLICITAÇÃO DE ORÇAMENTO PERSONALIZADO*\n\n` +
      `👤 *Cliente:* ${name}\n` +
      `📱 *Telefone/WhatsApp:* ${phone}\n` +
      (email ? `✉️ *E-mail:* ${email}\n` : '') +
      `📦 *Tipo de Material:* ${material}\n` +
      `🔢 *Tiragem:* ${quantity}\n` +
      (dimensions ? `📐 *Medidas:* ${dimensions}\n` : '') +
      (finishing ? `✨ *Acabamentos:* ${finishing}\n` : '') +
      (message ? `📝 *Observações:* ${message}\n` : '');

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(payload)}`;
    window.open(waUrl, '_blank');
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Orçamento Especial Sob Medida</h3>
              <p className="text-xs text-slate-400">Projetos especiais, grandes tiragens e facas personalizadas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isSent ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Orçamento Enviado com Sucesso!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Sua solicitação foi encaminhada para a equipe de orçamentos técnicos da Silk Print Gráfica. Responderemos em instantes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="Ex: Carlos Mendes"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="carlos@empresa.com.br"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Material Desejado</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: Caixa personalizada, catálogo 32 págs..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiragem Estimada</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: 5.000 un, 10.000 un, 50m²..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dimensões / Formato Aberto</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: 21x29.7cm (A4)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Acabamentos Especiais</label>
                  <input
                    type="text"
                    value={finishing}
                    onChange={(e) => setFinishing(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: Hot stamping dourado, corte especial..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detalhes Adicionais</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Informe prazos de entrega desejados, gramatura específica de papel ou tire dúvidas..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Enviar Orçamento no WhatsApp da Silk Print</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sem compromisso. Atendimento consultivo para designers e empresas.</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
export default CustomQuoteModal;
