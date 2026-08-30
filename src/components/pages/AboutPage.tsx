import React from 'react';
import { Logo } from '../Logo';
import { Printer, Award, ShieldCheck, Truck, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-12" id="about-page">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tradição & Alta Tecnologia Gráfica</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Sobre a Silk Print Gráfica
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Nascemos com a missão de transformar o mercado gráfico brasileiro, combinando o poder do e-commerce ágil, preços direto da fábrica e a mais moderna infraestrutura de impressão offset e digital.
        </p>
      </div>

      {/* Stats Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-cyan-600 font-heading">+250 Mil</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Pedidos Entregues</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-pink-600 font-heading">+5.000</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Balcões de Retirada</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-yellow-500 font-heading">24 Horas</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Produção Express</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">99.4%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Satisfação dos Clientes</div>
        </div>
      </div>

      {/* Machinery & Technology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
        <div className="space-y-4">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Nosso Parque Industrial</div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Equipamentos de Última Geração Offset & Digital
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Contamos com impressoras Heidelberg Speedmaster de 4 e 8 cores, CTPs térmicos de alta definição, plotters Mimaki/Roland de grande formato e linhas automatizadas de corte e dobra com controle densitométrico em tempo real.
          </p>
          <div className="space-y-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Calibração constante de cores no padrão internacional ISO 12647-2</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Papéis certificados FSC de manejo florestal sustentável</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tintas ecológicas com baixa emissão de compostos orgânicos</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
            alt="Parque Gráfico Silk Print"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
