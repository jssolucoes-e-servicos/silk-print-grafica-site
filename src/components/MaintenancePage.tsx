import React, { useState } from 'react';
import { Logo } from './Logo';
import { 
  Send, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  Sparkles,
  ExternalLink,
  Loader2,
  FileText,
  BellRing
} from 'lucide-react';
import { formatPhone } from '../lib/utils';

interface MaintenancePageProps {}

export const MaintenancePage: React.FC<MaintenancePageProps> = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastLeadId, setLastLeadId] = useState('');
  const [error, setError] = useState('');

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999998888';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'orcamentos@silkprintgrafica.com.br';

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
      setError('Por favor, descreva o que você deseja orçar (detalhes do material, medidas, acabamentos e quantidades).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send quote to full-stack API endpoint to alert admin via email & trigger n8n automation
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          description: description.trim(),
          channel,
          source: `Página de Manutenção (${channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'})`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar sua solicitação.');
      }

      if (data.leadId) {
        setLastLeadId(data.leadId);
      }

      if (channel === 'whatsapp') {
        const waUrl = data.whatsappUrl || `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `*SOLICITAÇÃO DE ORÇAMENTO - SILK PRINT GRÁFICA*\n\n` +
          `👤 *Cliente:* ${name.trim()}\n` +
          `📱 *WhatsApp:* ${phone.trim()}\n` +
          (email ? `✉️ *E-mail:* ${email.trim()}\n` : '') +
          `📝 *O que desejo orçar:*\n${description.trim()}\n\n` +
          `_Enviado via Atendimento de Plantão_`
        )}`;
        window.open(waUrl, '_blank');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Error submitting quote:', err);
      // Fallback: If network is offline, open WhatsApp directly
      if (channel === 'whatsapp') {
        const text = `*SOLICITAÇÃO DE ORÇAMENTO - SILK PRINT GRÁFICA*\n\n` +
          `👤 *Cliente:* ${name.trim()}\n` +
          `📱 *WhatsApp:* ${phone.trim()}\n` +
          (email ? `✉️ *E-mail:* ${email.trim()}\n` : '') +
          `📝 *O que desejo orçar:*\n${description.trim()}\n\n` +
          `_Enviado via Atendimento de Plantão_`;
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
        setIsSubmitted(true);
      } else {
        setError(err instanceof Error ? err.message : 'Falha ao enviar formulário. Tente novamente ou use o WhatsApp direto.');
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

      {/* Top Bar with Logo & Status */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Logo variant="full" size="md" theme="light" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Manutenção Programada</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Notice & Brand Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Atualização de Plataforma & Parque Gráfico</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Estamos preparando novidades para você!
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Nosso portal e-commerce está passando por melhorias estruturais para oferecer um configurador gráfico ainda mais ágil, novos acabamentos e cálculo de frete instantâneo.
              </p>
            </div>

            {/* Status highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Retorno Previsto</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Em poucas horas o sistema estará 100% normalizado.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
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
                  <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
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
                      <span>Protocolo: <strong className="text-slate-200">{lastLeadId}</strong> • Notificação disparada ao administrador</span>
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
                  {/* Channel Selector */}
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

                  {/* Nome */}
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

                  {/* Telefone & Email */}
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

                  {/* Campo Único de Descrição do Orçamento (Sem opções fixas de material/quantidade) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-200" htmlFor="textarea-maintenance-description">
                        O que você deseja orçar? *
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Descreva material, tiragem e medidas
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
                    <span>Seus dados são enviados diretamente à nossa central de orçamento com aviso imediato ao administrador.</span>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-8 py-6 text-center text-xs text-slate-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
          <span>Silk Print Gráfica & Comunicação Visual</span>
          <span className="hidden sm:inline">•</span>
          <span>Parque Gráfico Offset & Impressão Digital Alta Resolução</span>
          <span className="hidden sm:inline">•</span>
          <span>Mais de 5.000 balcões de retirada em todo o Brasil</span>
        </div>
        <p className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} Silk Print Gráfica. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
export default MaintenancePage;
