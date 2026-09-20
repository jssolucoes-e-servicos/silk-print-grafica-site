import React, { useState } from 'react';
import {
  X,
  Plus,
  Search,
  Check,
  Package,
  Layers,
  Ruler,
  Sliders,
  Calculator,
  Trash2,
  Scissors,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { CatalogProduct, QuoteItem, FinishingItem, ProductSizeVariation } from '../../types';
import { CATALOG_PRODUCTS } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

interface ModalAdicionarItemProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: QuoteItem[]) => void;
  products?: CatalogProduct[];
  finishings?: FinishingItem[];
}

export const ModalAdicionarItem: React.FC<ModalAdicionarItemProps> = ({
  isOpen,
  onClose,
  onAddItems,
  products = [],
  finishings = [],
}) => {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'internos' | 'm2' | 'personalizado'>('catalogo');
  const [searchTerm, setSearchTerm] = useState('');
  const [stagedItems, setStagedItems] = useState<QuoteItem[]>([]);

  // Product being configured (grade or finishings)
  const [configuringProduct, setConfiguringProduct] = useState<CatalogProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSizeVariation | null>(null);
  const [selectedFinishingIds, setSelectedFinishingIds] = useState<string[]>([]);
  const [configQuantity, setConfigQuantity] = useState<number>(1);

  // State for "Por m²" sub-form
  const allProducts = products.length > 0 ? products : CATALOG_PRODUCTS;
  const [selectedM2Product, setSelectedM2Product] = useState<CatalogProduct | null>(
    allProducts.find((p) => p.isM2) || null
  );
  const [m2WidthCm, setM2WidthCm] = useState<number>(100);
  const [m2HeightCm, setM2HeightCm] = useState<number>(100);
  const [m2Quantity, setM2Quantity] = useState<number>(1);
  const [m2Finishings, setM2Finishings] = useState<string[]>(['Bainha reforçada', 'Ilhós a cada 50cm']);

  // State for "Personalizado" sub-form
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPricingType, setCustomPricingType] = useState<
    'unidade' | 'milheiro' | 'pacote' | 'hora'
  >('unidade');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customUnitPrice, setCustomUnitPrice] = useState<string>('');

  if (!isOpen) return null;

  // Filtering products
  const catalogProducts = allProducts.filter(
    (p) => !p.isInternal && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const internalProducts = allProducts.filter(
    (p) => p.isInternal && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const m2Products = allProducts.filter(
    (p) => p.isM2 && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Start configuring or directly add product
  const handleProductClick = (product: CatalogProduct) => {
    const hasGrade = product.hasSizeGrid && product.sizeVariations && product.sizeVariations.length > 0;
    const hasLinkedFinishings = product.compatibleFinishings && product.compatibleFinishings.length > 0;

    if (hasGrade || hasLinkedFinishings) {
      setConfiguringProduct(product);
      setSelectedSize(hasGrade ? product.sizeVariations![0] : null);
      setSelectedFinishingIds([]);
      setConfigQuantity(product.minQty || 1);
    } else {
      handleAddDirectProduct(product);
    }
  };

  // Add simple catalog / internal product directly to staged items
  const handleAddDirectProduct = (product: CatalogProduct) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: product.name,
      description: `Categoria: ${product.category}`,
      sourceTab: product.isInternal ? 'internos' : 'catalogo',
      pricingType: 'unidade',
      quantity: product.minQty || 1,
      unitPrice: product.price,
      unitCost: product.cost,
      total: (product.minQty || 1) * product.price,
    };
    setStagedItems((prev) => [...prev, newItem]);
  };

  // Compatible finishings for configuring product with custom overrides applied
  const configuringCompatibleFinishings = configuringProduct
    ? finishings
        .filter((f) => {
          if (!configuringProduct.compatibleFinishings || configuringProduct.compatibleFinishings.length === 0)
            return false;
          return (
            configuringProduct.compatibleFinishings.includes(f.id) ||
            configuringProduct.compatibleFinishings.includes(f.name)
          );
        })
        .map((f) => {
          const override = configuringProduct.productFinishings?.find(
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
        })
    : [];

  // Confirm configured product addition
  const handleConfirmConfiguredProduct = () => {
    if (!configuringProduct) return;

    const basePrice = selectedSize ? selectedSize.price : configuringProduct.price;
    const baseCost = selectedSize?.cost ?? configuringProduct.cost;

    // Resolve selected finishings with per-product custom overrides applied
    const selectedFinishingObjects = configuringCompatibleFinishings.filter((f) =>
      selectedFinishingIds.includes(f.id)
    );

    const finishingsUnitTotal = selectedFinishingObjects
      .filter((f) => f.pricingType !== 'fixo')
      .reduce((acc, curr) => acc + curr.price, 0);

    const finishingsFixedTotal = selectedFinishingObjects
      .filter((f) => f.pricingType === 'fixo')
      .reduce((acc, curr) => acc + curr.price, 0);

    const unitPriceCalculated = basePrice + finishingsUnitTotal;
    const totalCalculated = unitPriceCalculated * configQuantity + finishingsFixedTotal;

    const finishingsNames = selectedFinishingObjects.map((f) => f.name);

    const descParts: string[] = [];
    if (selectedSize) {
      descParts.push(`Tamanho Grade: ${selectedSize.size}`);
    }
    if (finishingsNames.length > 0) {
      descParts.push(`Acabamentos: ${finishingsNames.join(', ')}`);
    }

    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: selectedSize
        ? `${configuringProduct.name} (${selectedSize.size})`
        : configuringProduct.name,
      description: descParts.length > 0 ? descParts.join(' | ') : `Categoria: ${configuringProduct.category}`,
      sourceTab: configuringProduct.isInternal ? 'internos' : 'catalogo',
      pricingType: 'unidade',
      quantity: configQuantity,
      unitPrice: unitPriceCalculated,
      unitCost: baseCost,
      total: totalCalculated,
      selectedSize: selectedSize?.size,
      sizeCost: selectedSize?.cost,
      finishings: finishingsNames,
    };

    setStagedItems((prev) => [...prev, newItem]);
    setConfiguringProduct(null);
  };

  // Add M2 item
  const handleAddM2Item = () => {
    if (!selectedM2Product) return;
    const widthM = m2WidthCm / 100;
    const heightM = m2HeightCm / 100;
    const areaM2 = widthM * heightM;
    const basePrice = selectedM2Product.baseM2Price || selectedM2Product.price;
    const unitPriceCalculated = Math.round(areaM2 * basePrice * 100) / 100;
    const totalCalculated = Math.round(unitPriceCalculated * m2Quantity * 100) / 100;

    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${selectedM2Product.name} (${m2WidthCm}x${m2HeightCm}cm)`,
      description: `Área: ${areaM2.toFixed(2)} m² cada | Acabamentos: ${m2Finishings.join(', ')}`,
      sourceTab: 'm2',
      pricingType: 'm2',
      width: m2WidthCm,
      height: m2HeightCm,
      area: areaM2,
      quantity: m2Quantity,
      unitPrice: unitPriceCalculated,
      total: totalCalculated,
      finishings: m2Finishings,
    };
    setStagedItems((prev) => [...prev, newItem]);
  };

  // Add Custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const unitP = parseFloat(customUnitPrice.replace(',', '.')) || 0;
    const total = customQuantity * unitP;

    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customName.trim(),
      description: customDescription.trim() || undefined,
      sourceTab: 'personalizado',
      pricingType: customPricingType,
      quantity: customQuantity,
      unitPrice: unitP,
      total: total,
    };
    setStagedItems((prev) => [...prev, newItem]);

    setCustomName('');
    setCustomDescription('');
    setCustomQuantity(1);
    setCustomUnitPrice('');
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFinish = () => {
    onAddItems(stagedItems);
    setStagedItems([]);
    onClose();
  };

  // Previews for m2
  const m2AreaPreview = (m2WidthCm / 100) * (m2HeightCm / 100);
  const m2BaseRate = selectedM2Product
    ? selectedM2Product.baseM2Price || selectedM2Product.price
    : 0;
  const m2TotalPreview = m2AreaPreview * m2BaseRate * m2Quantity;

  // Custom preview
  const parsedCustomUnit = parseFloat(customUnitPrice.replace(',', '.')) || 0;
  const customTotalPreview = parsedCustomUnit * customQuantity;

  return (
    <div id="modal-adicionar-item" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Adicionar Itens ao Orçamento / Pedido</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Selecione itens do catálogo com suporte a grade de tamanhos, acabamentos e m²
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-view: Configuração de Produto com Grade ou Acabamentos */}
        {configuringProduct ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-900 custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setConfiguringProduct(null)}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à lista de produtos</span>
              </button>

              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Configurar Variações
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-100">{configuringProduct.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Categoria: <b className="text-zinc-300">{configuringProduct.category}</b>
                {configuringProduct.paperType && ` • Tecido/Material: ${configuringProduct.paperType}`}
              </p>
            </div>

            {/* SELEÇÃO DE GRADE DE TAMANHOS */}
            {configuringProduct.hasSizeGrid &&
              configuringProduct.sizeVariations &&
              configuringProduct.sizeVariations.length > 0 && (
                <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Scissors className="w-4 h-4" />
                      <span>Selecione o Tamanho da Grade (1 ano até G3)</span>
                    </div>
                    {selectedSize && (
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Venda: {formatCurrency(selectedSize.price)}{' '}
                        {selectedSize.cost && (
                          <span className="text-zinc-500 text-[11px]">
                            (Custo: {formatCurrency(selectedSize.cost)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {configuringProduct.sizeVariations.map((v) => {
                      const isSel = selectedSize?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedSize(v)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-xs'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs">{v.size}</div>
                          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                            {formatCurrency(v.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ACABAMENTOS VINCULADOS */}
            {configuringCompatibleFinishings.length > 0 && (
              <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Acabamentos & Opcionais Vinculados</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {configuringCompatibleFinishings.map((f) => {
                    const isChecked = selectedFinishingIds.includes(f.id);
                    return (
                      <label
                        key={f.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-950/30 border-purple-500/60 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedFinishingIds((prev) =>
                              isChecked ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                            );
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500 border-zinc-700 bg-zinc-950"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">{f.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            +{formatCurrency(f.price)} ({f.pricingType === 'fixo' ? 'setup' : 'unitário'})
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTIDADE */}
            <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Quantidade do Item</span>
                <span className="text-[11px] text-zinc-400">
                  Defina a quantidade para esta variação / grade
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={configQuantity}
                  onChange={(e) => setConfigQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-center text-zinc-100 focus:outline-hidden focus:border-blue-500"
                />
                <span className="text-xs text-zinc-400">{configuringProduct.unit}</span>
              </div>
            </div>

            {/* Subtotal da Configuração e Ação */}
            <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-blue-300 block">Subtotal Calculado</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {formatCurrency(
                    ((selectedSize ? selectedSize.price : configuringProduct.price) +
                      configuringCompatibleFinishings
                        .filter((f) => selectedFinishingIds.includes(f.id) && f.pricingType !== 'fixo')
                        .reduce((acc, f) => acc + f.price, 0)) *
                      configQuantity +
                      configuringCompatibleFinishings
                        .filter((f) => selectedFinishingIds.includes(f.id) && f.pricingType === 'fixo')
                        .reduce((acc, f) => acc + f.price, 0)
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirmConfiguredProduct}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Orçamento</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="px-6 pt-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  id="tab-catalogo"
                  onClick={() => setActiveTab('catalogo')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'catalogo'
                      ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Catálogo Público</span>
                </button>

                <button
                  id="tab-internos"
                  onClick={() => setActiveTab('internos')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'internos'
                      ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Insumos Internos</span>
                </button>

                <button
                  id="tab-m2"
                  onClick={() => setActiveTab('m2')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'm2'
                      ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Por m² (Comunicação Visual)</span>
                </button>

                <button
                  id="tab-personalizado"
                  onClick={() => setActiveTab('personalizado')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'personalizado'
                      ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Item Avulso Personalizado</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* TAB 1: CATÁLOGO */}
              {activeTab === 'catalogo' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome ou categoria (ex: Camiseta, Banner, Cartão)..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {catalogProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      Nenhum produto encontrado no catálogo.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {catalogProducts.map((p) => {
                        const hasGrade = p.hasSizeGrid && p.sizeVariations && p.sizeVariations.length > 0;
                        const hasFinishings = p.compatibleFinishings && p.compatibleFinishings.length > 0;

                        return (
                          <div
                            key={p.id}
                            className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-blue-500/50 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {hasGrade && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                                    Grade ({p.sizeVariations!.length})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                {p.category} • {formatCurrency(p.price)} / {p.unit}
                                {hasFinishings && ` • ${p.compatibleFinishings!.length} acabamentos`}
                              </div>
                            </div>
                            <button
                              onClick={() => handleProductClick(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-all ${
                                hasGrade || hasFinishings
                                  ? 'bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold'
                                  : 'bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white'
                              }`}
                            >
                              {hasGrade ? (
                                <>
                                  <Scissors className="w-3.5 h-3.5" />
                                  <span>Escolher Grade</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INTERNOS */}
              {activeTab === 'internos' && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400">
                    Produtos e serviços de uso interno (não exibidos publicamente na loja do cliente).
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar insumos e serviços internos..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {internalProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-blue-500/50 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-200 truncate">{p.name}</div>
                          <div className="text-[11px] text-zinc-500">
                            {p.category} • {formatCurrency(p.price)} / {p.unit}
                          </div>
                        </div>
                        <button
                          onClick={() => handleProductClick(p)}
                          className="px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: M2 */}
              {activeTab === 'm2' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Substrato / Mídia por m²
                    </label>
                    <select
                      value={selectedM2Product?.id}
                      onChange={(e) => {
                        const found = m2Products.find((p) => p.id === e.target.value);
                        if (found) setSelectedM2Product(found);
                      }}
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                    >
                      {m2Products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(p.baseM2Price || p.price)}/m²)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Largura (cm)</label>
                      <input
                        type="number"
                        min={10}
                        value={m2WidthCm}
                        onChange={(e) => setM2WidthCm(parseFloat(e.target.value) || 10)}
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Altura (cm)</label>
                      <input
                        type="number"
                        min={10}
                        value={m2HeightCm}
                        onChange={(e) => setM2HeightCm(parseFloat(e.target.value) || 10)}
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min={1}
                        value={m2Quantity}
                        onChange={(e) => setM2Quantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">
                        Área unitária: <span className="font-mono text-zinc-200 font-semibold">{m2AreaPreview.toFixed(2)} m²</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Preço base: {formatCurrency(m2BaseRate)}/m²
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Total Calculado</div>
                      <div className="text-base font-bold text-blue-400 font-mono">
                        {formatCurrency(m2TotalPreview)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddM2Item}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Adicionar Produto por m²</span>
                  </button>
                </div>
              )}

              {/* TAB 4: PERSONALIZADO */}
              {activeTab === 'personalizado' && (
                <form onSubmit={handleAddCustomItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Nome do Item <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ex: Camiseta Promocional Silk Screen 4 Cores"
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Descrição & Detalhes
                    </label>
                    <textarea
                      rows={2}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Detalhes técnicos, acabamentos específicos ou instruções..."
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Tipo de Precificação
                      </label>
                      <select
                        value={customPricingType}
                        onChange={(e) =>
                          setCustomPricingType(
                            e.target.value as 'unidade' | 'milheiro' | 'pacote' | 'hora'
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="unidade">Por Unidade</option>
                        <option value="milheiro">Por Milheiro (1.000 un)</option>
                        <option value="pacote">Por Pacote / Kit</option>
                        <option value="hora">Por Hora de Serviço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Valor Unitário (R$) <span className="text-blue-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customUnitPrice}
                        onChange={(e) => setCustomUnitPrice(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Total do Item Personalizado</span>
                    <span className="text-base font-bold text-blue-400 font-mono">
                      {formatCurrency(customTotalPreview)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Adicionar Item</span>
                  </button>
                </form>
              )}

              {/* Staged Items List (Preview) */}
              {stagedItems.length > 0 && (
                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    <span>Itens a Adicionar ({stagedItems.length})</span>
                    <span>
                      Subtotal:{' '}
                      <span className="text-emerald-400 font-mono font-bold">
                        {formatCurrency(
                          stagedItems.reduce((acc, item) => acc + item.total, 0)
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {stagedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.selectedSize && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                                {item.selectedSize}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            {item.quantity}x {formatCurrency(item.unitPrice)} ={' '}
                            <span className="text-zinc-300 font-mono font-bold">
                              {formatCurrency(item.total)}
                            </span>
                            {item.description && ` • ${item.description}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStagedItem(item.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={stagedItems.length === 0}
                className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                  stagedItems.length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Confirmar ({stagedItems.length} {stagedItems.length === 1 ? 'item' : 'itens'})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
