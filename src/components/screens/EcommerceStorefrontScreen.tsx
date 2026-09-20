import React, { useState } from 'react';
import {
  Printer,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck,
  ShoppingCart,
  MessageCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  Filter,
  Check,
  ArrowLeft,
  X,
  MapPin,
  FileText,
  AlertCircle,
  HelpCircle,
  Send,
  Scissors,
  Tag,
} from 'lucide-react';
import { CatalogProduct, FinishingItem, ProductSizeVariation } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { CATALOG_PRODUCTS } from '../../data/mockData';
import { ModalConfigurarProdutoLoja, CartConfiguredItem } from '../modals/ModalConfigurarProdutoLoja';

export interface StoreCartItem {
  id: string;
  product: CatalogProduct;
  selectedSize?: ProductSizeVariation;
  selectedFinishings?: FinishingItem[];
  quantity: number;
  unitPrice: number;
  total: number;
}

interface EcommerceStorefrontScreenProps {
  products: CatalogProduct[];
  finishings?: FinishingItem[];
  onBackToErp: () => void;
  onOpenProductDetails?: (product: CatalogProduct) => void;
}

export const EcommerceStorefrontScreen: React.FC<EcommerceStorefrontScreenProps> = ({
  products,
  finishings = [],
  onBackToErp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cartItems, setCartItems] = useState<StoreCartItem[]>([]);
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  // Configuration modal state
  const [selectedProductToConfigure, setSelectedProductToConfigure] = useState<CatalogProduct | null>(null);

  // Modals
  const [isBalcoesOpen, setIsBalcoesOpen] = useState(false);
  const [isGabaritosOpen, setIsGabaritosOpen] = useState(false);
  const [isRastreioOpen, setIsRastreioOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Rastreio state
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<any | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Balcões filter
  const [balcaoState, setBalcaoState] = useState('TODOS');

  const productList = products.length > 0 ? products : CATALOG_PRODUCTS;

  // Only public products (not marked as internal use and available for sale)
  const publicProducts = productList.filter((p) => {
    if (p.isInternal) return false;
    if (p.isAvailableForSale === false) return false;
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Extract all categories dynamically
  const uniqueCategories = Array.from(
    new Set(productList.filter((p) => !p.isInternal).map((p) => p.category))
  );
  const categories = ['Todos', ...uniqueCategories];

  // Quick or configured add to cart
  const handleOpenConfigure = (product: CatalogProduct) => {
    setSelectedProductToConfigure(product);
  };

  const handleAddToCartFromModal = (configured: CartConfiguredItem) => {
    const newItem: StoreCartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product: configured.product,
      selectedSize: configured.selectedSize,
      selectedFinishings: configured.selectedFinishings,
      quantity: configured.quantity,
      unitPrice: configured.unitPrice,
      total: configured.total,
    };

    setCartItems((prev) => [...prev, newItem]);
    setAddedAlert(
      `"${configured.product.name}" ${configured.selectedSize ? `(Tam: ${configured.selectedSize.size})` : ''} adicionado ao carrinho!`
    );
    setTimeout(() => {
      setAddedAlert(null);
    }, 3500);
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.total, 0);

  const balcoesList = [
    { id: '1', name: 'Balcão São Paulo - Centro', address: 'Rua Barão de Itapetininga, 255 - Galeria Loja 12', city: 'São Paulo', uf: 'SP', deadline: '24h', free: true },
    { id: '2', name: 'Balcão Santo André - ABC', address: 'Av. Dom Pedro II, 1420 - Bairro Jardim', city: 'Santo André', uf: 'SP', deadline: '24h', free: true },
    { id: '3', name: 'Balcão Campinas - Centro', address: 'Rua Barão de Jaguara, 900 - Centro', city: 'Campinas', uf: 'SP', deadline: '48h', free: true },
    { id: '4', name: 'Balcão Rio de Janeiro - Centro', address: 'Av. Rio Branco, 156 - Sobreloja 210', city: 'Rio de Janeiro', uf: 'RJ', deadline: '48h', free: true },
    { id: '5', name: 'Balcão Niterói - Icaraí', address: 'Rua Cel. Moreira César, 229', city: 'Niterói', uf: 'RJ', deadline: '48h', free: true },
    { id: '6', name: 'Balcão Belo Horizonte - Centro', address: 'Av. Afonso Pena, 1500 - Sala 402', city: 'Belo Horizonte', uf: 'MG', deadline: '48h', free: true },
    { id: '7', name: 'Balcão Curitiba - Batel', address: 'Rua Comendador Araújo, 510', city: 'Curitiba', uf: 'PR', deadline: '48h', free: true },
    { id: '8', name: 'Balcão Porto Alegre - Moinhos', address: 'Rua 24 de Outubro, 780', city: 'Porto Alegre', uf: 'RS', deadline: '72h', free: true },
  ];

  const filteredBalcoes = balcoesList.filter((b) => balcaoState === 'TODOS' || b.uf === balcaoState);

  const handleTrackOrder = () => {
    if (!trackingCode.trim()) return;
    setIsTrackingLoading(true);
    setTimeout(() => {
      setIsTrackingLoading(false);
      setTrackingStatus({
        code: trackingCode.toUpperCase(),
        status: 'Em Transporte para Balcão',
        updatedAt: 'Hoje às 14:32',
        expectedDate: 'Amanhã após 11h',
        pickupPoint: 'Balcão São Paulo - Centro',
      });
    }, 600);
  };

  const handleCheckoutWhatsApp = () => {
    const lines = [
      '👋 Olá! Gostaria de fazer o pedido dos seguintes itens na Silk Print:',
      '',
      ...cartItems.map((i) => {
        const sizeText = i.selectedSize ? ` [Tamanho: ${i.selectedSize.size}]` : '';
        const finText =
          i.selectedFinishings && i.selectedFinishings.length > 0
            ? ` (+ Opcionais: ${i.selectedFinishings.map((f) => f.name).join(', ')})`
            : '';
        return `• ${i.quantity}x ${i.product.name}${sizeText}${finText} (${formatCurrency(i.total)})`;
      }),
      '',
      `💰 Total Geral: ${formatCurrency(cartTotal)}`,
      'Quero enviar o arquivo para checagem técnica de arte e combinar o prazo.',
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
  };

  return (
    <div id="screen-ecommerce-storefront" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar de Avisos */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Retirada Grátis em mais de 500 Balcões</span>
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">
            Produção Expressa em 24h a 72h
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRastreioOpen(true)}
            className="text-slate-300 hover:text-cyan-400 font-semibold cursor-pointer transition-colors"
          >
            Rastrear Pedido
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsGabaritosOpen(true)}
            className="text-slate-300 hover:text-cyan-400 font-semibold cursor-pointer transition-colors"
          >
            Gabaritos
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onBackToErp}
            className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>Voltar ao ERP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Header Principal da Loja */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Silk Print */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">SILK PRINT</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  LOJA ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Gráfica Rápida, Estamparia & Comunicação Visual
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar camisetas, cartões, adesivos, tags, banners..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Carrinho e Ações */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onBackToErp}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Painel ERP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alert toast notification */}
      {addedAlert && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-950 border border-cyan-500/40 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{addedAlert}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Loja Virtual Oficial Silk Print Gráfica & Estamparia</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight mb-3">
            Camisetas com grade completa, papelaria e acabamentos com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              fidelidade total.
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            Camisetas personalizadas do 1 ano até o G3 com preços por grade, cartões com verniz localizado, tags nobres e comunicação visual direto da fábrica.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogo-produtos"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span>Explorar Catálogo ({publicProducts.length} itens)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsBalcoesOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Balcões de Retirada</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-4 px-4 bg-slate-900/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Grade Completa (1 ano ao G3)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Acabamentos & Opcionais Nobres</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Prazos Expressos de Produção</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Retirada em Mais de 500 Balcões</span>
          </div>
        </div>
      </section>

      {/* Products & Catalog Section */}
      <section id="catalogo-produtos" className="py-10 px-4 max-w-7xl mx-auto w-full flex-1">
        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">Catálogo de Produtos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecione o produto para ver a grade de tamanhos e escolher acabamentos opcionais
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {publicProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8">
            <Printer className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Nenhum item corresponde à categoria ou busca selecionada no momento.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {publicProducts.map((product) => {
              const hasGrade = !!(product.hasSizeGrid && product.sizeVariations && product.sizeVariations.length > 0);
              const minPrice = hasGrade ? Math.min(...product.sizeVariations!.map((v) => v.price)) : product.price;
              const hasFinishings = !!(product.compatibleFinishings && product.compatibleFinishings.length > 0);

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenConfigure(product)}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900 transition-all p-4 flex flex-col justify-between group shadow-sm cursor-pointer"
                >
                  <div>
                    {product.image || product.imageUrl ? (
                      <div className="w-full h-44 rounded-xl mb-3 overflow-hidden bg-slate-950 relative">
                        <img
                          src={product.image || product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-800">
                          {product.category}
                        </span>
                        {hasGrade && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-slate-950 shadow-sm flex items-center gap-1">
                            <Scissors className="w-2.5 h-2.5" />
                            <span>Grade {product.sizeVariations![0].size} ao {product.sizeVariations![product.sizeVariations!.length - 1].size}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-36 rounded-xl mb-3 bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                        {hasGrade ? (
                          <Scissors className="w-10 h-10 text-amber-500/50" />
                        ) : (
                          <Printer className="w-10 h-10" />
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    {product.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {(product.productionDays !== undefined || product.productionTime) && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>
                            {product.productionDays !== undefined
                              ? `${product.productionDays} ${product.productionDays === 1 ? 'dia útil' : 'dias úteis'}`
                              : product.productionTime}
                          </span>
                        </div>
                      )}
                      {hasFinishings && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          +{product.compatibleFinishings!.length} opcionais
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        {hasGrade ? 'A partir de' : 'Valor'}
                      </span>
                      <span className="text-base font-black text-white font-mono">
                        {formatCurrency(minPrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        /{product.unit || 'un'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfigure(product);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        hasGrade
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
                      }`}
                    >
                      {hasGrade ? (
                        <>
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Ver Grade & Pedir</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Pedir / Detalhes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL: Configurar Produto com Grade e Acabamentos (Storefront) */}
      <ModalConfigurarProdutoLoja
        product={selectedProductToConfigure}
        isOpen={!!selectedProductToConfigure}
        onClose={() => setSelectedProductToConfigure(null)}
        finishings={finishings}
        onAddToCart={handleAddToCartFromModal}
        onBuyWhatsApp={(configured) => {
          setSelectedProductToConfigure(null);
          handleAddToCartFromModal(configured);
          setIsCartOpen(true);
        }}
      />

      {/* MODAL: Balcões de Retirada */}
      {isBalcoesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Balcões de Retirada Silk Print</h3>
                  <p className="text-[11px] text-slate-400">Retire seus materiais gráficos com frete grátis</p>
                </div>
              </div>
              <button
                onClick={() => setIsBalcoesOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              {['TODOS', 'SP', 'RJ', 'MG', 'PR', 'RS'].map((uf) => (
                <button
                  key={uf}
                  onClick={() => setBalcaoState(uf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    balcaoState === uf
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {uf === 'TODOS' ? 'Todos os Estados' : uf}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {filteredBalcoes.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{b.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Frete Grátis
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {b.address} - {b.city}/{b.uf}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Prazo
                    </span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {b.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setIsBalcoesOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rastreio de Pedido */}
      {isRastreioOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Rastreamento de Pedido</h3>
              </div>
              <button
                onClick={() => setIsRastreioOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Número do Pedido ou Código de Rastreio
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: PED-1002"
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-hidden focus:border-cyan-500"
                  />
                  <button
                    onClick={handleTrackOrder}
                    disabled={isTrackingLoading}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {isTrackingLoading ? 'Buscando...' : 'Rastrear'}
                  </button>
                </div>
              </div>

              {trackingStatus && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold">{trackingStatus.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {trackingStatus.status}
                    </span>
                  </div>
                  <div className="text-slate-400 space-y-1 text-[11px]">
                    <p>Atualização: <b className="text-slate-200">{trackingStatus.updatedAt}</b></p>
                    <p>Local de Retirada: <b className="text-slate-200">{trackingStatus.pickupPoint}</b></p>
                    <p>Previsão: <b className="text-emerald-400">{trackingStatus.expectedDate}</b></p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setIsRastreioOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Gabaritos e Instruções */}
      {isGabaritosOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Gabaritos de Impressão</h3>
              </div>
              <button
                onClick={() => setIsGabaritosOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-400">
                Baixe os padrões de corte, sangria (2mm) e margem de segurança para garantir a qualidade de impressão:
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Gabarito Camisetas & Estampas (A4/A3 DTF/Silk)', format: 'CDR, AI, PDF, PSD' },
                  { name: 'Gabarito Cartão de Visita (9x5 cm)', format: 'CDR, AI, PDF' },
                  { name: 'Gabarito Panfletos / Flyers (10x14 e 15x21 cm)', format: 'CDR, AI, PDF' },
                  { name: 'Gabarito Adesivos Redondos & Quadrados', format: 'CDR, PDF' },
                  { name: 'Gabarito Tags Bijuterias com Furo', format: 'CDR, AI, PDF' },
                ].map((g, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white">{g.name}</span>
                      <span className="block text-[10px] text-slate-500">{g.format}</span>
                    </div>
                    <button
                      onClick={() => alert(`Iniciando download do ${g.name}...`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold cursor-pointer"
                    >
                      Baixar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setIsGabaritosOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Carrinho de Compras */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Carrinho de Compras</h3>
                  <p className="text-[11px] text-slate-400">{cartCount} itens adicionados</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Seu carrinho está vazio.</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                            Tam: {item.selectedSize.size}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span>
                          {item.quantity}x de {formatCurrency(item.unitPrice)}
                        </span>
                        {item.selectedFinishings && item.selectedFinishings.length > 0 && (
                          <span className="text-purple-300 block truncate">
                            + {item.selectedFinishings.map((f) => f.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-xs text-cyan-400">
                        {formatCurrency(item.total)}
                      </span>
                      <button
                        onClick={() =>
                          setCartItems((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer"
                        title="Remover item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-300">Total Estimado:</span>
                  <span className="text-cyan-400 font-mono text-base">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={handleCheckoutWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Finalizar Pedido via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Silk Print Gráfica & Comunicação Visual</p>
              <p className="text-[11px] text-slate-500">
                Catálogo com suporte a grade de tamanhos, acabamentos e cálculo de orçamentos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBackToErp}
              className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Acessar Painel de Controle ERP (/erp)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span>© {new Date().getFullYear()} Silk Print. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
