import React from 'react';
import { Product } from '../types';
import { formatCurrency, formatProductionDays } from '../lib/utils';
import { Clock, ShieldCheck, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const quantities = product.quantities || [];
  const lowestPriceTier = quantities[0];
  const mostPopularTier = quantities.find(q => q.popular) || quantities[quantities.length - 1];

  const firstPaper = (product.papers && product.papers.length > 0) ? product.papers[0] : null;
  const firstColorMode = (product.colorModes && product.colorModes.length > 0) ? product.colorModes[0] : null;

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
      id={`product-card-${product.id}`}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.badge && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            <span className="font-heading">{product.badge}</span>
          </span>
        )}
        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-700 text-white shadow-sm flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span className="font-heading">{formatProductionDays(product.productionTimeHours).toUpperCase()}</span>
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm font-heading">
            Silk Print Gráfica
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 font-heading">
            <span>Personalizar & Calcular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-[11px] font-black text-cyan-600 uppercase tracking-wider mb-1 font-heading">
            {product.category || 'Gráfica'}
          </div>
          <h3 className="font-black text-base sm:text-lg text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors tracking-tight font-heading">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Paper & Specs tags */}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-700 font-bold">
          {firstPaper && (
            <span className="px-2 py-0.5 bg-slate-100/90 rounded border border-slate-200/60">
              {firstPaper.name?.split(' ')[0]} {firstPaper.weight}
            </span>
          )}
          {product.defaultFormat && (
            <span className="px-2 py-0.5 bg-slate-100/90 rounded border border-slate-200/60">
              {product.defaultFormat}
            </span>
          )}
          {firstColorMode && (
            <span className="px-2 py-0.5 bg-slate-100/90 rounded border border-slate-200/60">
              {firstColorMode.code}
            </span>
          )}
        </div>

        {/* Price Box */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">A partir de</div>
            <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-heading">
              {formatCurrency(lowestPriceTier ? lowestPriceTier.totalPrice : (product.basePrice || 0))}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">
              no PIX com 5% de desconto
            </div>
          </div>

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900 group-hover:bg-cyan-600 text-white font-black text-xs transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider font-heading"
          >
            <span>Configurar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
