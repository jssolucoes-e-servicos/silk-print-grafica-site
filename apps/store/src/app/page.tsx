import Link from 'next/link';
import { 
  Printer, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { fetchCatalog } from '@/lib/api';

export default async function HomePage() {
  let catalog: any = { categories: [], products: [] };
  try {
    catalog = await fetchCatalog();
  } catch (e) {
    // fallback se a API estiver inicializando
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top Banner Promocional */}
      <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 text-white text-xs font-bold py-2 px-4 text-center">
        ⚡ Produção expressa em 24h e mais de 100 balcões de retirada com frete grátis!
      </div>

      {/* Header Principal da Loja */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <span>SILK<span className="text-cyan-400">PRINT</span></span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar cartão de visita, banner, adesivo..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/gabaritos" className="text-slate-300 hover:text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Gabaritos</span>
            </Link>
            <Link href="/balcoes" className="text-slate-300 hover:text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Balcões</span>
            </Link>
            <Link href="/rastreio" className="text-slate-300 hover:text-white">
              Rastrear Pedido
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 border-b border-slate-800/80 bg-radial from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gráfica Online de Alta Volumetria para Revenda & Empresas</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Impressão profissional com <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">alta precisão</span> e entrega garantida.
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Cartões de visita, panfletos, pastas, adesivos e banners com sangria perfeita, fidelidade de cores CMYK e upload direto de arquivos pesados.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="#produtos" 
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link 
              href="/balcoes" 
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs md:text-sm transition-colors"
            >
              Consultar Balcões de Retirada
            </Link>
          </div>
        </div>
      </section>

      {/* Badges de Confiança */}
      <section className="py-6 px-4 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Garantia de Fidelidade de Cores</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Prazos Expressos em 24h a 72h</span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Retirada Grátis em Balcões</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Checagem Profissional de Arte</span>
          </div>
        </div>
      </section>

      {/* Categorias Populares */}
      <section id="produtos" className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Categorias Principais</h2>
            <p className="text-xs text-slate-400">Escolha o produto ideal para a identidade visual da sua marca</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Cartões de Visita', slug: 'cartoes-de-visita', desc: 'Couché 250g / 300g' },
            { name: 'Panfletos', slug: 'panfletos-folhetos', desc: 'A5, A4 e filipetas' },
            { name: 'Adesivos Vinil', slug: 'adesivos-rotulos', desc: 'Recorte especial' },
            { name: 'Banners Lona', slug: 'banners-faixas', desc: 'Lona 440g com ilhós' },
            { name: 'Pastas & Envelopes', slug: 'pastas-envelopes', desc: 'Com bolsa ou orelha' },
            { name: 'Blocos & Talões', slug: 'blocos-receituarios', desc: 'Serrilha e numeração' },
          ].map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/categoria/${cat.slug}`}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">{cat.name}</h3>
                <p className="text-[11px] text-slate-400">{cat.desc}</p>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-cyan-400 gap-1">
                <span>Configurar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-200">Silk Print Gráfica & Brindes</p>
            <p className="text-[11px]">Alta tecnologia e acabamento fino para a sua marca.</p>
          </div>
          <p>© {new Date().getFullYear()} Silk Print. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
