import React from 'react';
import { Logo } from './Logo';
import { ActiveView } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Award, 
  CreditCard, 
  QrCode, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Truck, 
  Heart,
  Send
} from 'lucide-react';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
  onOpenGabaritos: () => void;
  onOpenBalcoes: () => void;
  onOpenQuote: () => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveView,
  onOpenGabaritos,
  onOpenBalcoes,
  onOpenQuote,
  onOpenTracking,
}) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999998888';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contato@silkprintgrafica.com.br';

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs" id="main-site-footer">
      
      {/* 1. Newsletter Row */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-white font-heading">
              Cadastre-se e ganhe R$ 20 OFF no seu primeiro pedido
            </h3>
            <p className="text-slate-400 text-xs">
              Receba cupons de desconto, novos lançamentos e gabaritos atualizados toda semana.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Obrigado! Use o cupom BEMVINDO para R$ 20 OFF.');
            }}
            className="flex w-full md:w-auto gap-2"
          >
            <input
              type="email"
              required
              placeholder="Digite seu melhor e-mail..."
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <span>Cadastrar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. Main Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Col 1: Brand & Contact */}
        <div className="lg:col-span-2 space-y-4">
          <Logo variant="full" size="md" theme="light" />
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            A Silk Print Gráfica é a sua gráfica online com parque industrial de alta capacidade, entregando materiais com fidelidade de cor, preços de fábrica e rapidez incomparável em todo o Brasil.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>(11) 3344-5500 / WhatsApp: (11) 99999-8888</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-pink-400" />
              <span>{contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-yellow-400" />
              <span>Parque Gráfico Central • São Paulo / SP</span>
            </div>
          </div>
        </div>

        {/* Col 2: Mais Procurados */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs font-heading">
            Mais Procurados
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Cartão Verniz Localizado</button></li>
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Panfletos & Flyers 24h</button></li>
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Adesivos em Vinil</button></li>
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Banners com Ilhós</button></li>
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Pastas Corporativas</button></li>
            <li><button onClick={() => setActiveView('home')} className="hover:text-cyan-400">Sacolas em Papel Kraft</button></li>
          </ul>
        </div>

        {/* Col 3: Institucional */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs font-heading">
            Institucional
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li><button onClick={() => setActiveView('about')} className="hover:text-cyan-400">Sobre a Silk Print</button></li>
            <li><button onClick={() => setActiveView('how-to-buy')} className="hover:text-cyan-400">Como Comprar</button></li>
            <li><button onClick={onOpenBalcoes} className="hover:text-cyan-400">Balcões de Retirada</button></li>
            <li><button onClick={onOpenQuote} className="hover:text-cyan-400">Orçamento Especial</button></li>
            <li><button onClick={() => setActiveView('contact')} className="hover:text-cyan-400">Fale Conosco</button></li>
            <li><button onClick={() => setActiveView('help')} className="hover:text-cyan-400">Dúvidas Frequentes</button></li>
          </ul>
        </div>

        {/* Col 4: Designers & Suporte */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs font-heading">
            Área do Designer
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li><button onClick={onOpenGabaritos} className="hover:text-cyan-400 font-bold text-cyan-400">Baixar Gabaritos (CDR/AI/PDF)</button></li>
            <li><button onClick={onOpenTracking} className="hover:text-cyan-400">Rastreamento de Produção</button></li>
            <li><button onClick={() => setActiveView('help')} className="hover:text-cyan-400">Guia de Sangria & CMYK</button></li>
            <li><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-emerald-400 font-semibold flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> Suporte no WhatsApp
            </a></li>
          </ul>
        </div>

      </div>

      {/* 3. Payment & Security Seals */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-slate-400 font-semibold">Formas de Pagamento:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> PIX (5% OFF)
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Cartão até 12x
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                Boleto / PJ
              </span>
            </div>
          </div>

          {/* Security seals */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Site 100% Blindado</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Lock className="w-4 h-4" />
              <span>SSL 256 Bits</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>Garantia de Qualidade</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Copyright & Disclaimer */}
      <div className="border-t border-slate-800/40 py-4 px-4 sm:px-8 text-center text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Silk Print Gráfica & Comunicação Visual Ltda. CNPJ: 28.194.882/0001-40.
          </span>
          <span>
            Parque Gráfico Offset & Impressão Digital Alta Definição.
          </span>
        </div>
      </div>

    </footer>
  );
};
export default Footer;
