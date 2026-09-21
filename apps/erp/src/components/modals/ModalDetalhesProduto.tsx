import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  Layers,
  Ruler,
  DollarSign,
  Clock,
  Tag,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Globe,
  Lock,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  Calculator,
  Sliders,
  Sparkle,
  Grid,
  Scissors,
  ShoppingBag,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import {
  CatalogProduct,
  Order,
  KitSubItem,
  ProductSizeVariation,
  FinishingItem,
  ProductFinishingCustomization,
} from '../../types';
import { formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ModalDetalhesProdutoProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
  orders?: Order[];
  finishings?: FinishingItem[];
  onUpdateProduct?: (updatedProduct: CatalogProduct) => void;
  onDeleteProduct?: (productId: string) => void;
  onToggleInternal?: (productId: string) => void;
  onDuplicateProduct?: (product: CatalogProduct) => void;
  onOpenCatalogPreview?: () => void;
  onOpenNovoPedidoComProduto?: (product: CatalogProduct) => void;
  onOpenOrderDetails?: (order: Order) => void;
}

// Presets pré-configurados de tamanhos para confecção / estamparia
const PRESET_GRADE_COMPLETA: ProductSizeVariation[] = [
  { id: 'var-1ano', size: '1 ano', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-2anos', size: '2 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-4anos', size: '4 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-6anos', size: '6 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-8anos', size: '8 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-10anos', size: '10 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-12anos', size: '12 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-14anos', size: '14 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-16anos', size: '16 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-pp', size: 'PP', price: 35.90, cost: 17.00, inStock: 60, isActive: true },
  { id: 'var-p', size: 'P', price: 37.90, cost: 18.00, inStock: 100, isActive: true },
  { id: 'var-m', size: 'M', price: 37.90, cost: 18.00, inStock: 120, isActive: true },
  { id: 'var-g', size: 'G', price: 37.90, cost: 18.00, inStock: 110, isActive: true },
  { id: 'var-gg', size: 'GG', price: 41.90, cost: 20.00, inStock: 70, isActive: true },
  { id: 'var-xg', size: 'XG', price: 44.90, cost: 22.00, inStock: 50, isActive: true },
  { id: 'var-g1', size: 'G1', price: 48.90, cost: 24.00, inStock: 35, isActive: true },
  { id: 'var-g2', size: 'G2', price: 52.90, cost: 26.00, inStock: 30, isActive: true },
  { id: 'var-g3', size: 'G3', price: 56.90, cost: 28.00, inStock: 25, isActive: true },
];

const PRESET_GRADE_INFANTIL: ProductSizeVariation[] = [
  { id: 'var-1ano', size: '1 ano', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-2anos', size: '2 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-4anos', size: '4 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-6anos', size: '6 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-8anos', size: '8 anos', price: 29.90, cost: 14.00, inStock: 50, isActive: true },
  { id: 'var-10anos', size: '10 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-12anos', size: '12 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-14anos', size: '14 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
  { id: 'var-16anos', size: '16 anos', price: 31.90, cost: 15.00, inStock: 40, isActive: true },
];

const PRESET_GRADE_ADULTO: ProductSizeVariation[] = [
  { id: 'var-pp', size: 'PP', price: 35.90, cost: 17.00, inStock: 60, isActive: true },
  { id: 'var-p', size: 'P', price: 37.90, cost: 18.00, inStock: 100, isActive: true },
  { id: 'var-m', size: 'M', price: 37.90, cost: 18.00, inStock: 120, isActive: true },
  { id: 'var-g', size: 'G', price: 37.90, cost: 18.00, inStock: 110, isActive: true },
  { id: 'var-gg', size: 'GG', price: 41.90, cost: 20.00, inStock: 70, isActive: true },
  { id: 'var-xg', size: 'XG', price: 44.90, cost: 22.00, inStock: 50, isActive: true },
];

const PRESET_GRADE_PLUS_SIZE: ProductSizeVariation[] = [
  { id: 'var-g1', size: 'G1', price: 48.90, cost: 24.00, inStock: 35, isActive: true },
  { id: 'var-g2', size: 'G2', price: 52.90, cost: 26.00, inStock: 30, isActive: true },
  { id: 'var-g3', size: 'G3', price: 56.90, cost: 28.00, inStock: 25, isActive: true },
  { id: 'var-g4', size: 'G4', price: 62.90, cost: 31.00, inStock: 20, isActive: true },
];

export const ModalDetalhesProduto: React.FC<ModalDetalhesProdutoProps> = ({
  product,
  isOpen,
  onClose,
  orders = [],
  finishings = [],
  onUpdateProduct,
  onDeleteProduct,
  onToggleInternal,
  onDuplicateProduct,
  onOpenCatalogPreview,
  onOpenNovoPedidoComProduto,
  onOpenOrderDetails,
}) => {
  if (!isOpen || !product) return null;

  const [activeTab, setActiveTab] = useState<'geral' | 'grade' | 'acabamentos' | 'simulador' | 'pedidos' | 'kit'>('geral');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Edit form state
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price.toString());
  const [cost, setCost] = useState(product.cost ? product.cost.toString() : '');
  const [unit, setUnit] = useState(product.unit);
  const [isM2, setIsM2] = useState(!!product.isM2);
  const [description, setDescription] = useState(product.description || '');
  const [paperType, setPaperType] = useState(product.paperType || '');
  const [image, setImage] = useState(product.image || product.imageUrl || '');

  // Availability & Stock & Production Days State
  const [isAvailableForSale, setIsAvailableForSale] = useState<boolean>(product.isAvailableForSale !== false);
  const [trackStock, setTrackStock] = useState<boolean>(product.trackStock !== false);
  const initialDays = product.productionDays !== undefined
    ? product.productionDays
    : (product.productionTime?.match(/\d+/)?.[0] ? parseInt(product.productionTime.match(/\d+/)?.[0]!, 10) : 3);
  const [productionDays, setProductionDays] = useState<number>(initialDays);

  // Grade de Tamanhos State
  const [hasSizeGrid, setHasSizeGrid] = useState<boolean>(!!product.hasSizeGrid);
  const [sizeVariations, setSizeVariations] = useState<ProductSizeVariation[]>(
    product.sizeVariations && product.sizeVariations.length > 0 ? product.sizeVariations : []
  );

  // Acabamentos Vinculados State & Overrides por Produto
  const [compatibleFinishings, setCompatibleFinishings] = useState<string[]>(
    product.compatibleFinishings || []
  );
  const [productFinishings, setProductFinishings] = useState<ProductFinishingCustomization[]>(
    product.productFinishings || []
  );

  // Filtro de Grupo de Acabamentos
  const [finishingGroupFilter, setFinishingGroupFilter] = useState<string>('auto');

  // Simulator state
  const [simQty, setSimQty] = useState('10');
  const [simSelectedSizeId, setSimSelectedSizeId] = useState<string>('');
  const [simWidth, setSimWidth] = useState('100');
  const [simHeight, setSimHeight] = useState('100');
  const [simSelectedFinishings, setSimSelectedFinishings] = useState<string[]>([]);

  // Novo tamanho manual
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');
  const [newSizeCost, setNewSizeCost] = useState('');

  // Busca de acabamento
  const [finishingSearch, setFinishingSearch] = useState('');

  // Identificação inteligente de produto têxtil / vestuário
  const isProductTextile = useMemo(() => {
    const cat = (category || product.category || '').toLowerCase();
    const nm = (name || product.name || '').toLowerCase();
    return (
      hasSizeGrid ||
      cat.includes('camiset') ||
      cat.includes('textil') ||
      cat.includes('têxtil') ||
      cat.includes('uniform') ||
      cat.includes('moletom') ||
      cat.includes('polo') ||
      cat.includes('vestuário') ||
      cat.includes('vestuario') ||
      nm.includes('camiset') ||
      nm.includes('polo') ||
      nm.includes('moletom') ||
      nm.includes('uniforme') ||
      nm.includes('agasalho') ||
      nm.includes('regata')
    );
  }, [category, product.category, name, product.name, hasSizeGrid]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setCost(product.cost ? product.cost.toString() : '');
      setUnit(product.unit);
      setIsM2(!!product.isM2);
      const days = product.productionDays !== undefined
        ? product.productionDays
        : (product.productionTime?.match(/\d+/)?.[0] ? parseInt(product.productionTime.match(/\d+/)?.[0]!, 10) : 3);
      setProductionDays(days);
      setIsAvailableForSale(product.isAvailableForSale !== false);
      setTrackStock(product.trackStock !== false);
      setProductFinishings(product.productFinishings || []);
      setDescription(product.description || '');
      setPaperType(product.paperType || '');
      setImage(product.image || product.imageUrl || '');
      setHasSizeGrid(!!product.hasSizeGrid);
      setSizeVariations(product.sizeVariations && product.sizeVariations.length > 0 ? product.sizeVariations : []);
      setCompatibleFinishings(product.compatibleFinishings || []);
      setIsEditing(false);
      setIsDeletingConfirm(false);
      if (product.sizeVariations && product.sizeVariations.length > 0) {
        setSimSelectedSizeId(product.sizeVariations[0].id);
      }
    }
  }, [product]);

  // Cost and margin calculations
  const parsedPrice = parseFloat(price) || product.price || 0;
  const parsedCost = parseFloat(cost) || product.cost || parsedPrice * 0.45;
  const profit = Math.max(0, parsedPrice - parsedCost);
  const profitMarginPercent = parsedPrice > 0 ? ((profit / parsedPrice) * 100).toFixed(1) : '0';

  // Grade metrics
  const minGradePrice = sizeVariations.length > 0 ? Math.min(...sizeVariations.map((v) => v.price)) : parsedPrice;
  const maxGradePrice = sizeVariations.length > 0 ? Math.max(...sizeVariations.map((v) => v.price)) : parsedPrice;
  const avgGradeMargin =
    sizeVariations.length > 0
      ? (
          sizeVariations.reduce((acc, v) => {
            const c = v.cost || v.price * 0.45;
            const m = v.price > 0 ? ((v.price - c) / v.price) * 100 : 0;
            return acc + m;
          }, 0) / sizeVariations.length
        ).toFixed(1)
      : profitMarginPercent;

  // Simulator calculation
  const calcSimResult = () => {
    const qty = parseInt(simQty, 10) || 1;
    let baseUnitVal = product.price;

    if (hasSizeGrid && sizeVariations.length > 0) {
      const selectedVar = sizeVariations.find((v) => v.id === simSelectedSizeId) || sizeVariations[0];
      baseUnitVal = selectedVar ? selectedVar.price : product.price;
    }

    // Add selected finishings with overrides if present
    let finishingsUnitSum = 0;
    let finishingsFixedSum = 0;

    simSelectedFinishings.forEach((fId) => {
      const f = finishings.find((item) => item.id === fId || item.name === fId);
      if (f) {
        const cust = productFinishings.find((pf) => pf.finishingId === f.id || pf.finishingId === f.name);
        const effectivePrice = cust?.customPrice !== undefined ? cust.customPrice : f.price;
        if (f.pricingType === 'fixo') {
          finishingsFixedSum += effectivePrice;
        } else {
          finishingsUnitSum += effectivePrice;
        }
      }
    });

    if (product.isM2) {
      const w = parseFloat(simWidth) || 100;
      const h = parseFloat(simHeight) || 100;
      const m2Single = (w / 100) * (h / 100);
      const totalM2 = m2Single * qty;
      const baseVal = totalM2 * (product.baseM2Price || product.price);
      const totalVal = baseVal + finishingsUnitSum * qty + finishingsFixedSum;
      return { totalM2: totalM2.toFixed(2), totalVal, m2Single: m2Single.toFixed(2), unitVal: baseUnitVal };
    } else {
      const unitVal = baseUnitVal + finishingsUnitSum;
      const totalVal = unitVal * qty + finishingsFixedSum;
      return { totalM2: '0', totalVal, m2Single: '0', unitVal };
    }
  };

  const simResult = calcSimResult();

  // Orders using this product
  const relatedOrders = orders.filter((o) => {
    const term = product.name.toLowerCase();
    const inDesc = o.description.toLowerCase().includes(term);
    const inItems = o.items?.some((i) => i.name.toLowerCase().includes(term));
    return inDesc || inItems;
  });

  // Handler to save full product changes
  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const p = parseFloat(price.replace(',', '.'));
    const c = cost ? parseFloat(cost.replace(',', '.')) : undefined;

    if (!name.trim() || isNaN(p) || p < 0) return;

    // Se tem grade e tem variações, o preço base de vitrine pode ser o "A partir de"
    const effectivePrice = hasSizeGrid && sizeVariations.length > 0 ? minGradePrice : p;
    const effectiveCost = hasSizeGrid && sizeVariations.length > 0 && sizeVariations[0].cost ? sizeVariations[0].cost : c;
    const effectiveDays = Math.max(0, productionDays);
    const effectiveProductionTime = `${effectiveDays} ${effectiveDays === 1 ? 'dia útil' : 'dias úteis'}`;

    const updated: CatalogProduct = {
      ...product,
      name: name.trim(),
      category: category.trim(),
      price: effectivePrice,
      basePrice: effectivePrice,
      cost: effectiveCost,
      unit: isM2 ? 'm²' : unit.trim(),
      isM2,
      isAvailableForSale,
      trackStock,
      productionDays: effectiveDays,
      productionTime: effectiveProductionTime,
      description: description.trim() || undefined,
      paperType: paperType.trim() || undefined,
      image: image.trim() || undefined,
      imageUrl: image.trim() || undefined,
      hasSizeGrid,
      sizeVariations,
      compatibleFinishings,
      productFinishings,
    };

    onUpdateProduct?.(updated);
    setIsEditing(false);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
  };

  // Grade variation actions
  const handleApplyPreset = (presetList: ProductSizeVariation[]) => {
    setSizeVariations([...presetList]);
    setHasSizeGrid(true);
    if (presetList.length > 0) {
      setSimSelectedSizeId(presetList[0].id);
    }
  };

  const handleUpdateVariation = (id: string, field: keyof ProductSizeVariation, value: any) => {
    setSizeVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariation = (id: string) => {
    setSizeVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddManualVariation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;
    const p = parseFloat(newSizePrice.replace(',', '.')) || parsedPrice;
    const c = parseFloat(newSizeCost.replace(',', '.')) || (parsedCost ? parsedCost : p * 0.45);

    const newVar: ProductSizeVariation = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      size: newSizeName.trim(),
      price: p,
      cost: c,
      inStock: 50,
      isActive: true,
    };

    setSizeVariations((prev) => [...prev, newVar]);
    setNewSizeName('');
    setNewSizePrice('');
    setNewSizeCost('');
  };

  // Toggle compatible finishing
  const handleToggleFinishing = (finishingIdOrName: string) => {
    setCompatibleFinishings((prev) => {
      if (prev.includes(finishingIdOrName)) {
        // Remover também customizações locais se desvinculou
        setProductFinishings((pf) => pf.filter((p) => p.finishingId !== finishingIdOrName));
        return prev.filter((id) => id !== finishingIdOrName);
      } else {
        return [...prev, finishingIdOrName];
      }
    });
  };

  // Atualizar sobrescrita de acabamento para este produto
  const handleUpdateFinishingOverride = (
    finishingId: string,
    field: 'customPrice' | 'customCost' | 'customExtraDays',
    value: number | undefined
  ) => {
    setProductFinishings((prev) => {
      const existing = prev.find((p) => p.finishingId === finishingId);
      if (existing) {
        return prev.map((p) =>
          p.finishingId === finishingId ? { ...p, [field]: value } : p
        );
      } else {
        return [...prev, { finishingId, [field]: value }];
      }
    });
  };

  // Restaurar padrão global de um acabamento para este produto
  const handleResetFinishingOverride = (finishingId: string) => {
    setProductFinishings((prev) => prev.filter((p) => p.finishingId !== finishingId));
  };

  // Acabamentos filtrados com grupos inteligentes
  const filteredFinishings = finishings.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(finishingSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(finishingSearch.toLowerCase()) ||
      (f.categories && f.categories.some((c) => c.toLowerCase().includes(finishingSearch.toLowerCase()))) ||
      (f.linkGroup && f.linkGroup.toLowerCase().includes(finishingSearch.toLowerCase())) ||
      (f.linkGroups && f.linkGroups.some((g) => g.toLowerCase().includes(finishingSearch.toLowerCase())));

    if (!matchesSearch) return false;

    const itemGroups = f.linkGroups && f.linkGroups.length > 0
      ? f.linkGroups
      : f.linkGroup
      ? [f.linkGroup]
      : ['geral'];

    const itemCats = f.categories && f.categories.length > 0
      ? f.categories
      : f.category
      ? f.category.split(/[,/]/).map((c) => c.trim()).filter(Boolean)
      : [];

    if (finishingGroupFilter === 'todos') return true;
    if (finishingGroupFilter === 'auto') {
      if (isProductTextile) {
        return (
          itemGroups.includes('textil') ||
          itemGroups.includes('geral') ||
          itemCats.some((c) => c.toLowerCase().includes('têxtil') || c.toLowerCase().includes('confecção'))
        );
      }
      return true;
    }
    return itemGroups.includes(finishingGroupFilter) || itemGroups.includes('geral');
  });

  return (
    <div id="modal-detalhes-produto" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Superior */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-950/70">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              {product.isM2 ? (
                <Ruler className="w-6 h-6" />
              ) : hasSizeGrid ? (
                <Scissors className="w-6 h-6 text-amber-400" />
              ) : (
                <Package className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                  {product.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300">
                  {product.category}
                </span>

                {/* Status de Disponibilidade para Venda */}
                {isAvailableForSale ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Venda Ativa</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>Venda Pausada</span>
                  </span>
                )}

                {/* Status do Controle de Estoque */}
                {trackStock ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <Package className="w-2.5 h-2.5" />
                    <span>Estoque Ativo</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Sob Demanda</span>
                  </span>
                )}

                {/* Prazo de Produção sempre em dias úteis */}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{productionDays} {productionDays === 1 ? 'dia útil' : 'dias úteis'}</span>
                </span>

                {hasSizeGrid && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Scissors className="w-2.5 h-2.5" />
                    <span>Grade ({sizeVariations.length} tamanhos)</span>
                  </span>
                )}
                {product.isInternal ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Uso Interno</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    <span>Catálogo Público</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <span>Código: <b className="font-mono text-zinc-300">{product.id}</b></span>
                <span>•</span>
                <span>
                  {hasSizeGrid && sizeVariations.length > 0
                    ? `A partir de ${formatCurrency(minGradePrice)} até ${formatCurrency(maxGradePrice)}`
                    : `Preço: ${formatCurrency(product.price)} / ${product.unit}`}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Actions */}
            <button
              onClick={() => onDuplicateProduct?.(product)}
              title="Duplicar Produto"
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleInternal?.(product.id)}
              title={product.isInternal ? 'Tornar Público no Catálogo' : 'Ocultar (Uso Interno)'}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {product.isInternal ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-800 bg-zinc-900 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ficha & Especificações
          </button>

          <button
            onClick={() => setActiveTab('grade')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'grade'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Grade & Tamanhos</span>
            {hasSizeGrid && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {sizeVariations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('acabamentos')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'acabamentos'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Acabamentos Vinculados</span>
            {compatibleFinishings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                {compatibleFinishings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulador')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'simulador'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulador de Preço</span>
          </button>

          {product.kitItems && product.kitItems.length > 0 && (
            <button
              onClick={() => setActiveTab('kit')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'kit'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Itens do Kit ({product.kitItems.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Pedidos Recentes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
              {relatedOrders.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* TAB 1: GERAL / ESPECIFICAÇÕES */}
          {activeTab === 'geral' && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome do Produto
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Têxtil & Confecção / Brindes / Papelaria"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        {hasSizeGrid ? 'Preço Base (A partir de)' : 'Preço de Venda (R$)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 font-mono"
                        required
                      />
                      {hasSizeGrid && (
                        <p className="text-[10px] text-amber-400 mt-1">
                          Dica: Os preços específicos por tamanho podem ser editados na aba &quot;Grade & Tamanhos&quot;.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Custo Unitário de Confecção / Matéria-prima (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="Ex: 14.00"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Unidade de Medida
                      </label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Ex: peça, camiseta, un, pacote"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Prazo de Produção (em Dias Úteis)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={productionDays}
                          onChange={(e) => setProductionDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-28 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                          required
                        />
                        <span className="text-xs text-zinc-400 font-medium">
                          {productionDays === 1 ? 'dia útil' : 'dias úteis'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Apenas numeral. Prazo sempre contabilizado em dias úteis da gráfica/estamparia.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Tecido / Substrato / Especificação Técnica
                      </label>
                      <input
                        type="text"
                        value={paperType}
                        onChange={(e) => setPaperType(e.target.value)}
                        placeholder="Ex: 100% Poliéster Premium 160g / Algodão Penteado 30.1"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Toggles de Gestão Comercial: Venda & Estoque */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Toggle Habilitar Venda */}
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                          <span>Habilitar Venda do Produto</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {isAvailableForSale
                            ? 'Produto ativo no site e orçamentos.'
                            : 'Venda pausada. Oculto para compra.'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={isAvailableForSale}
                          onChange={(e) => setIsAvailableForSale(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Toggle Controle de Estoque */}
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-purple-400" />
                          <span>Controlar Estoque Físico</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {trackStock
                            ? 'Controla saldo e alerta esgotado.'
                            : 'Desativado: Sob Demanda / Infinito.'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={trackStock}
                          onChange={(e) => setTrackStock(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Toggle Grade de Tamanhos */}
                  <div className="p-3.5 bg-zinc-950 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Trabalha com Grade de Tamanhos? (Estamparia / Confecção / Uniformes)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Permite configurar tamanhos (ex: 1 ano até G3) com custos e preços de venda individuais.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSizeGrid}
                        onChange={(e) => {
                          setHasSizeGrid(e.target.checked);
                          if (e.target.checked && sizeVariations.length === 0) {
                            handleApplyPreset(PRESET_GRADE_COMPLETA);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Descrição Detalhada do Produto
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalhes sobre tecido, costura, processo de estampa (DTF/Silk Screen/Sublimação) e orientações..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Visual card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ficha Técnica do Material</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Categoria</span>
                          <span className="font-semibold text-zinc-200">{product.category}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Modo de Precificação</span>
                          <span className="font-semibold text-zinc-200">
                            {hasSizeGrid
                              ? 'Grade de Tamanhos (Preços variáveis)'
                              : product.isM2
                              ? 'Metro Quadrado (m²)'
                              : 'Por Unidade'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Substrato / Tecido</span>
                          <span className="font-semibold text-zinc-200">{product.paperType || 'Conforme especificação da ordem'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Prazo de Produção</span>
                          <span className="font-semibold text-blue-300">
                            {productionDays} {productionDays === 1 ? 'dia útil' : 'dias úteis'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Disponibilidade de Venda</span>
                          <span className={`font-semibold ${isAvailableForSale ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isAvailableForSale ? '✓ Habilitado para Venda' : '⚠ Venda Pausada'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Controle de Estoque</span>
                          <span className={`font-semibold ${trackStock ? 'text-cyan-300' : 'text-purple-300'}`}>
                            {trackStock ? 'Estoque Físico Ativo' : 'Sob Demanda / Infinito (Sem estoque)'}
                          </span>
                        </div>
                      </div>

                      {product.description && (
                        <div className="pt-3 border-t border-zinc-800/80">
                          <span className="text-zinc-500 block text-[11px] mb-1">Descrição Comercial</span>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Preço e Rentabilidade */}
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rentabilidade</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">
                              {hasSizeGrid ? 'Faixa de Venda:' : 'Preço de Venda:'}
                            </span>
                            <span className="font-mono font-bold text-blue-400">
                              {hasSizeGrid && sizeVariations.length > 0
                                ? `${formatCurrency(minGradePrice)} ~ ${formatCurrency(maxGradePrice)}`
                                : formatCurrency(product.price)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Custo Base:</span>
                            <span className="font-mono text-zinc-300">
                              {formatCurrency(parsedCost)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-zinc-800 font-bold">
                            <span className="text-emerald-400">Margem Média:</span>
                            <span className="font-mono text-emerald-400">
                              {hasSizeGrid ? `${avgGradeMargin}%` : `${profitMarginPercent}%`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                        <div className="text-[10px] text-zinc-400">Lucro Médio por Peça</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">
                          +{formatCurrency(profit > 0 ? profit : parsedPrice - parsedCost)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Destaque da Grade de Tamanhos se ativado */}
                  {hasSizeGrid && (
                    <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-amber-300">
                            Grade de Tamanhos Habilitada ({sizeVariations.length} variações cadastradas)
                          </h4>
                        </div>
                        <button
                          onClick={() => setActiveTab('grade')}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                        >
                          <span>Gerenciar Grade & Preços</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sizeVariations.map((v) => (
                          <div
                            key={v.id}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2"
                          >
                            <span className="font-bold text-zinc-100">{v.size}</span>
                            <span className="text-emerald-400 font-mono text-[11px]">
                              {formatCurrency(v.price)}
                            </span>
                            {v.cost && (
                              <span className="text-zinc-500 font-mono text-[10px]">
                                (C: {formatCurrency(v.cost)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Destaque de Acabamentos Vinculados */}
                  <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold text-purple-300">
                          Acabamentos & Opcionais Vinculados ({compatibleFinishings.length})
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('acabamentos')}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline flex items-center gap-1"
                      >
                        <span>Vincular Acabamentos</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {compatibleFinishings.length === 0 ? (
                      <p className="text-xs text-zinc-400">
                        Nenhum acabamento ou opcional vinculado a este produto. Clique em &quot;Vincular Acabamentos&quot; para selecionar quais opções estarão disponíveis no site e para a equipe.
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {compatibleFinishings.map((fId) => {
                          const f = finishings.find((item) => item.id === fId || item.name === fId);
                          return (
                            <span
                              key={fId}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                              <span>{f ? f.name : fId}</span>
                              {f && (
                                <span className="font-mono text-[11px] text-purple-300">
                                  (+{formatCurrency(f.price)})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GRADE & TAMANHOS */}
          {activeTab === 'grade' && (
            <div className="space-y-4">
              {/* Header com Toggle e Presets */}
              <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-400" />
                      <span>Configuração da Grade de Tamanhos e Variações</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Cadastre os tamanhos (ex: do 1 ano infantil ao G3) com seus respectivos preços de custo e de venda.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Grade</span>
                    </button>
                  </div>
                </div>

                {/* Presets Rápidos */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    ⚡ Carregar Presets Rápidos com 1 Clique:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(PRESET_GRADE_COMPLETA)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Grade Completa (1 ano até G3 - 18 tamanhos)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(PRESET_GRADE_INFANTIL)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    >
                      Infantil (1 a 16 anos)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(PRESET_GRADE_ADULTO)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    >
                      Adulto Padrão (PP ao XG)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(PRESET_GRADE_PLUS_SIZE)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    >
                      Plus Size (G1 ao G4)
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela de Variações */}
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <span>Lista de Tamanhos ({sizeVariations.length})</span>
                    <span className="text-[11px] text-zinc-500 font-normal">
                      Ajuste individualmente os valores de custo e venda de cada tamanho
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-3">
                    <span>A partir de: <b className="text-emerald-400 font-mono">{formatCurrency(minGradePrice)}</b></span>
                    <span>Até: <b className="text-emerald-400 font-mono">{formatCurrency(maxGradePrice)}</b></span>
                  </div>
                </div>

                {sizeVariations.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-3">
                    <Scissors className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">
                      Nenhuma variação adicionada ainda. Clique no preset acima &quot;Grade Completa (1 ano até G3)&quot; ou adicione manualmente abaixo.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 font-semibold text-[11px]">
                          <th className="py-2 px-3">Tamanho / Grade</th>
                          <th className="py-2 px-3">Custo Confecção (R$)</th>
                          <th className="py-2 px-3">Preço de Venda (R$)</th>
                          <th className="py-2 px-3">Lucro Unitário</th>
                          <th className="py-2 px-3">Margem (%)</th>
                          <th className="py-2 px-3">Estoque</th>
                          <th className="py-2 px-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {sizeVariations.map((v) => {
                          const vCost = v.cost || v.price * 0.45;
                          const vProfit = Math.max(0, v.price - vCost);
                          const vMargin = v.price > 0 ? ((vProfit / v.price) * 100).toFixed(1) : '0';

                          return (
                            <tr key={v.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={v.size}
                                  onChange={(e) => handleUpdateVariation(v.id, 'size', e.target.value)}
                                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md font-bold text-zinc-100 text-xs w-28 focus:border-amber-500 focus:outline-hidden"
                                />
                              </td>

                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-zinc-500 text-[11px]">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={v.cost ?? ''}
                                    onChange={(e) =>
                                      handleUpdateVariation(
                                        v.id,
                                        'cost',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0.00"
                                    className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-zinc-200 text-xs w-24 focus:border-amber-500 focus:outline-hidden"
                                  />
                                </div>
                              </td>

                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-zinc-500 text-[11px]">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={v.price}
                                    onChange={(e) =>
                                      handleUpdateVariation(
                                        v.id,
                                        'price',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md font-mono font-bold text-emerald-400 text-xs w-24 focus:border-amber-500 focus:outline-hidden"
                                  />
                                </div>
                              </td>

                              <td className="py-2 px-3 font-mono font-semibold text-emerald-400 text-[11px]">
                                +{formatCurrency(vProfit)}
                              </td>

                              <td className="py-2 px-3 font-mono text-[11px]">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    parseFloat(vMargin) >= 45
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : parseFloat(vMargin) >= 25
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {vMargin}%
                                </span>
                              </td>

                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.inStock ?? 50}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      v.id,
                                      'inStock',
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-zinc-300 text-xs w-16 focus:border-amber-500 focus:outline-hidden"
                                />
                              </td>

                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariation(v.id)}
                                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                  title="Remover tamanho"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Adicionar Tamanho Avulso */}
                <form
                  onSubmit={handleAddManualVariation}
                  className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      placeholder="Nome do tamanho (ex: G4, Baby Look M)"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      value={newSizeCost}
                      onChange={(e) => setNewSizeCost(e.target.value)}
                      placeholder="Custo (R$)"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      value={newSizePrice}
                      onChange={(e) => setNewSizePrice(e.target.value)}
                      placeholder="Venda (R$)"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Tamanho</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ACABAMENTOS & OPCIONAIS VINCULADOS */}
          {activeTab === 'acabamentos' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Vincular Acabamentos & Opcionais para este Produto</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Marque os acabamentos compatíveis. Você pode personalizar o valor de venda e prazo em dias úteis especificamente para este produto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveEdit()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Vinculações</span>
                </button>
              </div>

              {/* Filtros de Grupo de Vínculo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-purple-400" />
                    <span>Filtrar por Grupo de Vínculo:</span>
                  </span>
                  <span className="text-[11px] text-purple-300 font-medium">
                    {compatibleFinishings.length} acabamento(s) vinculado(s)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {isProductTextile && (
                    <button
                      type="button"
                      onClick={() => setFinishingGroupFilter('auto')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        finishingGroupFilter === 'auto'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Scissors className="w-3 h-3 text-amber-300" />
                      <span>🎯 Sugeridos para Confecção/Têxtil</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'todos'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Todos ({finishings.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('textil')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'textil'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    👕 Confecção & Têxtil
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('papelaria')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'papelaria'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    📄 Papelaria & Gráfica
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('comunicacao_visual')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'comunicacao_visual'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    🏷️ Comunicação Visual
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('brindes')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'brindes'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    🎁 Brindes & Canecas
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinishingGroupFilter('geral')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      finishingGroupFilter === 'geral'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    🌐 Geral / Outros
                  </button>
                </div>
              </div>

              {/* Busca de acabamentos */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={finishingSearch}
                  onChange={(e) => setFinishingSearch(e.target.value)}
                  placeholder="Pesquisar acabamentos neste grupo..."
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 w-full max-w-sm focus:outline-hidden focus:border-purple-500"
                />

                <div className="text-xs text-zinc-400">
                  Exibindo <span className="text-zinc-200 font-bold">{filteredFinishings.length}</span> opções
                </div>
              </div>

              {/* Lista de Acabamentos com Sobrescrita */}
              <div className="grid grid-cols-1 gap-3">
                {filteredFinishings.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800 text-zinc-400 text-xs">
                    Nenhum acabamento encontrado com os filtros atuais.
                  </div>
                ) : (
                  filteredFinishings.map((fin) => {
                    const isLinked = compatibleFinishings.includes(fin.id) || compatibleFinishings.includes(fin.name);
                    const customOverride = productFinishings.find(
                      (pf) => pf.finishingId === fin.id || pf.finishingId === fin.name
                    );
                    const hasOverride =
                      customOverride &&
                      (customOverride.customPrice !== undefined ||
                        customOverride.customExtraDays !== undefined ||
                        customOverride.customCost !== undefined);

                    const effectivePrice =
                      customOverride?.customPrice !== undefined ? customOverride.customPrice : fin.price;
                    const effectiveExtraDays =
                      customOverride?.customExtraDays !== undefined
                        ? customOverride.customExtraDays
                        : fin.extraDays || 0;

                    return (
                      <div
                        key={fin.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isLinked
                            ? 'bg-purple-950/20 border-purple-500/50 shadow-sm'
                            : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-3 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={() => handleToggleFinishing(fin.id)}
                              className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500 border-zinc-700 bg-zinc-900 cursor-pointer shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-xs text-zinc-100">
                                  {fin.name}
                                </h4>
                                {/* Categorias Múltiplas */}
                                {(() => {
                                  const cats = fin.categories && fin.categories.length > 0
                                    ? fin.categories
                                    : fin.category ? fin.category.split(/[,/]/).map((s) => s.trim()).filter(Boolean) : ['Geral'];
                                  return cats.map((cat) => (
                                    <span key={cat} className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                      {cat}
                                    </span>
                                  ));
                                })()}

                                {/* Grupos de Vínculo Múltiplos */}
                                {(() => {
                                  const grps = fin.linkGroups && fin.linkGroups.length > 0
                                    ? fin.linkGroups
                                    : fin.linkGroup ? [fin.linkGroup] : ['geral'];
                                  return grps.map((grp) => (
                                    <span key={grp} className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">
                                      {grp === 'textil'
                                        ? '👕 Confecção'
                                        : grp === 'papelaria'
                                        ? '📄 Papelaria'
                                        : grp === 'comunicacao_visual'
                                        ? '🏷️ Comunicação Visual'
                                        : grp === 'brindes'
                                        ? '✨ Brindes'
                                        : '🌐 Geral'}
                                    </span>
                                  ));
                                })()}
                                {hasOverride && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                                    <SlidersHorizontal className="w-2.5 h-2.5" />
                                    <span>Sobrescrito p/ este produto</span>
                                  </span>
                                )}
                              </div>

                              {fin.description && (
                                <p className="text-[11px] text-zinc-400 mt-1">
                                  {fin.description}
                                </p>
                              )}
                            </div>
                          </label>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-xs text-purple-300">
                              {formatCurrency(effectivePrice)}
                              <span className="text-[10px] text-zinc-500 ml-0.5 font-sans">
                                /{fin.pricingType === 'fixo' ? 'setup' : fin.unit || 'un'}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {effectiveExtraDays > 0 ? (
                                <span className="text-blue-300 font-medium">
                                  +{effectiveExtraDays} {effectiveExtraDays === 1 ? 'dia útil' : 'dias úteis'}
                                </span>
                              ) : (
                                <span className="text-zinc-500">Sem acréscimo de dias</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Painel de Customização e Sobrescrita para Este Produto */}
                        {isLinked && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 pt-3 border-t border-purple-500/20 bg-zinc-900/60 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-300 flex items-center gap-1 text-[11px]">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                                <span>Ajustar valor e tempo para este produto:</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Valor customizado */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-[11px] text-zinc-400">Preço (R$):</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={
                                    customOverride?.customPrice !== undefined
                                      ? customOverride.customPrice
                                      : fin.price
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    handleUpdateFinishingOverride(fin.id, 'customPrice', val);
                                  }}
                                  className="w-20 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-md font-mono text-xs text-zinc-100 focus:outline-hidden focus:border-purple-500"
                                />
                              </div>

                              {/* Prazo customizado em dias úteis */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-[11px] text-zinc-400">Dias úteis (+):</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={
                                    customOverride?.customExtraDays !== undefined
                                      ? customOverride.customExtraDays
                                      : fin.extraDays || 0
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                    handleUpdateFinishingOverride(fin.id, 'customExtraDays', val);
                                  }}
                                  className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-md font-mono text-xs text-blue-300 focus:outline-hidden focus:border-blue-500"
                                />
                              </div>

                              {/* Botão Restaurar Padrão Global */}
                              {hasOverride && (
                                <button
                                  type="button"
                                  onClick={() => handleResetFinishingOverride(fin.id)}
                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-[11px] flex items-center gap-1 transition-colors"
                                  title="Restaurar valores padrão da tabela geral"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  <span>Padrão Global</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SIMULADOR DE PREÇO */}
          {activeTab === 'simulador' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-blue-400" />
                    <span>Calculadora Rápida de Orçamento e Grade</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400">
                    Base: {formatCurrency(product.price)} / {product.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Seletor de Tamanho se tiver grade */}
                  {hasSizeGrid && sizeVariations.length > 0 && (
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Tamanho da Grade</label>
                      <select
                        value={simSelectedSizeId}
                        onChange={(e) => setSimSelectedSizeId(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 font-bold"
                      >
                        {sizeVariations.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.size} — {formatCurrency(v.price)} (Custo: {formatCurrency(v.cost || 0)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {product.isM2 && (
                    <>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Largura (cm)</label>
                        <input
                          type="number"
                          value={simWidth}
                          onChange={(e) => setSimWidth(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Altura (cm)</label>
                        <input
                          type="number"
                          value={simHeight}
                          onChange={(e) => setSimHeight(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Quantidade de Peças</label>
                    <input
                      type="number"
                      value={simQty}
                      onChange={(e) => setSimQty(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100"
                    />
                  </div>
                </div>

                {/* Acabamentos Vinculados no Simulador */}
                {compatibleFinishings.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1.5 font-semibold">
                      Acabamentos Opcionais a Incluir na Simulação:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {compatibleFinishings.map((fId) => {
                        const f = finishings.find((item) => item.id === fId || item.name === fId);
                        if (!f) return null;
                        const isChecked = simSelectedFinishings.includes(f.id);

                        return (
                          <label
                            key={f.id}
                            className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-xs cursor-pointer hover:bg-zinc-850"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSimSelectedFinishings((prev) =>
                                  isChecked ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                                );
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-zinc-200 flex-1 truncate">{f.name}</span>
                            <span className="font-mono text-purple-300 text-[11px]">
                              +{formatCurrency(f.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Simulation Output Card */}
                <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] text-blue-300 font-semibold block">Resultado da Simulação</span>
                    <div className="text-xs text-zinc-400">
                      <span>
                        Quantidade: <b className="text-zinc-200">{simQty} peças</b>
                        {hasSizeGrid && (
                          <span>
                            {' '}• Tamanho: <b className="text-amber-300">{sizeVariations.find((v) => v.id === simSelectedSizeId)?.size || 'Padrão'}</b>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-zinc-400 block">Preço Final Total Calculado</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {formatCurrency(simResult.totalVal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ITENS DO KIT (Se for Kit) */}
          {activeTab === 'kit' && product.kitItems && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-300">Sub-itens Inclusos neste Kit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.kitItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="text-xs flex-1">
                      <div className="font-bold text-zinc-100">{item.title}</div>
                      <div className="text-zinc-400 text-[11px] mt-0.5 space-y-0.5">
                        {item.size && <div>Tamanho: {item.size}</div>}
                        {item.paper && <div>Papel: {item.paper}</div>}
                        {item.finishing && <div>Acabamento: {item.finishing}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PEDIDOS RECENTES */}
          {activeTab === 'pedidos' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-300">
                Ordens de Serviço Recentes utilizando este Produto ({relatedOrders.length})
              </h3>

              {relatedOrders.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/80 space-y-2">
                  <Package className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Nenhum pedido recente com este produto registrado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onOpenOrderDetails?.(ord)}
                      className="p-3 bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-zinc-700"
                    >
                      <div>
                        <div className="font-semibold text-xs text-zinc-100 flex items-center gap-2">
                          <span className="font-mono text-blue-400">{ord.code}</span>
                          <span>•</span>
                          <span>{ord.clientName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{ord.description}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-zinc-200">
                          {formatCurrency(ord.total)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
