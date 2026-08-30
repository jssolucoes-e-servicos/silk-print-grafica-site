import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatPhone } from '../../lib/utils';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Dúvida sobre Pedido / Arte');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999998888';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contato@silkprintgrafica.com.br';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10" id="contact-page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Fale com a Silk Print Gráfica
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Nossa equipe de consultores gráficos e técnicos de pré-impressão está pronta para ajudar você.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Canais Diretos</h3>
            
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">WhatsApp Oficial</div>
                <div className="text-[11px] text-emerald-700">Atendimento humanizado rápido</div>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-800">
              <Mail className="w-5 h-5 text-cyan-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">E-mail Comercial</div>
                <div className="text-[11px] text-slate-500">{contactEmail}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-800">
              <Clock className="w-5 h-5 text-pink-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">Horário de Atendimento</div>
                <div className="text-[11px] text-slate-500">Segunda a Sexta: 08h às 18h</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-800">
              <MapPin className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">Parque Gráfico & Balcão Matriz</div>
                <div className="text-[11px] text-slate-500">São Paulo / SP - Atendimento nacional</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {isSent ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Mensagem Enviada com Sucesso!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Recebemos seu contato. Responderemos no seu e-mail e WhatsApp em até 30 minutos úteis.
              </p>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Enviar Nova Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 font-heading">Envie uma Mensagem</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="Seu nome"
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
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="seuemail@dominio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assunto</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="Dúvida sobre Pedido / Arte">Dúvida sobre Pedido / Envio de Arte</option>
                  <option value="Orçamento Personalizado">Solicitação de Orçamento Sob Medida</option>
                  <option value="Parceria / Balcão de Retirada">Quero ser um Balcão de Retirada Parceiro</option>
                  <option value="Outro Assunto">Outro Assunto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Escreva sua dúvida ou mensagem..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Mensagem</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
export default ContactPage;
