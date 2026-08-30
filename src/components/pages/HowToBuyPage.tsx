import React from 'react';
import { Search, Sliders, Upload, CreditCard, Truck, CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';

export const HowToBuyPage: React.FC = () => {
  const steps = [
    {
      icon: Search,
      num: '1',
      title: 'Escolha seu Produto & Dimensões',
      desc: 'Navegue pelo catálogo e selecione o material que deseja imprimir (cartões, panfletos, adesivos, banners, etc.).',
    },
    {
      icon: Sliders,
      num: '2',
      title: 'Configure Papel, Cores e Acabamentos',
      desc: 'Utilize nosso configurador interativo para definir a gramatura do papel, modo de cor (4x4, 4x0), acabamentos (verniz, laminação) e a tiragem com desconto por volume.',
    },
    {
      icon: Upload,
      num: '3',
      title: 'Envie seu Arquivo ou Contrate a Criação',
      desc: 'Faça o upload do seu PDF, CDR, AI ou JPG com sangria de 2mm. Se preferir, contrate um designer da Silk Print para criar a arte para você!',
    },
    {
      icon: CreditCard,
      num: '4',
      title: 'Selecione a Entrega & Forma de Pagamento',
      desc: 'Escolha entre entrega no seu endereço ou retirada em um dos mais de 5.000 balcões parceiros em todo o Brasil. Pague no PIX com 5% de desconto imediato ou em até 12x no cartão.',
    },
    {
      icon: Truck,
      num: '5',
      title: 'Acompanhe a Produção em Tempo Real',
      desc: 'Receba atualizações em tempo real sobre a pré-impressão, gravação de chapas, impressão e expedição até a entrega final.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10" id="how-to-buy-page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Como Comprar na Silk Print Gráfica
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Comprar materiais gráficos nunca foi tão simples, rápido e transparente. Veja o passo a passo completo:
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-cyan-400 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shrink-0 font-heading">
                {step.num}
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cyan-600" />
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default HowToBuyPage;
