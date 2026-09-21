import React, { useState } from 'react';
import {
  X,
  Scissors,
  Layers,
  Clock,
  Check,
  ShoppingCart,
  Phone,
  Tag,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Minus,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { CatalogProduct, FinishingItem, ProductSizeVariation } from '../../types';
import { formatCurrency } from '../../lib/utils';

export interface CartConfiguredItem {
  product: CatalogProduct;
  selectedSize?: ProductSizeVariation;
  selectedFinishings: FinishingItem[];
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ModalConfigurarProdutoLojaProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
  finishings: FinishingItem[];
  onAddToCart: (item: CartConfiguredItem) => void;
  onBuyWhatsApp?: (item: CartConfiguredItem) => void;
}

export const ModalConfigurarProdutoLoja: React.FC<ModalConfigurarProdutoLojaProps> = ({
  product,
  isOpen,
  onClose,
  finishings = [],
  onAddToCart,
  onBuyWhatsApp,
}) => {
  if (!isOpen || !product) return null;

  const hasGrade = !!(product.hasSizeGrid && product.sizeVariations && product.sizeVariations.length > 0);
  const variations = product.sizeVariations || [];

  // Default size: M or first variation
  const defaultSize = variations.find((v) => v.size.toUpperCase() === 'M') || variations[0];
  const [selectedSize, setSelectedSize] = useState<ProductSizeVariation | undefined>(defaultSize);

  // Selected Finishings
  const [selectedFinishingIds, setSelectedFinishingIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(product.minQty || 1);
  const [showGradeTable, setShowGradeTable] = useState(false);

  // Compatible finishings objects with per-product custom overrides
  const compatibleFinishings = finishings
    .filter((f) => {
      if (!product.compatibleFinishings || product.compatibleFinishings.length === 0) return false;
      return product.compatibleFinishings.includes(f.id) || product.compatibleFinishings.includes(f.name);
    })
    .map((f) => {
      const override = product.productFinishings?.find(
        (pf) => pf.finishingId === f.id || pf.finishingId === f.name
      );
      if (override) {
        return {
          ...f,
          price: override.customPrice !== undefined ? override.customPrice : f.price,
          extraDays: override.customExtraDays !== undefined ? override.customExtraDays : f.extraDays,
          cost: override.customCost !== undefined ? override.customCost : f.cost,
        };
      }
      return f;
    });

  // Calculate unit and total prices
  const baseSizePrice = selectedSize ? selectedSize.price : product.price;

  const selectedFinishingsObjs = compatibleFinishings.filter((f) =>
    selectedFinishingIds.includes(f.id)
  );

  const finishingsUnitTotal = selectedFinishingsObjs
    .filter((f) => f.pricingType !== 'fixo')
    .reduce((acc, curr) => acc + curr.price, 0);

  const finishingsFixedTotal = selectedFinishingsObjs
    .filter((f) => f.pricingType === 'fixo')
    .reduce((acc, curr) => acc + curr.price, 0);

  const unitFinalPrice = baseSizePrice + finishingsUnitTotal;
  const totalPrice = unitFinalPrice * quantity + finishingsFixedTotal;

  // Prazo total de produção sempre em dias úteis
  const baseDays =
    product.productionDays !== undefined
      ? product.productionDays
      : product.productionTime?.match(/\d+/)?.[0]
      ? parseInt(product.productionTime.match(/\d+/)?.[0]!, 10)
      : 3;
  const extraDaysTotal = selectedFinishingsObjs.reduce((acc, f) => acc + (f.extraDays || 0), 0);
  const totalProductionDays = baseDays + extraDaysTotal;

  const handleToggleFinishing = (id: string) => {
    setSelectedFinishingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmAddToCart = () => {
    const item: CartConfiguredItem = {
      product,
      selectedSize,
      selectedFinishings: selectedFinishingsObjs,
      quantity,
      unitPrice: unitFinalPrice,
      total: totalPrice,
    };
    onAddToCart(item);
    onClose();
  };

  const handleWhatsAppCheckout = () => {
    const item: CartConfiguredItem = {
      product,
      selectedSize,
      selectedFinishings: selectedFinishingsObjs,
      quantity,
      unitPrice: unitFinalPrice,
      total: totalPrice,
    };
    if (onBuyWhatsApp) {
      onBuyWhatsApp(item);
    } else {
      const sizeText = selectedSize ? ` [Tamanho: ${selectedSize.size}]` : '';
      const finishText =
        selectedFinishingsObjs.length > 0
          ? ` + Opcionais: ${selectedFinishingsObjs.map((f) => f.name).join(', ')}`
          : '';
      const message = encodeURIComponent(
        `Olá, equipe Silk Print! Gostaria de encomendar:\n\n` +
          `• ${quantity}x ${product.name}${sizeText}${finishText}\n` +
          `• Valor Unitário: ${formatCurrency(unitFinalPrice)}\n` +
          `• Total: ${formatCurrency(totalPrice)}\n\n` +
          `Como podemos proceder com o envio da arte e prazo?`
      );
      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    }
  };

  return (
    <div
      id="modal-configurar-produto-loja"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header com Imagem / Título */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-start gap-3.5">
            {product.image || product.imageUrl ? (
              <img
                src={product.image || product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Scissors className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {product.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-cyan-400" />
                  <span>
                    Produção: {totalProductionDays} {totalProductionDays === 1 ? 'dia útil' : 'dias úteis'}
                  </span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {product.name}
              </h2>

              {product.paperType && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Substrato / Tecido: <b className="text-slate-200 font-medium">{product.paperType}</b>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Configurável */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs">
          {/* Descrição */}
          {product.description && (
            <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {product.description}
            </p>
          )}

          {/* 1. SELEÇÃO DE GRADE DE TAMANHOS */}
          {hasGrade && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-cyan-400" />
                    <span>Escolha o Tamanho da Grade</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Selecione o tamanho desejado para ver o valor correspondente:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGradeTable((prev) => !prev)}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{showGradeTable ? 'Ocultar Tabela' : 'Comparar Preços da Grade'}</span>
                  {showGradeTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Botões Chips de Tamanho */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {variations.map((v) => {
                  const isSelected = selectedSize?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedSize(v)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 scale-[1.03]'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-xs">{v.size}</span>
                      <span
                        className={`text-[10px] font-mono mt-0.5 ${
                          isSelected ? 'text-slate-950 font-bold' : 'text-cyan-400'
                        }`}
                      >
                        {formatCurrency(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tabela Comparativa de Grade Expandível */}
              {showGradeTable && (
                <div className="mt-3 pt-3 border-t border-slate-800 overflow-x-auto animate-in fade-in duration-150">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-1.5 px-2">Tamanho</th>
                        <th className="py-1.5 px-2">Categoria</th>
                        <th className="py-1.5 px-2 text-right">Valor Unitário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {variations.map((v) => (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedSize(v)}
                          className={`cursor-pointer transition-colors ${
                            selectedSize?.id === v.id ? 'bg-cyan-500/10 text-cyan-300 font-bold' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-1.5 px-2 flex items-center gap-1.5">
                            {selectedSize?.id === v.id && <Check className="w-3 h-3 text-cyan-400" />}
                            <span>{v.size}</span>
                          </td>
                          <td className="py-1.5 px-2 text-slate-400">
                            {['1 ano', '2 anos', '4 anos', '6 anos', '8 anos', '10 anos', '12 anos', '14 anos', '16 anos'].includes(v.size)
                              ? 'Infantil'
                              : ['G1', 'G2', 'G3', 'G4'].includes(v.size)
                              ? 'Plus Size Especial'
                              : 'Adulto Padrão'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-100">
                            {formatCurrency(v.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. ACABAMENTOS E OPCIONAIS VINCULADOS */}
          {compatibleFinishings.length > 0 && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Acabamentos & Opcionais para este Produto</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Personalize seu pedido selecionando os opcionais abaixo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {compatibleFinishings.map((f) => {
                  const isChecked = selectedFinishingIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleToggleFinishing(f.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                        isChecked
                          ? 'bg-purple-950/30 border-purple-500 text-purple-100 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-white truncate">{f.name}</span>
                          <span className="font-mono font-bold text-purple-300 shrink-0">
                            +{formatCurrency(f.price)}
                          </span>
                        </div>
                        {f.description && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. QUANTIDADE */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div>
              <span className="font-bold text-white block">Quantidade de Peças</span>
              <span className="text-[11px] text-slate-400">
                Mínimo de {product.minQty || 1} {product.unit || 'unidade(s)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(product.minQty || 1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-12 text-center font-mono font-black text-sm text-white">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com Cálculo Final e Botões de Compra */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400">
              <span>Preço Unitário: </span>
              <b className="font-mono text-cyan-300 font-bold">{formatCurrency(unitFinalPrice)}</b>
              {selectedSize && (
                <span className="text-slate-500"> (Tam: {selectedSize.size})</span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Total ({quantity} peças):</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Pedir no WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAddToCart}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Adicionar ao Carrinho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
