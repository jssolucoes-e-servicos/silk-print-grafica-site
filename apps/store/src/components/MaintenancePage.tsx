'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  Mail, 
  Send, 
  ExternalLink, 
  Printer, 
  AlertTriangle,
  Loader2,
  ShieldCheck,
  BellRing
} from 'lucide-react';

interface MaintenancePageProps {
  onBypass?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onBypass }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastLeadId, setLastLeadId] = useState('');
  const [error, setError] = useState('');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5551936187210';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'orcamentos@silkprintgrafica.com.br';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.silkprint.com.br/api';
  const showForm = process.env.NEXT_PUBLIC_SHOW_MAINTENANCE_FORM !== 'false';

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Por favor, informe um telefone/WhatsApp válido com DDD.');
      return;
    }

    if (channel === 'email' && !email.trim()) {
      setError('O e-mail é obrigatório para envio por e-mail.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor, descreva o que deseja orçar (material, tiragem, acabamento).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const leadPayload = {
      client: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        description: description.trim(),
      },
      channel: channel,
      source: 'tela_manutencao',
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Submit lead to server route
      const response = await fetch(`${apiUrl}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      });

      const result = await response.json().catch(() => ({}));

      setLastLeadId(result.leadId || `ORC-${Date.now().toString().slice(-6)}`);
      setIsSubmitted(true);

      // 2. If WhatsApp channel selected, also open direct WhatsApp chat
      if (channel === 'whatsapp') {
        const cleanAdminPhone = whatsappNumber.replace(/\D/g, '');
        const waMsg = 
          `*NOVO ORÇAMENTO - SILK PRINT GRÁFICA*\n` +
          `-----------------------------------\n` +
          `*Cliente:* ${name.trim()}\n` +
          `*Telefone/Whats:* ${phone.trim()}\n` +
          `${email.trim() ? `*E-mail:* ${email.trim()}\n` : ''}` +
          `*Origem:* Portal em Manutenção\n` +
          `-----------------------------------\n` +
          `*O que deseja orçar:*\n${description.trim()}\n` +
          `-----------------------------------\n` +
          `_Protocolo gerado no portal Silk Print_`;

        const waUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(waMsg)}`;
        
        setTimeout(() => {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }, 600);
      }
    } catch (err: unknown) {
      console.warn('API fallback to direct WhatsApp:', err);
      if (channel === 'whatsapp') {
        const cleanAdminPhone = whatsappNumber.replace(/\D/g, '');
        const waMsg = 
          `*ORÇAMENTO DIRETO - SILK PRINT GRÁFICA*\n` +
          `*Cliente:* ${name.trim()}\n` +
          `*Telefone:* ${phone.trim()}\n` +
          `*Pedido:*\n${description.trim()}`;
        window.open(`https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
        setIsSubmitted(true);
      } else {
        setError('Falha ao conectar com o servidor. Envie seu orçamento direto pelo WhatsApp de plantão.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden" id="maintenance-page">
      {/* Background CMYK subtle glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Logo */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <span>SILK<span className="text-cyan-400">PRINT</span></span>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 ml-2">
            GRÁFICA
          </span>
        </div>

        {onBypass && (
          <button
            onClick={onBypass}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            [Acesso Restrito]
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        {showForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Notice & Brand Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Atualização de Plataforma & Parque Gráfico</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Estamos preparando novidades para você!
                </h1>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Nosso portal e-commerce está passando por melhorias estruturais para oferecer um configurador gráfico ainda mais ágil, novos acabamentos e cálculo de frete instantâneo.
                </p>
              </div>

              {/* Status highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Retorno Previsto</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Em breve o sistema estará 100% normalizado.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Produção Ativa</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Nossas máquinas offset e digitais continuam rodando normalmente.</p>
                  </div>
                </div>
              </div>

              {/* Direct Contact Options */}
              <div className="pt-4 border-t border-slate-800/80">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Atendimento Imediato de Plantão
                </h4>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de fazer um orçamento com a Silk Print Gráfica.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40"
                    id="btn-direct-wa"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp de Plantão</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>

                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
                    id="btn-direct-email"
                  >
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>{contactEmail}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Quote Request Form */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Printer className="w-5 h-5 text-cyan-400" />
                      <span>Fazer Orçamento Rápido</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Descreva o que deseja produzir e nossa equipe responde com cotação imediata.
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Solicitação Encaminhada!</h4>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Recebemos sua mensagem! Nossa equipe de atendimento foi alertada e entrará em contato via {channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} com o orçamento detalhado.
                    </p>
                    
                    {lastLeadId && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400">
                        <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Protocolo: <strong className="text-slate-200">{lastLeadId}</strong></span>
                      </div>
                    )}

                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setDescription('');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-semibold border border-slate-700 transition-colors"
                        id="btn-new-quote"
                      >
                        Enviar Outro Orçamento
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" id="maintenance-quote-form">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setChannel('whatsapp')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                          channel === 'whatsapp'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        id="tab-channel-whatsapp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Via WhatsApp (Mais Rápido)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannel('email')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                          channel === 'email'
                            ? 'bg-cyan-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        id="tab-channel-email"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Via E-mail</span>
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="input-maintenance-name">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva / Empresa Exemplo"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        id="input-maintenance-name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="input-maintenance-phone">
                          WhatsApp / Celular *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(11) 98765-4321"
                          value={phone}
                          onChange={handlePhoneChange}
                          maxLength={15}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          id="input-maintenance-phone"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="input-maintenance-email">
                          E-mail {channel === 'whatsapp' ? '(Opcional)' : '*'}
                        </label>
                        <input
                          type="email"
                          required={channel === 'email'}
                          placeholder="contato@seusite.com.br"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          id="input-maintenance-email"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-200" htmlFor="textarea-maintenance-description">
                          O que você deseja orçar? *
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Material, tiragem e medidas
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        required
                        placeholder="Descreva o que precisa orçar. Ex: Gostaria de 1.000 cartões de visita 4x4 couché 300g com laminação fosca, e também 2 banners 80x120cm em lona 440g..."
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
                        id="textarea-maintenance-description"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isSubmitting
                          ? 'opacity-75 cursor-not-allowed bg-slate-700 text-slate-300'
                          : channel === 'whatsapp'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                      }`}
                      id="btn-submit-maintenance-quote"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando solicitação...</span>
                        </>
                      ) : channel === 'whatsapp' ? (
                        <>
                          <MessageCircle className="w-5 h-5 fill-current" />
                          <span>Enviar Orçamento no WhatsApp Agora</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Solicitação por E-mail</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1 text-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Seus dados são enviados diretamente à nossa central de orçamento.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full text-center space-y-8 py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-400 text-xs font-semibold mx-auto">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Atualização de Plataforma & Parque Gráfico</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Estamos preparando novidades para você!
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Nosso portal e-commerce está passando por melhorias estruturais para oferecer um configurador gráfico ainda mais ágil, novos acabamentos e cálculo de frete instantâneo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de fazer um orçamento com a Silk Print Gráfica.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/50"
                id="btn-direct-wa-centered"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Falar no WhatsApp Agora</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
                id="btn-direct-email-centered"
              >
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>{contactEmail}</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-8 py-6 text-center text-xs text-slate-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
          <span>Silk Print Gráfica</span>
        </div>
        <p className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} Silk Print Gráfica. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
