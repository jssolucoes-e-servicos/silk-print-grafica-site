import React, { useState, useEffect } from 'react';
import { Product, Category, ProductQuantity, ProductPaper, ProductFinish } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Layers, 
  Clock, 
  DollarSign, 
  Sparkles,
  Flame,
  Tag
} from 'lucide-react';
import { formatCurrency, getProductionDaysCount } from '../../lib/utils';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  product: Product | null;
  categories: Category[];
}

const GRAPHIC_IMAGE_PRESETS = [
  {
    label: 'Cartão Couché 300g',
    url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    category: 'Cartões de Visita'
  },
  {
    label: 'Panfleto / Flyer Offset',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    category: 'Panfletos & Flyers'
  },
  {
    label: 'Adesivos & Rótulos em Vinil',
    url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80',
    category: 'Adesivos & Rótulos'
  },
  {
    label: 'Banner & Lona com Ilhós',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    category: 'Banners & Lonas'
  },
  {
    label: 'Folder Tri-fold / Dobras',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    category: 'Folders & Cartazes'
  },
  {
    label: 'Pasta Corporativa com Bolsa',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    category: 'Pastas & Envelopes'
  },
  {
    label: 'Sacola Kraft Personalizada',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    category: 'Embalagens & Sacolas'
  },
  {
    label: 'Blocos & Receituários',
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
    category: 'Papelaria & Blocos'
  }
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
}) => {
  const isEditing = Boolean(product);
  const [activeTab, setActiveTab] = useState<'geral' | 'tiragens' | 'papeis' | 'acabamentos' | 'imagem'>('geral');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [basePrice, setBasePrice] = useState(59.90);
  const [productionDays, setProductionDays] = useState(1);
  const [defaultFormat, setDefaultFormat] = useState('9x5 cm');
  const [formatsText, setFormatsText] = useState('9x5 cm, 8.5x5.5 cm');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(GRAPHIC_IMAGE_PRESETS[0].url);
  const [badge, setBadge] = useState('');
  const [popular, setPopular] = useState(false);

  // Advanced configurations
  const [quantities, setQuantities] = useState<ProductQuantity[]>([]);
  const [papers, setPapers] = useState<ProductPaper[]>([]);
  const [finishes, setFinishes] = useState<ProductFinish[]>([]);

  // Helpers for adding items
  const [newQtyAmount, setNewQtyAmount] = useState(1000);
  const [newQtyPrice, setNewQtyPrice] = useState(59.90);
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperGramature, setNewPaperGramature] = useState('300g');
  const [newPaperModifier, setNewPaperModifier] = useState(0);
  const [newFinishName, setNewFinishName] = useState('');
  const [newFinishModifier, setNewFinishModifier] = useState(15.00);

  // Load product data when opened or changed
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSlug(product.slug || '');
      setCategoryName(product.category || (categories[0]?.name || 'Cartões de Visita'));
      setCategorySlug(product.categorySlug || (categories[0]?.slug || 'cartoes-de-visita'));
      setBasePrice(product.basePrice || 59.90);
      setProductionDays(getProductionDaysCount(product.productionTimeHours || 24));
      setDefaultFormat(product.defaultFormat || '9x5 cm');
      setFormatsText((product.formats || ['9x5 cm']).join(', '));
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setImage(product.image || GRAPHIC_IMAGE_PRESETS[0].url);
      setBadge(product.badge || '');
      setPopular(Boolean(product.popular));
      setQuantities(product.quantities && product.quantities.length > 0 ? product.quantities : [
        { amount: 100, label: '100 unidades', price: 39.90 },
        { amount: 250, label: '250 unidades', price: 49.90 },
        { amount: 500, label: '500 unidades', price: 54.90 },
        { amount: 1000, label: '1.000 unidades', price: 59.90, popular: true },
      ]);
      setPapers(product.papers && product.papers.length > 0 ? product.papers : [
        { id: 'couche-300g', name: 'Couché 300g Fosco/Brilho', gramature: '300g', priceModifier: 0, description: 'Papel espesso ideal para cartão.' }
      ]);
      setFinishes(product.finishes && product.finishes.length > 0 ? product.finishes : [
        { id: 'refile-simples', name: 'Refile Padrão', priceModifier: 0 },
        { id: 'lam-fosca', name: 'Laminação Fosca', priceModifier: 15.00 }
      ]);
    } else {
      // Default new product values
      setName('');
      setSlug('');
      setCategoryName(categories[0]?.name || 'Cartões de Visita');
      setCategorySlug(categories[0]?.slug || 'cartoes-de-visita');
      setBasePrice(59.90);
      setProductionDays(1);
      setDefaultFormat('9x5 cm');
      setFormatsText('9x5 cm, 8.5x5.5 cm');
      setShortDescription('Material gráfico impresso em alta resolução com acabamento profissional.');
      setDescription('Impressão em maquinário Offset de alta precisão com calibração espectrofotométrica.');
      setImage(GRAPHIC_IMAGE_PRESETS[0].url);
      setBadge('');
      setPopular(false);
      setQuantities([
        { amount: 100, label: '100 unidades', price: 39.90 },
        { amount: 250, label: '250 unidades', price: 49.90 },
        { amount: 500, label: '500 unidades', price: 54.90 },
        { amount: 1000, label: '1.000 unidades', price: 59.90, popular: true },
      ]);
      setPapers([
        { id: 'couche-300g', name: 'Couché 300g Fosco/Brilho', gramature: '300g', priceModifier: 0 }
      ]);
      setFinishes([
        { id: 'refile-simples', name: 'Refile Padrão', priceModifier: 0 },
        { id: 'lam-fosca', name: 'Laminação Fosca', priceModifier: 15.00 }
      ]);
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      const parsedFormats = formatsText.split(',').map(f => f.trim()).filter(Boolean);
      
      const payload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
        category: categoryName,
        categorySlug: categorySlug,
        basePrice: Number(basePrice) || 0,
        productionTimeHours: (Number(productionDays) || 1) * 24,
        defaultFormat: defaultFormat || parsedFormats[0] || 'Padrão',
        formats: parsedFormats.length > 0 ? parsedFormats : ['Padrão'],
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        image: image.trim(),
        badge: badge.trim(),
        popular: Boolean(popular),
        quantities: quantities.map((q: any) => {
          const amount = Number(q.amount || q.quantity || 100);
          const price = Number(q.price || q.totalPrice || 50);
          return {
            quantity: amount,
            unitPrice: amount > 0 ? Number((price / amount).toFixed(3)) : 0,
            totalPrice: price,
            discountPercent: q.discountPercent || 0,
            popular: Boolean(q.popular)
          };
        }),
        papers: papers.map((p: any) => ({
          id: p.id || 'couche-300g',
          name: p.name,
          weight: p.gramature || p.weight || '300g',
          description: p.description || '',
          category: (p.category as any) || 'couché',
          priceMultiplier: p.priceModifier !== undefined ? p.priceModifier : (p.priceMultiplier || 1)
        })),
        finishes: finishes.map((f: any) => ({
          id: f.id || 'refile',
          name: f.name,
          description: f.description || '',
          extraPrice: f.priceModifier !== undefined ? f.priceModifier : (f.extraPrice || 0),
          badge: f.badge
        })),
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setCategoryName(selectedName);
    const cat = categories.find(c => c.name === selectedName);
    if (cat) {
      setCategorySlug(cat.slug);
    }
  };

  const handleAddQuantity = () => {
    if (newQtyAmount <= 0) return;
    const exists = quantities.some(q => q.amount === newQtyAmount);
    if (exists) {
      alert('Esta tiragem já está cadastrada na lista!');
      return;
    }
    const updated = [...quantities, {
      amount: newQtyAmount,
      label: `${newQtyAmount.toLocaleString('pt-BR')} unidades`,
      price: Number(newQtyPrice) || 0
    }].sort((a, b) => a.amount - b.amount);
    setQuantities(updated);
  };

  const handleRemoveQuantity = (amount: number) => {
    if (quantities.length <= 1) {
      alert('O produto precisa ter pelo menos 1 faixa de tiragem!');
      return;
    }
    setQuantities(quantities.filter(q => q.amount !== amount));
  };

  const handleTogglePopularQuantity = (amount: number) => {
    setQuantities(quantities.map(q => ({
      ...q,
      popular: q.amount === amount ? !q.popular : false
    })));
  };

  const handleAddPaper = () => {
    if (!newPaperName.trim()) return;
    const id = newPaperName.toLowerCase().replace(/\s+/g, '-');
    setPapers([...papers, {
      id,
      name: newPaperName.trim(),
      gramature: newPaperGramature.trim(),
      priceModifier: Number(newPaperModifier) || 0
    }]);
    setNewPaperName('');
  };

  const handleRemovePaper = (id: string) => {
    setPapers(papers.filter(p => p.id !== id));
  };

  const handleAddFinish = () => {
    if (!newFinishName.trim()) return;
    const id = newFinishName.toLowerCase().replace(/\s+/g, '-');
    setFinishes([...finishes, {
      id,
      name: newFinishName.trim(),
      priceModifier: Number(newFinishModifier) || 0
    }]);
    setNewFinishName('');
  };

  const handleRemoveFinish = (id: string) => {
    setFinishes(finishes.filter(f => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading flex items-center gap-2">
                {isEditing ? 'Editar Produto Gráfico' : 'Cadastrar Novo Produto Gráfico'}
                {popular && (
                  <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Destaque
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `Modificando especificações técnicas de "${product?.name}"` : 'Preencha os dados, papéis, tiragens e acabamentos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Informações Gerais
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tiragens')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tiragens'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Tiragens & Preços ({quantities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('papeis')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'papeis'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Papéis & Gramaturas ({papers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acabamentos')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'acabamentos'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Acabamentos ({finishes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('imagem')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'imagem'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Foto & Visual
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Nome do Produto Gráfico *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cartão de Visita Couché 300g Fosco + Verniz Localizado"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Categoria Principal *</label>
                  <select
                    value={categoryName}
                    onChange={handleCategoryChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Preço Base Exibido (A partir de)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Prazo de Produção (Dias Úteis)</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={productionDays}
                      onChange={(e) => setProductionDays(parseInt(e.target.value, 10) || 1)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={1}>1 dia útil (Rápido)</option>
                      <option value={2}>2 dias úteis</option>
                      <option value={3}>3 dias úteis</option>
                      <option value={4}>4 dias úteis</option>
                      <option value={5}>5 dias úteis</option>
                      <option value={7}>7 dias úteis</option>
                      <option value={10}>10 dias úteis</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Formato Padrão</label>
                  <input
                    type="text"
                    value={defaultFormat}
                    onChange={(e) => setDefaultFormat(e.target.value)}
                    placeholder="Ex: 9x5 cm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Formatos Disponíveis (Separados por vírgula)</label>
                  <input
                    type="text"
                    value={formatsText}
                    onChange={(e) => setFormatsText(e.target.value)}
                    placeholder="Ex: 9x5 cm, 8.5x5.5 cm, 9x4.5 cm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Resumo Rápido (Exibido nos Cards)</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Ex: Cartão clássico com laminação aveludada e verniz com relevo."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Descrição Técnica & Processo</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes sobre a impressão, parque fabril, indicações de uso..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Selo / Badge (Opcional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: MAIS VENDIDO, 24 HORAS, PROMOÇÃO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="chk-popular"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <label htmlFor="chk-popular" className="text-xs font-bold text-slate-200 cursor-pointer select-none flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-pink-500" /> Marcar como Destaque da Semana na Home
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIRAGENS & PREÇOS */}
          {activeTab === 'tiragens' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Quantidade (unidades)</label>
                  <input
                    type="number"
                    value={newQtyAmount}
                    onChange={(e) => setNewQtyAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Ex: 1000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Preço Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newQtyPrice}
                    onChange={(e) => setNewQtyPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 59.90"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddQuantity}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Faixa
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tiragem</th>
                      <th className="p-3">Preço Total</th>
                      <th className="p-3">Preço Unitário</th>
                      <th className="p-3 text-center">Mais Vendida</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {quantities.map((q) => {
                      const unitPrice = q.amount > 0 ? (q.price / q.amount) : 0;
                      return (
                        <tr key={q.amount} className="hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-white font-mono">{q.amount.toLocaleString('pt-BR')} un</td>
                          <td className="p-3 font-bold text-emerald-400 font-mono">{formatCurrency(q.price)}</td>
                          <td className="p-3 text-slate-400 font-mono">R$ {unitPrice.toFixed(3)}/un</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePopularQuantity(q.amount)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                q.popular
                                  ? 'bg-pink-950 text-pink-400 border border-pink-800'
                                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {q.popular ? '★ Destaque' : 'Definir'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveQuantity(q.amount)}
                              className="p-1 text-rose-400 hover:bg-rose-950/40 rounded-lg"
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
            </div>
          )}

          {/* TAB 3: PAPÉIS */}
          {activeTab === 'papeis' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome do Papel</label>
                  <input
                    type="text"
                    value={newPaperName}
                    onChange={(e) => setNewPaperName(e.target.value)}
                    placeholder="Ex: Couché 300g Fosco"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Gramatura</label>
                  <input
                    type="text"
                    value={newPaperGramature}
                    onChange={(e) => setNewPaperGramature(e.target.value)}
                    placeholder="Ex: 300g"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Modificador (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPaperModifier}
                    onChange={(e) => setNewPaperModifier(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPaper}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Papel
                </button>
              </div>

              <div className="space-y-2">
                {papers.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Gramatura: <span className="font-mono text-cyan-400">{p.gramature}</span> • Acréscimo: <span className="font-mono text-emerald-400">+{formatCurrency(p.priceModifier || 0)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePaper(p.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACABAMENTOS */}
          {activeTab === 'acabamentos' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome do Acabamento</label>
                  <input
                    type="text"
                    value={newFinishName}
                    onChange={(e) => setNewFinishName(e.target.value)}
                    placeholder="Ex: Verniz Localizado UV"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="w-36">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Preço Adicional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newFinishModifier}
                    onChange={(e) => setNewFinishModifier(parseFloat(e.target.value) || 0)}
                    placeholder="15.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFinish}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Acabamento
                </button>
              </div>

              <div className="space-y-2">
                {finishes.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{f.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Acréscimo: <span className="font-mono text-emerald-400">+{formatCurrency(f.priceModifier || 0)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFinish(f.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: IMAGEM & PRESETS */}
          {activeTab === 'imagem' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">URL da Imagem do Produto</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Ou escolha um Preset Fotográfico da Gráfica:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GRAPHIC_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImage(preset.url)}
                      className={`group cursor-pointer rounded-xl overflow-hidden border p-1.5 transition-all ${
                        image === preset.url
                          ? 'border-cyan-500 ring-2 ring-cyan-500/50 bg-cyan-950/30'
                          : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {image === preset.url && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-white mt-1.5 truncate text-center">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 text-center">{preset.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Gravando no Banco...' : isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
