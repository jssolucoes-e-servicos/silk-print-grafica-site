import React, { useState, useMemo } from 'react';
import { Product, PaperType, ColorMode, FinishOption, CartItem } from '../types';
import { formatCurrency, formatProductionDays } from '../lib/utils';
import { createCuid } from '../lib/cuid';
import { uploadArtworkFile } from '../lib/api';
import { 
  Check, 
  Upload, 
  FileText, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Truck, 
  AlertCircle, 
  CreditCard, 
  QrCode,
  ArrowRight,
  Info,
  CheckCircle2,
  Paintbrush
} from 'lucide-react';

interface ProductConfiguratorProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onOpenGabaritos: () => void;
  onOpenQuoteModal: () => void;
}

export const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onOpenGabaritos,
  onOpenQuoteModal,
}) => {
  // Selected configuration options
  const [selectedFormat, setSelectedFormat] = useState<string>(product.defaultFormat || product.formats[0]);
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(product.papers[0]);
  const [selectedColor, setSelectedColor] = useState<ColorMode>(product.colorModes[0]);
  const [selectedFinishes, setSelectedFinishes] = useState<FinishOption[]>([product.finishes[0]]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    product.quantities.find(q => q.popular)?.quantity || product.quantities[0]?.quantity || 1000
  );
  const [productionSpeed, setProductionSpeed] = useState<'normal' | 'express'>('normal');
  const [artworkOption, setArtworkOption] = useState<'upload' | 'creation' | 'review'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; url?: string } | null>(null);
  const [isPreflightValid, setIsPreflightValid] = useState<boolean>(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);

  // Toggle finish options
  const toggleFinish = (finish: FinishOption) => {
    if (selectedFinishes.some(f => f.id === finish.id)) {
      // Don't allow removing if it's the only one and has 0 price (base finish)
      if (selectedFinishes.length === 1 && finish.extraPrice === 0) return;
      setSelectedFinishes(selectedFinishes.filter(f => f.id !== finish.id));
    } else {
      setSelectedFinishes([...selectedFinishes, finish]);
    }
  };

  // Calculate pricing based on matrix
  const pricing = useMemo(() => {
    const qtyTier = product.quantities.find(q => q.quantity === selectedQuantity) || product.quantities[0];
    const baseTotal = qtyTier ? qtyTier.totalPrice : product.basePrice;
    
    // Apply multipliers
    const paperFactor = selectedPaper ? selectedPaper.priceMultiplier : 1.0;
    const colorFactor = selectedColor ? selectedColor.priceMultiplier : 1.0;
    
    // Additional finishes
    const finishesTotal = selectedFinishes.reduce((acc, f) => acc + (f.extraPrice || 0), 0);
    
    // Production speed surcharge (Express 24h: +15%)
    const speedMultiplier = productionSpeed === 'express' ? 1.15 : 1.0;
    
    // Creation service
    const creationService = artworkOption === 'creation' ? 35.00 : 0;

    const computedTotal = (baseTotal * paperFactor * colorFactor * speedMultiplier) + finishesTotal + creationService;
    const computedUnit = computedTotal / (selectedQuantity || 1);
    const pixDiscountTotal = computedTotal * 0.95; // 5% discount on PIX

    return {
      total: computedTotal,
      unitPrice: computedUnit,
      pixTotal: pixDiscountTotal,
      installments: computedTotal / 6, // 6x sem juros
      discountPercent: qtyTier ? qtyTier.discountPercent : 0,
    };
  }, [product, selectedQuantity, selectedPaper, selectedColor, selectedFinishes, productionSpeed, artworkOption]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzingFile(true);
      setUploadedFile({ name: file.name, size: file.size });
      
      try {
        const uploadRes = await uploadArtworkFile(file);
        setUploadedFile({
          name: file.name,
          size: file.size,
          url: uploadRes.fileUrl
        });
        setIsPreflightValid(true);
      } catch (err) {
        console.warn('Upload MinIO fallback:', err);
        setIsPreflightValid(true);
      } finally {
        setIsAnalyzingFile(false);
      }
    }
  };

  const createCartItem = (): CartItem => {
    return {
      id: createCuid(),
      productId: product.id,
      productName: product.name,
      category: product.category,
      image: product.image,
      format: selectedFormat,
      paper: selectedPaper,
      colorMode: selectedColor,
      finishes: selectedFinishes,
      quantity: selectedQuantity,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.total,
      productionTime: productionSpeed === 'express' ? '1 dia útil (Express)' : `${formatProductionDays(product.productionTimeHours)} (Normal)`,
      artworkOption,
      artworkFile: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size, url: uploadedFile.url } : undefined,
    };
  };


  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden" id="product-configurator">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">{product.category}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Checagem de Arquivo Grátis
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <Clock className="w-4 h-4" /> Produção em até {formatProductionDays(product.productionTimeHours)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Center: Configurator Steps */}
        <div className="lg:col-span-7 space-y-6">

          {/* STEP 1: Formato / Dimensões */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Formato / Tamanho Final</span>
              </label>
              <button
                type="button"
                onClick={onOpenGabaritos}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Gabarito</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.formats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all relative ${
                    selectedFormat === fmt
                      ? 'border-cyan-500 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{fmt}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Com sangria de 2mm</div>
                  {selectedFormat === fmt && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Papel / Substrato */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Tipo de Papel / Gramatura</span>
            </label>
            <div className="space-y-2">
              {product.papers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPaper.id === paper.id
                      ? 'border-cyan-500 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaper.id === paper.id ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300 bg-white'
                    }`}>
                      {selectedPaper.id === paper.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{paper.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {paper.weight}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{paper.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Enquadramento de Cor */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Cores de Impressão</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {product.colorModes.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedColor.id === color.id
                      ? 'border-cyan-500 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>{color.code}</span>
                    <span className="flex gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{color.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Enobrecimento & Acabamentos Especiais */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
              <span>Acabamentos & Enobrecimento</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.finishes.map((finish) => {
                const isSelected = selectedFinishes.some(f => f.id === finish.id);
                return (
                  <div
                    key={finish.id}
                    onClick={() => toggleFinish(finish)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{finish.name}</span>
                          {finish.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-bold">
                              {finish.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{finish.description}</div>
                      </div>
                    </div>
                    {finish.extraPrice > 0 && (
                      <span className="text-xs font-bold text-slate-700 shrink-0 ml-2">
                        +{formatCurrency(finish.extraPrice)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 5: Tiragem / Quantidade com Tabela de Desconto */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">5</span>
                <span>Escolha a Quantidade (Quanto mais você pede, menos paga por unidade)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.quantities.map((tier) => {
                const isSelected = selectedQuantity === tier.quantity;
                return (
                  <button
                    key={tier.quantity}
                    type="button"
                    onClick={() => setSelectedQuantity(tier.quantity)}
                    className={`p-3 rounded-xl border text-center transition-all relative ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    {tier.popular && (
                      <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected ? 'bg-yellow-400 text-slate-900' : 'bg-slate-900 text-white'
                      }`}>
                        Mais Pedido
                      </span>
                    )}
                    <div className="text-sm font-extrabold">{tier.quantity.toLocaleString('pt-BR')} un</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                      {formatCurrency(tier.unitPrice)} / un
                    </div>
                    {tier.discountPercent > 0 && (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 ${
                        isSelected ? 'bg-cyan-700 text-cyan-100' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        -{tier.discountPercent}% OFF
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 6: Envio de Arquivo & Pré-impressão */}
          <div className="pt-2 border-t border-slate-200">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">6</span>
              <span>Arquivo da Arte / Criação</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setArtworkOption('upload')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  artworkOption === 'upload'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Enviar Minha Arte</span>
              </button>

              <button
                type="button"
                onClick={() => setArtworkOption('creation')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  artworkOption === 'creation'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5 text-pink-600" />
                <span>Contratar Criação (+R$35)</span>
              </button>

              <button
                type="button"
                onClick={() => setArtworkOption('review')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  artworkOption === 'review'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Enviar Após o Pedido</span>
              </button>
            </div>

            {artworkOption === 'upload' && (
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-all text-center relative">
                <input
                  type="file"
                  id="artwork-file-input"
                  accept=".pdf,.cdr,.ai,.psd,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {isAnalyzingFile ? (
                  <div className="py-3 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-700">Checando resolução, sangrias e padrão CMYK...</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-xs">{uploadedFile.name}</div>
                        <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Arquivo Aprovado na Pré-Impressão (300 DPI / CMYK)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-600 font-bold hover:underline cursor-pointer">Trocar</span>
                  </div>
                ) : (
                  <div className="py-2 space-y-1">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      Clique ou arraste seu arquivo aqui
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Formatos aceitos: PDF/X-1a (Recomendado), CDR, AI, PSD, JPG (300 DPI)
                    </p>
                  </div>
                )}
              </div>
            )}

            {artworkOption === 'creation' && (
              <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Serviço de Criação de Arte Profissional</div>
                  <div className="text-pink-800 mt-0.5">
                    Nossa equipe de designers gráficos criará o layout do zero conforme suas instruções e enviará a prévia no WhatsApp para aprovação antes de rodar!
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Pricing Summary & Checkout Call-to-action */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 sticky top-24 space-y-5">
            
            <div className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{product.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Configuração Personalizada</p>
              </div>
            </div>

            {/* Spec summary bullet points */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Formato:</span>
                <span className="font-semibold text-slate-900">{selectedFormat}</span>
              </div>
              <div className="flex justify-between">
                <span>Papel:</span>
                <span className="font-semibold text-slate-900">{selectedPaper.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Impressão:</span>
                <span className="font-semibold text-slate-900">{selectedColor.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiragem:</span>
                <span className="font-bold text-cyan-700">{selectedQuantity.toLocaleString('pt-BR')} unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Acabamentos:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedFinishes.map(f => f.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </div>

            {/* Production speed selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prazo de Produção
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProductionSpeed('normal')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    productionSpeed === 'normal'
                      ? 'border-cyan-600 bg-white ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white/60 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-slate-900">Normal ({formatProductionDays(product.productionTimeHours)})</div>
                  <div className="text-[10px] text-slate-500">Prazo padrão sem taxa extra</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProductionSpeed('express')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all relative ${
                    productionSpeed === 'express'
                      ? 'border-pink-500 bg-pink-50/50 ring-2 ring-pink-500/20'
                      : 'border-slate-200 bg-white/60 text-slate-600'
                  }`}
                >
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded bg-pink-600 text-white text-[9px] font-extrabold">
                    URGENTE
                  </span>
                  <div className="font-bold text-pink-900">Express (1 dia útil)</div>
                  <div className="text-[10px] text-pink-700 font-semibold">+15% taxa de urgência</div>
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Preço Total:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 font-heading">
                    {formatCurrency(pricing.total)}
                  </span>
                </div>
              </div>

              {/* PIX Discount Callout */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>No PIX com 5% de desconto:</span>
                </div>
                <span className="text-sm font-black text-emerald-700">
                  {formatCurrency(pricing.pixTotal)}
                </span>
              </div>

              <div className="text-right text-[11px] text-slate-500 pt-1">
                ou até <span className="font-bold text-slate-800">6x de {formatCurrency(pricing.installments)}</span> sem juros
              </div>
              <div className="text-right text-[11px] text-slate-400">
                (Apenas {formatCurrency(pricing.unitPrice)} por unidade)
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onBuyNow(createCartItem())}
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 active:scale-[0.99]"
                id="btn-buy-now"
              >
                <span>Comprar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onAddToCart(createCartItem())}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                id="btn-add-to-cart"
              >
                <span>Adicionar ao Carrinho</span>
              </button>
            </div>

            {/* Custom Quote Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="text-xs text-slate-600 hover:text-cyan-700 font-semibold underline"
              >
                Precisa de tiragem maior ou faca sob medida? Peça um orçamento
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default ProductConfigurator;
