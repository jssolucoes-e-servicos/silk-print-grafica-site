import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Upload,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Tag,
  Clock,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Image as ImageIcon,
  Globe,
  Lock,
  Ruler,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CatalogProduct, KitSubItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface CatalogoEcommerceProdutosScreenProps {
  products: CatalogProduct[];
  onOpenCatalogPreview: () => void;
  onAddProduct: (prod: CatalogProduct) => void;
  onDeleteProduct?: (id: string) => void;
  onToggleProductInternal?: (id: string) => void;
  onOpenProductDetails?: (product: CatalogProduct) => void;
  initialTypeFilter?: 'todos' | 'ecommerce' | 'internos';
}

const CATEGORIES_LIST = [
  'Todas as Categorias',
  'Kit Variável',
  'Kit Fixo',
  'Kits',
  'Tags',
  'Cartões',
  'Adesivos',
  'Blocos',
  'Panfletos',
  'Banners',
  'Agendas',
  'Presentes',
  'Cardápios',
  'Impressão',
  'Sacolas',
  'Comunicação Visual',
  'Papelaria',
  'Acabamentos',
  'Produtos por m²',
  'Outros',
];

export const CatalogoEcommerceProdutosScreen: React.FC<CatalogoEcommerceProdutosScreenProps> = ({
  products,
  onOpenCatalogPreview,
  onAddProduct,
  onDeleteProduct,
  onToggleProductInternal,
  onOpenProductDetails,
  initialTypeFilter = 'todos',
}) => {
  // Product scope filter (All vs Ecommerce/Site vs Internal)
  const [typeFilter, setTypeFilter] = useState<'todos' | 'ecommerce' | 'internos'>(initialTypeFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [sortBy, setSortBy] = useState<'recente' | 'menor-preco' | 'maior-preco' | 'nome'>('recente');
  const [expandedKitId, setExpandedKitId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInternalProduct, setIsInternalProduct] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCost, setProdCost] = useState('');
  const [prodCategory, setProdCategory] = useState('Cartões');
  const [prodUnit, setProdUnit] = useState('unidade');
  const [isM2Calculation, setIsM2Calculation] = useState(false);
  const [prodProductionTime, setProdProductionTime] = useState('3 a 5 dias úteis');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [kitItems, setKitItems] = useState<KitSubItem[]>([
    {
      id: 'sub-1',
      title: '',
      size: '',
      printType: '',
      paper: '',
      finishing: '',
      image: '',
    },
  ]);

  // Counts for KPIs & Tabs
  const totalCount = products.length;
  const ecommerceCount = products.filter((p) => !p.isInternal).length;
  const internalCount = products.filter((p) => p.isInternal).length;
  const m2Count = products.filter((p) => p.isM2).length;

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Scope filter (Site vs Internos)
        if (typeFilter === 'ecommerce' && p.isInternal) return false;
        if (typeFilter === 'internos' && !p.isInternal) return false;

        // Category filter
        if (selectedCategory !== 'Todas as Categorias') {
          if (selectedCategory === 'Produtos por m²') {
            if (!p.isM2) return false;
          } else if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchItems = p.kitItems?.some((i) => i.title.toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchDesc && !matchItems) return false;
        }
        // Status filter
        if (statusFilter === 'ativos' && p.isActive === false) return false;
        if (statusFilter === 'inativos' && p.isActive !== false) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'menor-preco') return a.price - b.price;
        if (sortBy === 'maior-preco') return b.price - a.price;
        if (sortBy === 'nome') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, typeFilter, selectedCategory, searchQuery, statusFilter, sortBy]);

  const handleAddItemSlot = () => {
    if (kitItems.length >= 6) return;
    setKitItems((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        title: '',
        size: '',
        printType: '',
        paper: '',
        finishing: '',
        image: '',
      },
    ]);
  };

  const handleRemoveItemSlot = (id: string) => {
    if (kitItems.length <= 1) return;
    setKitItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemSlot = (id: string, field: keyof KitSubItem, val: string) => {
    setKitItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleOpenAddModal = (forInternal = false) => {
    setIsInternalProduct(forInternal);
    setProdName('');
    setProdPrice('');
    setProdCost('');
    setProdCategory(forInternal ? 'Papelaria' : 'Cartões');
    setProdUnit(forInternal ? 'unidade' : 'unidade');
    setIsM2Calculation(false);
    setProdProductionTime(forInternal ? '2 a 4 dias úteis' : '3 a 5 dias úteis');
    setProdDescription('');
    setProdImage('');
    setKitItems([
      {
        id: 'sub-1',
        title: '',
        size: '',
        printType: '',
        paper: '',
        finishing: '',
        image: '',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(prodPrice.replace(',', '.'));
    if (!prodName.trim() || isNaN(priceNum)) return;

    const validKitItems = kitItems.filter((i) => i.title.trim() !== '');

    const newProduct: CatalogProduct = {
      id: `prod-${Date.now()}`,
      name: prodName.trim(),
      category: prodCategory,
      price: priceNum,
      baseM2Price: isM2Calculation ? priceNum : undefined,
      isM2: isM2Calculation,
      isInternal: isInternalProduct,
      unit: isM2Calculation ? 'm²' : prodUnit,
      productionTime: prodProductionTime.trim() || undefined,
      description: prodDescription.trim() || undefined,
      kitItems: validKitItems.length > 0 ? validKitItems : undefined,
      isActive: true,
      image:
        prodImage.trim() ||
        (isInternalProduct
          ? undefined
          : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60'),
    };

    onAddProduct(newProduct);
    setIsModalOpen(false);
  };

  const handleImportMock = () => {
    const sampleKit: CatalogProduct = {
      id: `prod-sample-${Date.now()}`,
      name: 'Kit Empreendedor Semijoias & Bijuterias',
      category: 'Kits',
      price: 299.9,
      unit: 'kit',
      isInternal: false,
      productionTime: '5 a 7 dias úteis',
      description: 'Kit completo com tags personalizadas, cartelas de brinco e adesivos lacre.',
      kitItems: [
        {
          id: 'sub-1',
          title: '200 Tag Brinco + 1 par de Corte',
          size: '4cm x 4cm',
          printType: '4x0 (Colorido)',
          paper: 'Couché 300g',
          finishing: 'Laminação Fosca Bopp',
          image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=60',
        },
        {
          id: 'sub-2',
          title: '100 Cartelas Gravatinha Corrente',
          size: '4cm x 9cm',
          printType: '4x0 (Colorido)',
          paper: 'Kraft 240g',
          finishing: 'Corte Especial',
        },
        {
          id: 'sub-3',
          title: '300 Adesivos Lacre Redondos',
          size: '3cm x 3cm',
          printType: '4x0 (Colorido)',
          paper: 'Vinil Brilho',
          finishing: 'Meio Corte',
        },
      ],
      isActive: true,
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=60',
    };
    onAddProduct(sampleKit);
  };

  return (
    <div id="screen-ecommerce-produtos" className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Produtos & Insumos</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {totalCount} cadastrados
            </span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Gerencie itens do catálogo online e insumos internos para calculadora de orçamentos
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => handleOpenAddModal(false)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Scope Segmented Tabs: [ Todos | Comercializados no Site | Insumos & Produtos Internos ] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-sm">
        <div className="grid grid-cols-3 sm:flex items-center gap-1">
          <button
            onClick={() => setTypeFilter('todos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
              typeFilter === 'todos'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Todos</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/60 hidden sm:inline">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter('ecommerce')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
              typeFilter === 'ecommerce'
                ? 'bg-blue-600/20 text-blue-400 shadow-xs border border-blue-500/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>No Catálogo / Site</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {ecommerceCount}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter('internos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
              typeFilter === 'internos'
                ? 'bg-amber-500/20 text-amber-400 shadow-xs border border-amber-500/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Uso Interno</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {internalCount}
            </span>
          </button>
        </div>

        {/* Quick helper note */}
        <div className="text-[11px] text-zinc-400 px-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="hidden md:inline">
            A flag <b className="text-zinc-300">Uso Interno</b> oculta o item do catálogo público e o mantém ativo em orçamentos.
          </span>
        </div>
      </div>

      {/* Modern Filter & Search Toolbar */}
      <div className="p-3 md:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, categoria, m² ou insumo..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative">
            <div className="flex items-center">
              <Filter className="w-3.5 h-3.5 text-blue-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 appearance-none font-medium cursor-pointer"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Sort & Order Dropdown */}
          <div className="relative">
            <div className="flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 appearance-none font-medium cursor-pointer"
              >
                <option value="recente">Mais Recentes</option>
                <option value="menor-preco">Menor Preço</option>
                <option value="maior-preco">Maior Preço</option>
                <option value="nome">Nome (A - Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Counter & Quick Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-medium">Exibindo:</span>
            <span className="font-bold text-zinc-200 font-mono">
              {filteredProducts.length}
            </span>
            <span className="text-zinc-500">de</span>
            <span className="font-bold text-zinc-400 font-mono">
              {products.length} produtos
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-zinc-800 text-blue-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('ativos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ativos'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('inativos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'inativos'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pausados
            </button>
          </div>
        </div>
      </div>

      {/* Card-Table Content List */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-12 text-center flex flex-col items-center justify-center min-h-[280px] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Package className="w-6 h-6 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-200">Nenhum produto encontrado</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Nenhum item corresponde aos filtros selecionados. Tente ajustar a busca ou adicione um novo produto.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                setTypeFilter('todos');
                setSelectedCategory('Todas as Categorias');
                setSearchQuery('');
                setStatusFilter('todos');
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => handleOpenAddModal(false)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
            <div className="col-span-5">Produto / Detalhes</div>
            <div className="col-span-2">Categoria & Tipo</div>
            <div className="col-span-2">Preço Unitário</div>
            <div className="col-span-2">Visibilidade & Prazo</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          {/* Product Items rendered as responsive Card-Rows */}
          {filteredProducts.map((prod) => {
            const isKit = prod.kitItems && prod.kitItems.length > 0;
            const isExpanded = expandedKitId === prod.id;
            const isInternal = !!prod.isInternal;

            return (
              <div
                key={prod.id}
                onClick={() => onOpenProductDetails?.(prod)}
                className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 transition-all shadow-sm overflow-hidden group cursor-pointer hover:bg-zinc-850"
              >
                {/* Main Card Row */}
                <div className="p-3.5 sm:p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                  {/* Col 1: Photo & Product Info (Col-Span 5 on Desktop) */}
                  <div className="lg:col-span-5 flex items-start sm:items-center gap-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shrink-0 relative flex items-center justify-center">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-zinc-600" />
                      )}

                      {/* Overlaid Badges on Image */}
                      {isKit && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-blue-400 border border-blue-500/30">
                          KIT
                        </span>
                      )}
                      {prod.isM2 && !isKit && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-purple-400 border border-purple-500/30">
                          m²
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                      {prod.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {prod.description}
                        </p>
                      )}
                      {isKit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedKitId(isExpanded ? null : prod.id);
                          }}
                          className="mt-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{prod.kitItems?.length} itens inclusos no kit</span>
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Category & Scope Tag (Col-Span 2 on Desktop) */}
                  <div className="mt-3 lg:mt-0 lg:col-span-2 flex items-center justify-between lg:justify-start gap-1.5 flex-wrap">
                    <span className="lg:hidden text-[11px] text-zinc-500 font-medium">Categoria:</span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 inline-flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-blue-400" />
                      {prod.category}
                    </span>
                    {prod.isM2 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        m²
                      </span>
                    )}
                  </div>

                  {/* Col 3: Price (Col-Span 2 on Desktop) */}
                  <div className="mt-2 lg:mt-0 lg:col-span-2 flex items-center justify-between lg:justify-start">
                    <span className="lg:hidden text-[11px] text-zinc-500 font-medium">Preço:</span>
                    <div>
                      <div className="text-sm font-bold text-blue-400 font-mono">
                        {formatCurrency(prod.price)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        por {prod.unit || (prod.isM2 ? 'm²' : 'un')}
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Visibility Flag & Prazo (Col-Span 2 on Desktop) */}
                  <div className="mt-2 lg:mt-0 lg:col-span-2 flex items-center justify-between lg:justify-start gap-2">
                    <span className="lg:hidden text-[11px] text-zinc-500 font-medium">Disponibilidade:</span>
                    <div className="space-y-1">
                      {isInternal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          Uso Interno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Globe className="w-2.5 h-2.5 text-emerald-400" />
                          No Catálogo / Site
                        </span>
                      )}

                      {prod.isAvailableForSale === false && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Venda Pausada
                        </span>
                      )}

                      {prod.trackStock === false && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Estoque Livre
                        </span>
                      )}

                      {(prod.productionDays !== undefined || prod.productionTime) && (
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>
                            {prod.productionDays !== undefined
                              ? `${prod.productionDays} ${prod.productionDays === 1 ? 'dia útil' : 'dias úteis'}`
                              : prod.productionTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 5: Actions (Col-Span 1 on Desktop) */}
                  <div
                    className="mt-3 lg:mt-0 lg:col-span-1 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/60 flex items-center justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* View Details Button */}
                    <button
                      onClick={() => onOpenProductDetails?.(prod)}
                      className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Ver Ficha e Ações"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Toggle Internal / Ecommerce */}
                    {onToggleProductInternal && (
                      <button
                        onClick={() => onToggleProductInternal(prod.id)}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                        title={
                          isInternal
                            ? 'Tornar visível no catálogo / site'
                            : 'Mover para uso exclusivo interno'
                        }
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteProduct && (
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Kit Subitems Drawer */}
                {isKit && isExpanded && (
                  <div className="px-4 py-3 bg-zinc-950/90 border-t border-zinc-800/80 animate-in fade-in duration-150">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Composição do Kit:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {prod.kitItems?.map((sub, sIdx) => (
                        <div
                          key={sub.id || sIdx}
                          className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1"
                        >
                          <div className="font-semibold text-zinc-200 truncate">
                            {sub.title}
                          </div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-zinc-400">
                            {sub.size && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {sub.size}
                              </span>
                            )}
                            {sub.paper && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {sub.paper}
                              </span>
                            )}
                            {sub.printType && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {sub.printType}
                              </span>
                            )}
                          </div>
                          {sub.finishing && (
                            <div className="text-[10px] text-blue-400">
                              Acabamento: {sub.finishing}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Novo Produto / Kit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/90 bg-zinc-950">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  {isInternalProduct ? 'Cadastrar Produto / Insumo Interno' : 'Cadastrar Produto para Catálogo'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure disponibilidade, precificação e detalhes do item
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Flag Selector: Comercializado no Site vs Uso Interno */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Disponibilidade & Visibilidade <span className="text-blue-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsInternalProduct(false)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      !isInternalProduct
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>No Catálogo / Site</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInternalProduct(true)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isInternalProduct
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Uso Interno</span>
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {isInternalProduct
                    ? '🔒 Visível apenas internamente em Orçamentos, Pedidos Manuais e Cálculos.'
                    : '🌐 Exibido na vitrine online para clientes visualizarem e solicitarem.'}
                </span>
              </div>

              {/* Row 1: Nome e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome do Produto <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder={
                      isInternalProduct
                        ? 'Ex: Chapa PVC 2mm / Lona 440g'
                        : 'Ex: Kit Empreendedor Completo'
                    }
                    className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    {CATEGORIES_LIST.filter((c) => c !== 'Todas as Categorias').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Preço, Unidade e Tipo de Cálculo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Preço de Venda (R$) <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Unidade de Venda
                  </label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    disabled={isM2Calculation}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="unidade">Unidade (un)</option>
                    <option value="kit">Kit (conjunto)</option>
                    <option value="milheiro">Milheiro (1.000 un)</option>
                    <option value="500 un">500 unidades</option>
                    <option value="cento">Cento (100 un)</option>
                    <option value="m²">Metro Quadrado (m²)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Prazo Médio
                  </label>
                  <input
                    type="text"
                    value={prodProductionTime}
                    onChange={(e) => setProdProductionTime(e.target.value)}
                    placeholder="Ex: 3 a 5 dias úteis"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* M2 Calculation Checkbox */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      Calcular preço por Metro Quadrado (m²)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Calcula automaticamente largura × altura ao criar orçamentos
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isM2Calculation}
                  onChange={(e) => {
                    setIsM2Calculation(e.target.checked);
                    if (e.target.checked) setProdUnit('m²');
                  }}
                  className="w-4 h-4 text-blue-600 rounded bg-zinc-900 border-zinc-700 cursor-pointer"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Descrição / Especificações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Detalhes sobre papel, laminação, durabilidade..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              {/* Imagem URL (para catálogo) */}
              {!isInternalProduct && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    URL da Foto do Produto
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-8 pr-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Sub-itens para Kit (Opcional) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">
                      Itens Inclusos / Composição do Kit (Opcional)
                    </h4>
                    <p className="text-[10px] text-zinc-500">
                      Adicione itens que compõem este combo ou kit gráfico
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemSlot}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {kitItems.map((slot, index) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-400">
                          Item #{index + 1}
                        </span>
                        {kitItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemSlot(slot.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => handleUpdateItemSlot(slot.id, 'title', e.target.value)}
                          placeholder="Ex: 500 Cartões de Visita"
                          className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={slot.size || ''}
                          onChange={(e) => handleUpdateItemSlot(slot.id, 'size', e.target.value)}
                          placeholder="Tamanho (Ex: 9x5cm)"
                          className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={slot.paper || ''}
                          onChange={(e) => handleUpdateItemSlot(slot.id, 'paper', e.target.value)}
                          placeholder="Papel (Couché 300g)"
                          className="w-full px-2.5 py-1.5 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={slot.printType || ''}
                          onChange={(e) => handleUpdateItemSlot(slot.id, 'printType', e.target.value)}
                          placeholder="Impressão (4x4)"
                          className="w-full px-2.5 py-1.5 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={slot.finishing || ''}
                          onChange={(e) => handleUpdateItemSlot(slot.id, 'finishing', e.target.value)}
                          placeholder="Acabamento"
                          className="w-full px-2.5 py-1.5 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
