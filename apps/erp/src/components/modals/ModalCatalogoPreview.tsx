import React, { useState } from 'react';
import {
  X,
  Store,
  ExternalLink,
  Search,
  ShoppingCart,
  MessageCircle,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CATALOG_PRODUCTS } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { CatalogProduct } from '../../types';

interface ModalCatalogoPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  products?: CatalogProduct[];
  onOpenStoreView?: () => void;
}

export const ModalCatalogoPreview: React.FC<ModalCatalogoPreviewProps> = ({
  isOpen,
  onClose,
  products = [],
  onOpenStoreView,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const productList = products.length > 0 ? products : CATALOG_PRODUCTS;

  const publicProducts = productList.filter(
    (p) =>
      !p.isInternal &&
      (selectedCategory === 'Todos' || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Todos', 'Cartões', 'Adesivos', 'Tags', 'Kits', 'Outros'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-catalogo-preview"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Bar with URL */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-3 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
              <span>cataloglab.app/</span>
              <span className="text-blue-400 font-bold">@silkprint</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStoreView && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStoreView();
                }}
                className="px-2.5 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir Tela Cheia da Loja Virtual"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Abrir Loja Virtual</span>
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard?.writeText('https://cataloglab.app/@silkprint');
                alert('Link do catálogo copiado para a área de transferência!');
              }}
              className="px-2.5 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copiar Link</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Public Storefront Body */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 custom-scrollbar">
          {/* Hero store header */}
          <div className="p-6 bg-gradient-to-b from-blue-500/10 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-500/20 mb-3">
              S
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Silk Print Gráfica</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Impressão gráfica de alta resolução, cartões, adesivos, lonas e brindes personalizados.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <a
                href="https://wa.me/5511987654321"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Pedir no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-900/40">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos no catálogo..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {product.category}
                    </span>
                    <span className="text-xs font-bold text-zinc-100 font-mono">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 mt-2">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Preço por {product.unit} • Pedido mínimo: {product.minQty}
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert(
                      `Produto "${product.name}" adicionado ao pedido do cliente!`
                    )
                  }
                  className="mt-3 w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-blue-500 hover:text-white text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Solicitar Orçamento</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
