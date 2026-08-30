import React, { useState, useEffect } from 'react';
import { MaintenancePage } from './MaintenancePage';
import { Header } from './Header';
import { Footer } from './Footer';
import { ProductCard } from './ProductCard';
import { ProductConfigurator } from './ProductConfigurator';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { CustomQuoteModal } from './CustomQuoteModal';
import { GabaritosModal } from './GabaritosModal';
import { BalcoesModal } from './BalcoesModal';
import { OrderTrackingModal } from './OrderTrackingModal';

import { AboutPage } from './pages/AboutPage';
import { HowToBuyPage } from './pages/HowToBuyPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ContactPage } from './pages/ContactPage';

import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product, CartItem, ActiveView } from '../types';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Download, 
  FileText, 
  MapPin, 
  Layers, 
  Printer, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const MasterLayout: React.FC = () => {
  // Read initial maintenance mode from environment variable VITE_MAINTENANCE_MODE
  const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const [isMaintenance, setIsMaintenance] = useState<boolean>(envMaintenance);

  // Application State
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isGabaritosOpen, setIsGabaritosOpen] = useState(false);
  const [isBalcoesOpen, setIsBalcoesOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Category filter on home page
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODOS');

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView, selectedProduct]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleBuyNow = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    setIsCheckoutOpen(true);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleApplyCoupon = (code: string): boolean => {
    if (code === 'SILK10' || code === 'BEMVINDO') {
      setAppliedCoupon(code);
      return true;
    }
    return false;
  };

  const handleOrderCompleted = (orderId: string) => {
    // Empty cart on completion
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // 🛑 1. MAINTENANCE MODE GATEWAY
  // If maintenance mode is active (via env or toggle), render ONLY the MaintenancePage
  if (isMaintenance) {
    return (
      <div className="relative min-h-screen">
        <MaintenancePage 
          onToggleMaintenance={() => setIsMaintenance(false)}
          isMaintenanceEnv={envMaintenance}
        />

        {/* Floating Demo Mode Switcher for the user in preview */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-slate-800/95 text-white border border-slate-700 shadow-2xl p-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">Modo Manutenção (Ativo)</span>
            </div>
            <button
              onClick={() => setIsMaintenance(false)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
            >
              Testar Loja Ativa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🛍️ 2. FULL E-COMMERCE & INSTITUTIONAL STORE
  const filteredCatalog = selectedCategoryFilter === 'TODOS'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.categorySlug === selectedCategoryFilter);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white" id="main-site-container">
      
      {/* Floating Demo Mode Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMaintenance(true)}
          className="bg-slate-900/90 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl px-3.5 py-2 rounded-full flex items-center gap-2 text-xs backdrop-blur-md transition-all group"
          title="Ativar visualização do Modo Manutenção"
          id="btn-switch-to-maintenance"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-[11px]">Loja Online Ativa</span>
          <span className="text-slate-400 group-hover:text-cyan-300 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
            Simular Manutenção
          </span>
        </button>
      </div>

      {/* Main Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartItems.length}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          setActiveView('product-details');
        }}
        onOpenGabaritos={() => setIsGabaritosOpen(true)}
        onOpenBalcoes={() => setIsBalcoesOpen(true)}
        onOpenQuote={() => setIsQuoteOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        allProducts={PRODUCTS}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {activeView === 'home' && (
          <div className="space-y-12 pb-16">
            
            {/* HERO PROMOTIONAL BANNER */}
            <section className="bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
              {/* CMYK Background Ambient Lights */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-20 left-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-400 text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Gráfica Expressa & Impressão em 24 Horas</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-[1.1]">
                    Impressão com <span className="text-cyan-400">Qualidade de Fábrica</span> e Entrega Rápida.
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                    Cartões de visita, panfletos, adesivos, banners e brindes com a maior gama de acabamentos e mais de <strong>5.000 balcões de retirada</strong> em todo o Brasil.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(PRODUCTS[0]);
                        setActiveView('product-details');
                      }}
                      className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2 active:scale-95"
                    >
                      <span>Configurar Cartão Mais Vendido</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsQuoteOpen(true)}
                      className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all"
                    >
                      Orçamento Sob Medida
                    </button>
                  </div>

                  {/* Trust markers */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>Produção Express 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Checagem de Arte Grátis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>5.000+ Balcões no Brasil</span>
                    </div>
                  </div>
                </div>

                {/* Featured Configurator Preview Card */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> DESTAQUE DA SEMANA
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">5% OFF no PIX</span>
                    </div>

                    <div className="aspect-[16/9] rounded-2xl overflow-hidden relative group">
                      <img
                        src={PRODUCTS[0].image}
                        alt="Cartão Laminação Fosca"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            Cartão Laminação Fosca + Verniz Localizado
                          </h4>
                          <p className="text-[11px] text-slate-300">Couché 300g • 9x5cm • 1.000 unidades</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">A partir de</div>
                        <div className="text-2xl font-black text-white font-heading">R$ 59,90</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProduct(PRODUCTS[0]);
                          setActiveView('product-details');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
                      >
                        <span>Personalizar Agora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORIES GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Explore Nosso Catálogo</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    Categorias Mais Procuradas
                  </h2>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedCategoryFilter('TODOS')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      selectedCategoryFilter === 'TODOS'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Todos ({PRODUCTS.length})
                  </button>
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.slug)}
                      className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                        selectedCategoryFilter === cat.slug
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCatalog.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => {
                      setSelectedProduct(p);
                      setActiveView('product-details');
                    }}
                  />
                ))}
              </div>
            </section>

            {/* VALUE PROPOSITIONS BANNER (FuturaIM / Printi style) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">Parque Gráfico Próprio</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Impressão offset de alta tiragem e digital de alta definição sem intermediários.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-8">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">Pré-impressão Automatizada</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Checagem automática de sangria, margens e perfil de cores CMYK para evitar perdas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">Balcões em Todo o Brasil</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Mais de 5.000 pontos de retirada estratégicos nas capitais e cidades do interior.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: PRODUCT DETAILS & CONFIGURATOR */}
        {activeView === 'product-details' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
            <ProductConfigurator
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onOpenGabaritos={() => setIsGabaritosOpen(true)}
              onOpenQuoteModal={() => setIsQuoteOpen(true)}
            />

            {/* Other recommended products */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Outros Materiais que Podem te Interessar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PRODUCTS.filter(p => p.id !== selectedProduct.id).slice(0, 4).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={(prod) => {
                      setSelectedProduct(prod);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: INSTITUTIONAL PAGES */}
        {activeView === 'about' && <AboutPage />}
        {activeView === 'how-to-buy' && <HowToBuyPage />}
        {activeView === 'help' && <HelpCenterPage />}
        {activeView === 'contact' && <ContactPage />}

      </main>

      {/* Main Footer */}
      <Footer
        setActiveView={setActiveView}
        onOpenGabaritos={() => setIsGabaritosOpen(true)}
        onOpenBalcoes={() => setIsBalcoesOpen(true)}
        onOpenQuote={() => setIsQuoteOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Interactive Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={() => {}}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedCoupon={appliedCoupon}
        onOrderCompleted={handleOrderCompleted}
      />

      <CustomQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
      />

      <GabaritosModal
        isOpen={isGabaritosOpen}
        onClose={() => setIsGabaritosOpen(false)}
      />

      <BalcoesModal
        isOpen={isBalcoesOpen}
        onClose={() => setIsBalcoesOpen(false)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

    </div>
  );
};
export default MasterLayout;
