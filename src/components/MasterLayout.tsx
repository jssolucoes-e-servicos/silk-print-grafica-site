import React, { useState, useEffect } from 'react';
import { MaintenancePage } from './MaintenancePage';
import { SystemSwitcherBar } from './SystemSwitcherBar';
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
import { AdminERPPage } from './pages/AdminERPPage';

import { Product, CartItem, ActiveView, Category, BalcaoRetirada } from '../types';
import { getCatalog } from '../lib/api';
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
  Flame,
  Loader2,
  PackageX
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const MasterLayout: React.FC = () => {
  // Read maintenance mode from environment variable VITE_MAINTENANCE_MODE (default: true if not explicitly 'false')
  const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE !== 'false';
  const [bypassMaintenance, setBypassMaintenance] = useState(false);

  // Application State directly from PostgreSQL database
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [pickupPointsList, setPickupPointsList] = useState<BalcaoRetirada[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isGabaritosOpen, setIsGabaritosOpen] = useState(false);
  const [isBalcoesOpen, setIsBalcoesOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Check URL query param ?bypass=true or ?preview=store or ?preview=erp
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('bypass') === 'true' || params.get('preview')) {
        setBypassMaintenance(true);
        if (params.get('preview') === 'erp' || params.get('view') === 'admin') {
          setActiveView('admin');
        }
      }
    }
  }, []);

  const isMaintenance = envMaintenance && !bypassMaintenance;

  // Category filter on home page
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODOS');

  // Function to refresh catalog from real PostgreSQL DB
  const refreshCatalog = async () => {
    try {
      setIsLoadingCatalog(true);
      const catalog = await getCatalog();
      if (catalog) {
        const prods = catalog.products || [];
        const cats = catalog.categories || [];
        const balcoes = catalog.pickupPoints || [];

        setProductsList(prods);
        setCategoriesList(cats);
        setPickupPointsList(balcoes);

        if (prods.length > 0) {
          setSelectedProduct(prev => {
            if (!prev) return prods[0];
            const found = prods.find(p => p.id === prev.id || p.slug === prev.slug);
            return found || prods[0];
          });
        }
      }
    } catch (err) {
      console.warn('[MasterLayout] Error loading catalog from database:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Sync with real database on mount
  useEffect(() => {
    refreshCatalog();
  }, []);

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
  // If maintenance mode is active, render ONLY the MaintenancePage
  if (isMaintenance) {
    return (
      <MaintenancePage 
        onBypass={() => setBypassMaintenance(true)}
        onGoToErp={() => {
          setBypassMaintenance(true);
          setActiveView('admin');
        }}
      />
    );
  }

  // 🛍️ 2. FULL E-COMMERCE & INSTITUTIONAL STORE
  const filteredCatalog = selectedCategoryFilter === 'TODOS'
    ? productsList
    : productsList.filter(p => p.categorySlug === selectedCategoryFilter);

  const featuredProduct = productsList.find(p => p.popular) || productsList[0] || null;

  return (
    <div className={`min-h-screen flex flex-col justify-between ${activeView === 'admin' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} selection:bg-cyan-500 selection:text-white`} id="main-site-container">
      {/* System Switcher Bar (Visible for administration and testing) */}
      <SystemSwitcherBar
        activeSystem={activeView === 'admin' ? 'erp' : 'store'}
        onSwitchToStore={() => setActiveView('home')}
        onSwitchToErp={() => setActiveView('admin')}
        onBackToMaintenance={envMaintenance ? () => setBypassMaintenance(false) : undefined}
        isMaintenanceMode={envMaintenance}
      />

      {/* Main Header (Hidden when in ERP system) */}
      {activeView !== 'admin' && (
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
          allProducts={productsList}
          categories={categoriesList}
        />
      )}

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
                    Materiais gráficos com a maior gama de acabamentos, produção expressa e balcões de retirada credenciados em todo o Brasil.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {featuredProduct && (
                      <button
                        onClick={() => {
                          setSelectedProduct(featuredProduct);
                          setActiveView('product-details');
                        }}
                        className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2 active:scale-95"
                      >
                        <span>Personalizar {featuredProduct.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

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
                      <span>{pickupPointsList.length > 0 ? `${pickupPointsList.length}+ Balcões` : 'Balcões Credenciados'}</span>
                    </div>
                  </div>
                </div>

                {/* Featured Configurator Preview Card */}
                <div className="lg:col-span-5">
                  {featuredProduct ? (
                    <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> DESTAQUE DA SEMANA
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">5% OFF no PIX</span>
                      </div>

                      <div className="aspect-[16/9] rounded-2xl overflow-hidden relative group bg-slate-800">
                        {featuredProduct.image ? (
                          <img
                            src={featuredProduct.image}
                            alt={featuredProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                            Silk Print Gráfica
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {featuredProduct.name}
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              {featuredProduct.defaultFormat || 'Formato Padrão'} • {featuredProduct.category}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">A partir de</div>
                          <div className="text-2xl font-black text-white font-heading">
                            {formatCurrency(featuredProduct.basePrice || 0)}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProduct(featuredProduct);
                            setActiveView('product-details');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
                        >
                          <span>Personalizar Agora</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-8 text-center space-y-3">
                      <div className="text-cyan-400 font-bold text-sm">Banco de Dados PostgreSQL Conectado</div>
                      <p className="text-xs text-slate-400">
                        Nenhum produto cadastrado no banco de dados. Cadastre novos itens no painel ERP.
                      </p>
                      <button
                        onClick={() => setActiveView('admin')}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                      >
                        Abrir Painel ERP
                      </button>
                    </div>
                  )}
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
                    Todos ({productsList.length})
                  </button>
                  {categoriesList.slice(0, 6).map((cat) => (
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
              {isLoadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-xs font-semibold">Carregando produtos do banco de dados...</span>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <PackageX className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Nenhum produto cadastrado no banco</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {selectedCategoryFilter !== 'TODOS'
                      ? 'Nenhum produto encontrado para esta categoria. Selecione outra categoria ou cadastre novos itens no painel ERP.'
                      : 'O banco de dados está conectado. Acesse o Painel de Gestão para cadastrar ou sincronizar os materiais gráficos.'}
                  </p>
                  <button
                    onClick={() => setActiveView('admin')}
                    className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Acessar Gestão de Produtos
                  </button>
                </div>
              ) : (
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
              )}
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
                      Rede credenciada com mais de 5.000 pontos para retirada rápida com frete reduzido.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: PRODUCT DETAILS & CONFIGURATOR */}
        {activeView === 'product-details' && (selectedProduct || productsList[0]) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
            <ProductConfigurator
              product={selectedProduct || productsList[0]}
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
                {productsList.filter(p => p.id !== (selectedProduct || productsList[0]).id).slice(0, 4).map((p) => (
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

        {/* VIEW 3: INSTITUTIONAL PAGES & ADMIN */}
        {activeView === 'about' && <AboutPage />}
        {activeView === 'how-to-buy' && <HowToBuyPage />}
        {activeView === 'help' && <HelpCenterPage />}
        {activeView === 'contact' && <ContactPage />}
        {activeView === 'admin' && (
          <AdminERPPage
            onBackToStore={() => setActiveView('home')}
            products={productsList}
            categories={categoriesList}
            onRefreshCatalog={refreshCatalog}
          />
        )}

      </main>

      {/* Main Footer (Hidden when in ERP system) */}
      {activeView !== 'admin' && (
        <Footer
          setActiveView={setActiveView}
          onOpenGabaritos={() => setIsGabaritosOpen(true)}
          onOpenBalcoes={() => setIsBalcoesOpen(true)}
          onOpenQuote={() => setIsQuoteOpen(true)}
          onOpenTracking={() => setIsTrackingOpen(true)}
        />
      )}


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
        pickupPoints={pickupPointsList}
      />

      <CustomQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
      />

      <GabaritosModal
        isOpen={isGabaritosOpen}
        onClose={() => setIsGabaritosOpen(false)}
        products={productsList}
      />

      <BalcoesModal
        isOpen={isBalcoesOpen}
        onClose={() => setIsBalcoesOpen(false)}
        pickupPoints={pickupPointsList}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

    </div>
  );
};
export default MasterLayout;
