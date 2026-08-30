import React, { useState } from 'react';
import { Logo } from './Logo';
import { CATEGORIES } from '../data/products';
import { Product, ActiveView } from '../types';
import { 
  Search, 
  ShoppingCart, 
  User, 
  MapPin, 
  Download, 
  HelpCircle, 
  MessageCircle, 
  Truck, 
  CreditCard, 
  FileText, 
  ChevronDown, 
  Menu, 
  X,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenGabaritos: () => void;
  onOpenBalcoes: () => void;
  onOpenQuote: () => void;
  onOpenTracking: () => void;
  allProducts: Product[];
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  cartCount,
  cartTotal,
  onOpenCart,
  onSelectProduct,
  onOpenGabaritos,
  onOpenBalcoes,
  onOpenQuote,
  onOpenTracking,
  allProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategoryDropdown, setSelectedCategoryDropdown] = useState<string | null>(null);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999998888';

  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm" id="main-site-header">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FRETE GRÁTIS</span>
            </span>
            <span className="hidden sm:inline text-slate-300">
              para balcões de retirada em compras acima de R$ 199,00
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-pink-400" /> Produção Express 24 Horas
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <button
              onClick={onOpenTracking}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rastrear Pedido</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenBalcoes}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              <span>5.000+ Balcões</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Atendimento</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW (LOGO, SEARCH, ACTIONS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveView('home')} 
          className="cursor-pointer shrink-0"
          id="header-logo-click"
        >
          <Logo variant="full" size="md" />
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="flex-1 max-w-2xl relative hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="O que você precisa imprimir hoje? (ex: Cartão 300g, Banner, Adesivo, Folder...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              id="main-search-input"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            
            <button
              onClick={() => {
                if (filteredProducts.length > 0) {
                  onSelectProduct(filteredProducts[0]);
                  setIsSearchOpen(false);
                }
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsSearchOpen(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-20 max-h-96 overflow-y-auto divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-cyan-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.category} • Produção {p.productionTimeHours}h</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-cyan-700">A partir de {formatCurrency(p.basePrice)}</div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Configurar</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Nenhum produto encontrado para "{searchQuery}". Tente pesquisar por cartão, banner ou adesivo.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons: Gabaritos, Orçamento, Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <button
            onClick={onOpenGabaritos}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            title="Download de Gabaritos para Designers"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>Gabaritos</span>
          </button>

          <button
            onClick={onOpenQuote}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
          >
            <FileText className="w-4 h-4 text-pink-600" />
            <span>Orçamento Especial</span>
          </button>

          {/* Cart Button with Count Badge */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20 active:scale-95"
            id="btn-header-cart"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="hidden md:inline bg-cyan-700 px-1.5 py-0.5 rounded text-[10px]">
                {formatCurrency(cartTotal)}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* 3. CATEGORIES MEGA BAR */}
      <nav className="border-t border-slate-200/80 bg-slate-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeView === 'home' ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-slate-200/70 text-slate-800'
              }`}
            >
              Todos os Produtos
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const firstProdInCat = allProducts.find(p => p.categorySlug === cat.slug);
                  if (firstProdInCat) onSelectProduct(firstProdInCat);
                }}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-200/70 hover:text-cyan-800 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
                {cat.id === 'cartoes' && (
                  <span className="text-[9px] px-1 rounded bg-pink-100 text-pink-700 font-extrabold">TOP</span>
                )}
                {cat.id === 'panfletos' && (
                  <span className="text-[9px] px-1 rounded bg-cyan-100 text-cyan-800 font-extrabold">24H</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-slate-200">
            <button
              onClick={() => setActiveView('how-to-buy')}
              className="hover:text-cyan-700 text-slate-600 transition-colors"
            >
              Como Comprar
            </button>
            <button
              onClick={() => setActiveView('help')}
              className="hover:text-cyan-700 text-slate-600 transition-colors"
            >
              Ajuda & FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-1 text-sm font-semibold">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold px-2 py-1">Categorias</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const firstProd = allProducts.find(p => p.categorySlug === cat.slug);
                  if (firstProd) onSelectProduct(firstProd);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-between"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-slate-400 font-normal">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onOpenGabaritos();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 text-cyan-700 font-semibold text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Gabaritos & Padrões
            </button>
            <button
              onClick={() => {
                onOpenBalcoes();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 text-pink-700 font-semibold text-xs flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Balcões de Retirada
            </button>
            <button
              onClick={() => {
                onOpenQuote();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Solicitar Orçamento Especial
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
