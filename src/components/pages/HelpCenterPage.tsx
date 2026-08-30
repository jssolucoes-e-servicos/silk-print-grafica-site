import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, FileCheck, ShieldAlert } from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é sangria e margem de segurança no arquivo?',
      a: 'A sangria é uma borda extra de 2mm ao redor de todo o documento onde o fundo/cor da sua arte deve se estender. Isso evita que pequenas variações no corte da guilhotina deixem fios brancos nas bordas. Já a margem de segurança (3mm para dentro) protege textos e logos de serem cortados acidentalmente.',
    },
    {
      q: 'Qual é o prazo de produção e como funciona a opção 24 Horas?',
      a: 'A maioria dos nossos cartões e panfletos conta com a modalidade Express 24h. O prazo começa a ser contado a partir da aprovação financeira e validação do arquivo de arte pela nossa equipe de pré-impressão.',
    },
    {
      q: 'Como funcionam os Balcões de Retirada?',
      a: 'Possuímos mais de 5.000 pontos parceiros em capitais e cidades de todo o Brasil. Você escolhe o ponto mais perto da sua casa ou empresa e retira seu pedido sem custo de frete (para pedidos elegíveis) ou com taxa fixa simbólica a partir de R$ 6,90.',
    },
    {
      q: 'Quais formatos de arquivo são aceitos?',
      a: 'Recomendamos PDF/X-1a com fontes convertidas em curvas e imagens em CMYK 300 DPI. Também aceitamos arquivos nativos do CorelDraw (.CDR), Adobe Illustrator (.AI), Photoshop (.PSD) e imagens JPG de alta resolução.',
    },
    {
      q: 'Vocês criam a arte caso eu não tenha designer?',
      a: 'Sim! Na tela de configuração do produto, selecione a opção "Contratar Criação de Arte Profissional". Nossa equipe de designers entrará em contato via WhatsApp para alinhar suas preferências e enviar prévias para sua aprovação antes da impressão.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10" id="help-center-page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Central de Ajuda & Dúvidas Frequentes
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Tire suas dúvidas técnicas sobre arquivos, prazos, fretes e acabamentos gráficos.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-cyan-700"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-cyan-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default HelpCenterPage;
