import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Layers, 
  Users, 
  Truck, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Search, 
  RefreshCw,
  Lock,
  ArrowLeft,
  Filter,
  Eye,
  Building2,
  Phone,
  Mail,
  Activity,
  Server,
  Database,
  HardDrive,
  MessageSquare,
  CreditCard,
  Send,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Boxes,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Tag,
  MapPin,
  Flame,
  Check,
  Copy,
  AlertCircle,
  Edit2,
  LayoutGrid,
  List,
  Calculator,
  Receipt,
  TrendingUp,
  Scissors,
  FileCheck,
  Percent,
  Scale
} from 'lucide-react';
import { 
  adminGetSuppliers, 
  adminSaveSupplier, 
  adminDeleteSupplier,
  adminGetCollaborators, 
  adminSaveCollaborator, 
  adminDeleteCollaborator,
  adminGetCustomers,
  adminSaveCategory,
  adminDeleteCategory,
  adminSaveProduct,
  adminUpdateProduct,
  adminDuplicateProduct,
  adminDeleteProduct,
  adminClearCatalog,
  adminResetSeedCatalog,
  adminGetPickupPoints,
  adminSavePickupPoint,
  adminDeletePickupPoint,
  adminGetCoupons,
  adminSaveCoupon,
  adminDeleteCoupon,
  adminUpdateOrderStatus
} from '../../lib/api';
import { Product, Category, Order, OrderStatus, PickupPoint, Coupon } from '../../types';
import { formatCurrency, formatProductionDays } from '../../lib/utils';
import { AdminProductModal } from '../admin/AdminProductModal';
import { AdminOrderModal } from '../admin/AdminOrderModal';
import { AdminKanbanBoard } from '../admin/AdminKanbanBoard';
import { AdminPickupPointsTab } from '../admin/AdminPickupPointsTab';
import { AdminCouponsTab } from '../admin/AdminCouponsTab';
import { AdminBudgetCalculatorTab } from '../admin/AdminBudgetCalculatorTab';
import { AdminRawMaterialsTab } from '../admin/AdminRawMaterialsTab';
import { AdminFinancialTab } from '../admin/AdminFinancialTab';
import { AdminQuotesTab } from '../admin/AdminQuotesTab';
import { AdminPricingTab } from '../admin/AdminPricingTab';
import { AdminFinishingsTab } from '../admin/AdminFinishingsTab';
import { AdminShippingDeclarationTab } from '../admin/AdminShippingDeclarationTab';

interface AdminERPPageProps {
  onBackToStore: () => void;
  products: Product[];
  categories: Category[];
  onRefreshCatalog: () => void;
}

type TabType = 
  | 'dashboard' 
  | 'orders' 
  | 'quotes'
  | 'budget-calculator'
  | 'raw-materials'
  | 'financial'
  | 'pricing'
  | 'products' 
  | 'finishings'
  | 'categories' 
  | 'pickup-points' 
  | 'shipping-declaration'
  | 'coupons' 
  | 'suppliers' 
  | 'collaborators' 
  | 'customers' 
  | 'system';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AdminERPPage: React.FC<AdminERPPageProps> = ({
  onBackToStore,
  products,
  categories,
  onRefreshCatalog,
}) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('silkprint_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Orders view mode
  const [ordersViewMode, setOrdersViewMode] = useState<'kanban' | 'table'>('kanban');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastState | null>(null);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productViewMode, setProductViewMode] = useState<'table' | 'grid'>('table');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Selected entities for Modals
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  // Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    category: 'papel',
    notes: '',
    city: 'São Paulo',
    state: 'SP'
  });

  // Collaborator Modal
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [collaboratorForm, setCollaboratorForm] = useState({
    name: '',
    email: '',
    role: 'pre_impressao',
    phone: ''
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'silkprint@admin2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('silkprint_admin_auth', 'true');
      setAuthError(false);
      showToast('Acesso administrativo autenticado com sucesso!');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('silkprint_admin_auth');
    setPasswordInput('');
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const json = await ordersRes.json();
        setOrders(json.data || []);
      }

      // 2. Suppliers
      const supRes = await adminGetSuppliers();
      if (supRes?.success) setSuppliers(supRes.data || []);

      // 3. Collaborators
      const colRes = await adminGetCollaborators();
      if (colRes?.success) setCollaborators(colRes.data || []);

      // 4. Customers
      const custRes = await adminGetCustomers();
      if (custRes?.success) setCustomers(custRes.data || []);

      // 5. Pickup Points
      const pickRes = await adminGetPickupPoints();
      if (pickRes?.success) setPickupPoints(pickRes.data || []);

      // 6. Coupons
      const coupRes = await adminGetCoupons();
      if (coupRes?.success) setCoupons(coupRes.data || []);

      // 7. System Status
      const statusRes = await fetch('/api/admin/system-status');
      if (statusRes.ok) {
        const json = await statusRes.json();
        setSystemStatus(json.data || null);
      }
    } catch (err) {
      console.warn('Admin load data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Product Operations
  const handleOpenNewProduct = () => {
    setSelectedProductForEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setSelectedProductForEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (selectedProductForEdit) {
        const res = await adminUpdateProduct(selectedProductForEdit.id, productData);
        if (res.success) {
          showToast(`Produto "${productData.name}" atualizado com sucesso!`);
        } else {
          showToast('Erro ao atualizar produto.', 'error');
        }
      } else {
        const res = await adminSaveProduct(productData);
        if (res.success) {
          showToast(`Produto "${productData.name}" cadastrado com sucesso!`);
        } else {
          showToast('Erro ao cadastrar produto.', 'error');
        }
      }
      onRefreshCatalog();
      loadData();
    } catch (err) {
      showToast('Falha na comunicação com o banco de dados.', 'error');
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    try {
      const res = await adminDuplicateProduct(prod.id);
      if (res.success) {
        showToast(`Produto "${prod.name}" duplicado com sucesso!`);
        onRefreshCatalog();
        loadData();
      } else {
        showToast('Erro ao duplicar produto.', 'error');
      }
    } catch (err) {
      showToast('Falha ao duplicar produto.', 'error');
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${prod.name}" do catálogo?`)) return;
    try {
      const res = await adminDeleteProduct(prod.id);
      if (res.success) {
        showToast(`Produto "${prod.name}" removido com sucesso.`);
        onRefreshCatalog();
        loadData();
      } else {
        showToast('Erro ao remover produto.', 'error');
      }
    } catch (err) {
      showToast('Falha ao excluir produto.', 'error');
    }
  };

  const handleClearCatalog = async () => {
    const confirmation = prompt(
      'ATENÇÃO: Isso irá apagar TODOS os produtos e categorias cadastrados para você começar o cadastro do zero.\n\nPara confirmar, digite LIMPAR abaixo:'
    );
    if (confirmation !== 'LIMPAR') return;

    try {
      const res = await adminClearCatalog();
      if (res.success) {
        showToast('Catálogo zerado com sucesso! Agora você pode cadastrar seus próprios produtos.', 'info');
        onRefreshCatalog();
        loadData();
      }
    } catch (err) {
      showToast('Erro ao limpar catálogo.', 'error');
    }
  };

  const handleResetSeedCatalog = async () => {
    if (!confirm('Deseja restaurar o catálogo modelo com os 8 produtos e especificações da gráfica?')) return;
    try {
      const res = await adminResetSeedCatalog();
      if (res.success) {
        showToast('Catálogo padrão restaurado com sucesso!');
        onRefreshCatalog();
        loadData();
      }
    } catch (err) {
      showToast('Erro ao restaurar catálogo.', 'error');
    }
  };

  // Order Operations
  const handleSelectOrder = (order: Order) => {
    setSelectedOrderForView(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrderForView && selectedOrderForView.id === orderId) {
        setSelectedOrderForView(prev => prev ? { ...prev, status: newStatus } : null);
      }
      showToast(`Ordem de serviço #${orderId} atualizada.`);
    } catch (err) {
      showToast('Erro ao atualizar status do pedido.', 'error');
    }
  };

  // Pickup Points Operations
  const handleSavePickupPoint = async (point: Partial<PickupPoint>) => {
    try {
      const res = await adminSavePickupPoint(point);
      if (res.success) {
        showToast('Balcão de retirada salvo com sucesso!');
        loadData();
      }
    } catch (err) {
      showToast('Erro ao salvar balcão.', 'error');
    }
  };

  const handleDeletePickupPoint = async (id: string) => {
    try {
      setPickupPoints(prev => prev.filter(p => p.id !== id));
      const res = await adminDeletePickupPoint(id);
      if (res.success) {
        showToast('Balcão de retirada removido com sucesso!');
        loadData();
      } else {
        showToast('Erro ao remover balcão.', 'error');
        loadData();
      }
    } catch (err) {
      showToast('Erro ao remover balcão.', 'error');
      loadData();
    }
  };

  // Coupon Operations
  const handleSaveCoupon = async (coupon: Partial<Coupon>) => {
    try {
      const res = await adminSaveCoupon(coupon);
      if (res.success) {
        showToast('Cupom de desconto salvo com sucesso!');
        loadData();
      }
    } catch (err) {
      showToast('Erro ao salvar cupom.', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      setCoupons(prev => prev.filter(c => c.id !== id && c.code !== id));
      const res = await adminDeleteCoupon(id);
      if (res.success) {
        showToast('Cupom removido com sucesso!');
        loadData();
      } else {
        showToast('Erro ao remover cupom.', 'error');
        loadData();
      }
    } catch (err) {
      showToast('Erro ao remover cupom.', 'error');
      loadData();
    }
  };

  // Category Operations
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await adminSaveCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        icon: newCatIcon
      });
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      showToast(`Categoria "${newCatName}" salva com sucesso!`);
      onRefreshCatalog();
      loadData();
    } catch (err) {
      showToast('Erro ao salvar categoria.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir a categoria "${name}"?`)) return;
    try {
      await adminDeleteCategory(id);
      showToast(`Categoria "${name}" removida.`);
      onRefreshCatalog();
      loadData();
    } catch (err) {
      showToast('Erro ao remover categoria.', 'error');
    }
  };

  // Supplier Operations
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;
    try {
      await adminSaveSupplier(supplierForm);
      setIsSupplierModalOpen(false);
      setSupplierForm({
        name: '',
        tradeName: '',
        cnpj: '',
        email: '',
        phone: '',
        category: 'papel',
        notes: '',
        city: 'São Paulo',
        state: 'SP'
      });
      showToast('Fornecedor cadastrado com sucesso!');
      loadData();
    } catch (err) {
      showToast('Erro ao cadastrar fornecedor.', 'error');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Deseja excluir este fornecedor?')) return;
    try {
      await adminDeleteSupplier(id);
      showToast('Fornecedor removido.');
      loadData();
    } catch (err) {
      showToast('Erro ao remover fornecedor.', 'error');
    }
  };

  // Collaborator Operations
  const handleSaveCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorForm.name.trim() || !collaboratorForm.email.trim()) return;
    try {
      await adminSaveCollaborator(collaboratorForm);
      setIsCollaboratorModalOpen(false);
      setCollaboratorForm({
        name: '',
        email: '',
        role: 'pre_impressao',
        phone: ''
      });
      showToast('Colaborador cadastrado com sucesso!');
      loadData();
    } catch (err) {
      showToast('Erro ao cadastrar colaborador.', 'error');
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!confirm('Deseja desativar este colaborador?')) return;
    try {
      await adminDeleteCollaborator(id);
      showToast('Colaborador desativado.');
      loadData();
    } catch (err) {
      showToast('Erro ao desativar colaborador.', 'error');
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCat = productCategoryFilter === 'ALL' || p.categorySlug === productCategoryFilter || p.category === productCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer?.phone || '').includes(orderSearch);
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.payment?.total || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'entregue' && o.status !== 'cancelado').length;
    const printingOrders = orders.filter(o => o.status === 'impressao' || o.status === 'pre_impressao').length;
    return {
      totalRevenue,
      activeOrders,
      printingOrders,
      productsCount: products.length,
      customersCount: customers.length,
      pickupCount: pickupPoints.length
    };
  }, [orders, products, customers, pickupPoints]);

  // ---------------------------------------------------------------------------
  // AUTHENTICATION SCREEN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white font-heading tracking-tight">
              Silk Print ERP Industrial
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gestão Integrada de Produção, Catálogo Gráfico & O.S.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Senha de Administrador do Parque Fabril
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="Digite a senha de acesso..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
              />
              {authError && (
                <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Senha incorreta. Verifique o arquivo .env
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-cyan-600/25 active:scale-[0.98] transition-all"
            >
              Entrar no Painel ERP
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={onBackToStore}
              className="flex items-center gap-1.5 text-cyan-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a Loja
            </button>
            <span className="font-mono text-[11px] text-slate-600">v2.4.0 • PostgreSQL</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN ERP INTERFACE
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-emerald-950/50' 
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-300 border-rose-800 shadow-rose-950/50'
              : 'bg-cyan-950 text-cyan-300 border-cyan-800 shadow-cyan-950/50'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Recolher Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-cyan-600/30">
              SP
            </div>
            <div>
              <h1 className="font-heading font-black text-sm text-white tracking-tight leading-none flex items-center gap-1.5">
                Silk Print <span className="text-cyan-400 font-mono text-xs font-bold">ERP</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">
                Parque Gráfico & Gestão
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill & Store Return */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${systemStatus?.database?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[11px] text-slate-300">
              {systemStatus?.database?.connected ? 'PostgreSQL Ativo' : 'Banco Conectando'}
            </span>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Recarregar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onBackToStore}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Loja Virtual</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Sair do Painel"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } hidden lg:flex flex-col bg-slate-900/40 border-r border-slate-800 transition-all duration-200 shrink-0 select-none`}>
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Painel Geral</span>}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Produção & Engenharia
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Ordens de Serviço</span>}
              </div>
              {!isSidebarCollapsed && orders.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'orders' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-cyan-400'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quotes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'quotes'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Orçamentos & Propostas</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('budget-calculator')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'budget-calculator'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Calculadora Gráfica</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('raw-materials')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'raw-materials'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Almoxarifado & Insumos</span>}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Finanças & Resultados
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('financial')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'financial'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Financeiro & DRE</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'pricing'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Percent className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Engenharia de Preços</span>}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Catálogo & Vendas
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Catálogo Gráfico</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'products' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {products.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finishings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'finishings'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Scissors className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Tabela de Acabamentos</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'categories'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Categorias</span>}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Logística & Promoção
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('pickup-points')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'pickup-points'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Balcões de Retirada</span>}
              </div>
              {!isSidebarCollapsed && pickupPoints.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'pickup-points' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {pickupPoints.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shipping-declaration')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'shipping-declaration'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Declaração de Conteúdo</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'coupons'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Cupons de Desconto</span>}
              </div>
              {!isSidebarCollapsed && coupons.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'coupons' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-emerald-400'
                }`}>
                  {coupons.length}
                </span>
              )}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Administração & Parque
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('suppliers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Fornecedores</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collaborators')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'collaborators'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Equipe & Operadores</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'customers'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Clientes Cadastrados</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'system'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Diagnóstico VPS</span>}
            </button>
          </div>

          <div className="p-3 border-t border-slate-800/80 text-center">
            {!isSidebarCollapsed ? (
              <div className="text-[10px] text-slate-500 font-mono">
                PostgreSQL + MinIO S3 • Online
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto" />
            )}
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="w-64 bg-slate-900 p-4 border-r border-slate-800 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                  <span className="font-bold text-sm text-white">Menu ERP</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                {(['dashboard', 'orders', 'quotes', 'budget-calculator', 'raw-materials', 'financial', 'pricing', 'products', 'finishings', 'categories', 'pickup-points', 'shipping-declaration', 'coupons', 'suppliers', 'collaborators', 'customers', 'system'] as TabType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveTab(t);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold capitalize ${
                      activeTab === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* ================================================================= */}
          {/* TAB: DASHBOARD */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white font-heading tracking-tight">
                  Painel de Controle do Parque Gráfico
                </h2>
                <p className="text-xs text-slate-400">
                  Visão consolidada de pedidos, produção industrial, catálogo e faturamento
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">Faturamento em Pedidos</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {formatCurrency(metrics.totalRevenue)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{orders.length} ordens de serviço</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">Esteira em Produção</div>
                    <div className="text-2xl font-black text-cyan-400 font-mono">
                      {metrics.activeOrders}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{metrics.printingOrders} em CTP / Impressora</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">Catálogo de Produtos</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {metrics.productsCount}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{categories.length} categorias ativas</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">Rede de Balcões</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {metrics.pickupCount}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Pontos de entrega físicos</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800">
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Ações Rápidas de Operação
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenNewProduct}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Novo Produto</div>
                    <div className="text-[10px] text-slate-400">Cadastrar no catálogo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('quotes')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Orçamentos & Propostas</div>
                    <div className="text-[10px] text-slate-400">Criar cotação comercial</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('orders');
                      setOrdersViewMode('kanban');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Esteira Kanban</div>
                    <div className="text-[10px] text-slate-400">Acompanhar O.S. ao vivo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('pricing')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Precificação & Markups</div>
                    <div className="text-[10px] text-slate-400">Margem alvo & simulador</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('budget-calculator')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Calculadora</div>
                    <div className="text-[10px] text-slate-400">Orçamento de custo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('raw-materials')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Almoxarifado</div>
                    <div className="text-[10px] text-slate-400">Papéis & Chapas CTP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('financial')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">DRE & Caixa</div>
                    <div className="text-[10px] text-slate-400">Margens & Balanço</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('shipping-declaration')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white">Declaração Postal</div>
                    <div className="text-[10px] text-slate-400">Correios e Despacho</div>
                  </button>
                </div>
              </div>

              {/* Recent Orders in Dashboard */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> Últimas Ordens de Serviço Emitidas
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Ver todas as ordens <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Nenhuma ordem de serviço registrada até o momento. Quando um cliente realizar uma compra na loja, ela aparecerá aqui automaticamente.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-3">O.S.</th>
                          <th className="p-3">Cliente</th>
                          <th className="p-3">Itens</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-mono font-bold text-cyan-400">#{ord.id}</td>
                            <td className="p-3 font-bold text-white">{ord.customer?.name}</td>
                            <td className="p-3 text-slate-400">
                              {ord.items?.[0]?.productName || 'Itens'} ({ord.items?.length || 1})
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {formatCurrency(ord.payment?.total || 0)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleSelectOrder(ord)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                              >
                                Ver O.S.
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ORDERS & KANBAN */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" /> Ordens de Serviço & Esteira Gráfica
                  </h2>
                  <p className="text-xs text-slate-400">
                    Acompanhe a produção desde o CTP até o acabamento e entrega
                  </p>
                </div>

                {/* Toggle Kanban vs Table */}
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setOrdersViewMode('kanban')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      ordersViewMode === 'kanban'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Esteira Kanban
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersViewMode('table')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      ordersViewMode === 'table'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tabela Detalhada
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar por O.S., nome do cliente ou WhatsApp..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">Todos os Status</option>
                    <option value="aprovado">Aguardando Produção</option>
                    <option value="pre_impressao">Pré-Impressão / CTP</option>
                    <option value="impressao">Em Impressão</option>
                    <option value="acabamento">Acabamento & Refile</option>
                    <option value="embalado">Pronto / Expedição</option>
                    <option value="entregue">Finalizado / Entregue</option>
                    <option value="pendente_pagamento">Pendente Pagamento</option>
                  </select>
                </div>
              </div>

              {/* View Rendering */}
              {ordersViewMode === 'kanban' ? (
                <AdminKanbanBoard
                  orders={filteredOrders}
                  onSelectOrder={handleSelectOrder}
                  onAdvanceStatus={handleUpdateOrderStatus}
                />
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">O.S.</th>
                        <th className="p-3.5">Data / Hora</th>
                        <th className="p-3.5">Cliente</th>
                        <th className="p-3.5">Entrega</th>
                        <th className="p-3.5">Itens</th>
                        <th className="p-3.5">Total</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            Nenhuma ordem de serviço encontrada.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-800/40">
                            <td className="p-3.5 font-mono font-bold text-cyan-400">#{ord.id}</td>
                            <td className="p-3.5 text-slate-400">
                              {new Date(ord.timestamp).toLocaleDateString('pt-BR')} {new Date(ord.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-white">{ord.customer?.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{ord.customer?.phone}</div>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              {ord.shipping?.type === 'pickup' ? (
                                <span className="text-cyan-400 font-bold flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Balcão
                                </span>
                              ) : (
                                <span className="text-slate-400">Entrega</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-300 font-medium">
                              {ord.items?.length || 1} produto(s)
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              {formatCurrency(ord.payment?.total || 0)}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleSelectOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
                              >
                                Abrir O.S.
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: QUOTES & PROPOSALS */}
          {/* ================================================================= */}
          {activeTab === 'quotes' && (
            <AdminQuotesTab />
          )}

          {/* ================================================================= */}
          {/* TAB: BUDGET CALCULATOR */}
          {/* ================================================================= */}
          {activeTab === 'budget-calculator' && (
            <AdminBudgetCalculatorTab />
          )}

          {/* ================================================================= */}
          {/* TAB: RAW MATERIALS & INVENTORY */}
          {/* ================================================================= */}
          {activeTab === 'raw-materials' && (
            <AdminRawMaterialsTab />
          )}

          {/* ================================================================= */}
          {/* TAB: FINANCIAL & DRE */}
          {/* ================================================================= */}
          {activeTab === 'financial' && (
            <AdminFinancialTab orders={orders} />
          )}

          {/* ================================================================= */}
          {/* TAB: PRICING & MARKUPS */}
          {/* ================================================================= */}
          {activeTab === 'pricing' && (
            <AdminPricingTab />
          )}

          {/* ================================================================= */}
          {/* TAB: PRODUCTS & CATALOG MANAGEMENT */}
          {/* ================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Header with Catalog Control Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-400" /> Catálogo de Produtos Gráficos
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gerencie especificações técnicas, tabelas de preços por tiragem, papéis e acabamentos
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Novo Produto
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSeedCatalog}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all border border-slate-800"
                    title="Restaurar o catálogo com os produtos padrão da gráfica"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>

              {/* Seed Data Notice Banner */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3 text-xs">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-cyan-300 font-bold block">Gestão do Catálogo da Gráfica:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    Você pode <strong>editar</strong> qualquer produto abaixo clicando no botão "Editar" (para alterar preços de tiragem, papéis e prazos em dias úteis), <strong>duplicar</strong> para criar novas variações em segundos ou gerenciar itens individualmente.
                  </p>
                </div>
              </div>

              {/* Search, Category Filter & View Mode Switcher */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar produto por nome, tiragem ou categoria..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('ALL')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        productCategoryFilter === 'ALL'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      Todas Categorias ({products.length})
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id || c.slug}
                        type="button"
                        onClick={() => setProductCategoryFilter(c.slug)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                          productCategoryFilter === c.slug
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View switcher: Tabela de Cards vs Grade */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setProductViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      productViewMode === 'table'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Exibir como Tabela de Cards Modernos"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Cards em Lista</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      productViewMode === 'grid'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Exibir como Grade de Imagens"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grade</span>
                  </button>
                </div>
              </div>

              {/* Products Rendering: Modern Table-Cards vs Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800">
                  <p className="text-base font-bold text-white mb-2">Nenhum produto gráfico encontrado</p>
                  <p className="text-xs text-slate-400 mb-4">O catálogo está vazio ou nenhum item corresponde ao filtro digitado.</p>
                  <button
                    type="button"
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Primeiro Produto
                  </button>
                </div>
              ) : productViewMode === 'table' ? (
                /* LAYOUT: CARDS EM LISTA COMO TABELA MODERNA */
                <div className="space-y-3">
                  {/* Desktop header bar for table-card alignment */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="lg:col-span-5">Produto & Categoria</div>
                    <div className="lg:col-span-3">Especificações & Prazo</div>
                    <div className="lg:col-span-2 text-right">Preço Base</div>
                    <div className="lg:col-span-2 text-right">Ações Rápidas</div>
                  </div>

                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id || prod.slug}
                      className="rounded-2xl bg-slate-900/60 hover:bg-slate-900/95 border border-slate-800/90 hover:border-cyan-700/60 p-3 sm:p-4 transition-all flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center group shadow-md"
                    >
                      {/* Col 1: Thumbnail & Identification (5 cols) */}
                      <div className="lg:col-span-5 flex items-center gap-3.5 min-w-0 w-full">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {prod.popular && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-pink-950/90 text-pink-400 border border-pink-800 text-[9px] font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Destaque
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-black uppercase">
                              {prod.category}
                            </span>
                            {prod.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                            {prod.shortDescription || prod.description}
                          </p>
                        </div>
                      </div>

                      {/* Col 2: Technical Specs (3 cols) */}
                      <div className="lg:col-span-3 w-full flex flex-wrap lg:flex-col gap-2 lg:gap-1 text-[11px] text-slate-400 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-medium">Formato:</span>
                          <span className="text-slate-200 font-mono font-bold">{prod.defaultFormat || '9x5 cm'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-200 font-mono font-bold">{formatProductionDays(prod.productionTimeHours)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-medium">Tiragens:</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {prod.quantities?.length || 1} cadastradas
                          </span>
                        </div>
                      </div>

                      {/* Col 3: Price (2 cols) */}
                      <div className="lg:col-span-2 w-full flex items-center justify-between lg:block lg:text-right pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mb-1">
                          A partir de
                        </span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                          {formatCurrency(prod.basePrice)}
                        </span>
                      </div>

                      {/* Col 4: Actions (2 cols) */}
                      <div className="lg:col-span-2 w-full flex items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-bold transition-all flex items-center gap-1 border border-slate-700/60 hover:border-cyan-500 shadow-sm active:scale-95"
                          title="Editar Produto e Tiragens"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateProduct(prod)}
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700/50"
                          title="Duplicar Produto"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors border border-slate-700/50 hover:border-rose-800/50"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <a
                          href={`/produto/${prod.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                          title="Visualizar na loja virtual (nova aba)"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* LAYOUT: GRADE VISUAL DE CARDS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id || prod.slug}
                      className="rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col overflow-hidden group shadow-lg"
                    >
                      {/* Thumbnail & Badges */}
                      <div className="h-44 bg-slate-950 relative overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-slate-800 text-[10px] font-bold">
                            {prod.category}
                          </span>
                          {prod.badge && (
                            <span className="px-2.5 py-1 rounded-xl bg-indigo-950/90 backdrop-blur-md text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                              {prod.badge}
                            </span>
                          )}
                        </div>

                        {prod.popular && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-pink-950 text-pink-400 border border-pink-800 text-[10px] font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Destaque
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {prod.shortDescription || prod.description}
                          </p>

                          {/* Technical chips */}
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
                            <div>
                              Prazo: <span className="text-white font-mono">{formatProductionDays(prod.productionTimeHours)}</span>
                            </div>
                            <div>
                              Formato: <span className="text-white font-mono">{prod.defaultFormat || '9x5 cm'}</span>
                            </div>
                            <div>
                              Tiragens: <span className="text-cyan-400 font-mono">{prod.quantities?.length || 1} cadastradas</span>
                            </div>
                            <div>
                              Papéis: <span className="text-slate-300 font-mono">{prod.papers?.length || 1} opções</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-tight">A partir de</span>
                            <span className="text-base font-black text-emerald-400 font-mono">
                              {formatCurrency(prod.basePrice)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
                              title="Editar Produto"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                              title="Duplicar Produto"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: FINISHINGS */}
          {/* ================================================================= */}
          {activeTab === 'finishings' && (
            <AdminFinishingsTab />
          )}

          {/* ================================================================= */}
          {/* TAB: CATEGORIES */}
          {/* ================================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" /> Categorias de Produtos Gráficos
                  </h2>
                  <p className="text-xs text-slate-400">
                    Estruture o menu de navegação e agrupamento da sua loja gráfica
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30"
                >
                  <Plus className="w-4 h-4" /> Nova Categoria
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => {
                  const productCount = products.filter(p => p.categorySlug === c.slug || p.category === c.name).length;

                  return (
                    <div
                      key={c.id || c.slug}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id || c.slug, c.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="font-bold text-base text-white mb-1">{c.name}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {c.description || 'Categoria de materiais gráficos promocionais e institucionais.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Slug: <code className="text-cyan-400 font-mono">{c.slug}</code></span>
                        <span className="font-bold text-white">{productCount} produtos</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Criar Categoria */}
              {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4 text-slate-100">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-bold text-base text-white">Cadastrar Nova Categoria</h3>
                      <button onClick={() => setIsCategoryModalOpen(false)}>
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Categoria *</label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Ex: Rótulos Adesivos"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="Breve descrição dos materiais..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
                        >
                          Salvar Categoria
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: PICKUP POINTS */}
          {/* ================================================================= */}
          {activeTab === 'pickup-points' && (
            <AdminPickupPointsTab
              pickupPoints={pickupPoints}
              onSavePickupPoint={handleSavePickupPoint}
              onDeletePickupPoint={handleDeletePickupPoint}
            />
          )}

          {/* ================================================================= */}
          {/* TAB: SHIPPING DECLARATION */}
          {/* ================================================================= */}
          {activeTab === 'shipping-declaration' && (
            <AdminShippingDeclarationTab orders={orders} />
          )}

          {/* ================================================================= */}
          {/* TAB: COUPONS */}
          {/* ================================================================= */}
          {activeTab === 'coupons' && (
            <AdminCouponsTab
              coupons={coupons}
              onSaveCoupon={handleSaveCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {/* ================================================================= */}
          {/* TAB: SUPPLIERS */}
          {/* ================================================================= */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                    <Truck className="w-5 h-5 text-cyan-400" /> Fornecedores de Insumos & Papel
                  </h2>
                  <p className="text-xs text-slate-400">
                    Distribuidores de papel Couché/Offset, tintas CMYK, chapas térmicas CTP e vernizes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Fornecedor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                    Nenhum fornecedor cadastrado.
                  </div>
                ) : (
                  suppliers.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-sm text-white">{s.name}</h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplier(s.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {s.cnpj && <div className="text-[11px] text-slate-400 font-mono mb-2">CNPJ: {s.cnpj}</div>}
                        <div className="text-xs text-slate-300 space-y-1">
                          <div>Tel: <span className="font-mono">{s.phone}</span></div>
                          <div>E-mail: <span>{s.email}</span></div>
                          {s.city && <div>Local: <span>{s.city}/{s.state}</span></div>}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-800 mt-3 text-[11px] text-cyan-400 font-bold uppercase">
                        Categoria: {s.category}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Criar Fornecedor */}
              {isSupplierModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <h3 className="font-bold text-base text-white">Cadastrar Fornecedor</h3>
                      <button onClick={() => setIsSupplierModalOpen(false)}>
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveSupplier} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Razão Social / Nome *</label>
                        <input
                          type="text"
                          required
                          value={supplierForm.name}
                          onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                          placeholder="Ex: Suzano Papel e Celulose S.A."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">CNPJ</label>
                          <input
                            type="text"
                            value={supplierForm.cnpj}
                            onChange={(e) => setSupplierForm({ ...supplierForm, cnpj: e.target.value })}
                            placeholder="00.000.000/0001-00"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Insumo Principal</label>
                          <select
                            value={supplierForm.category}
                            onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="papel">Papel Couché / Offset</option>
                            <option value="tinta">Tintas CMYK / Pantone</option>
                            <option value="chapas_ctp">Chapas Térmicas CTP</option>
                            <option value="acabamentos">Vernizes / Laminação</option>
                            <option value="embalagens">Caixas e Embalagens</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Telefone</label>
                          <input
                            type="text"
                            value={supplierForm.phone}
                            onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                            placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">E-mail</label>
                          <input
                            type="email"
                            value={supplierForm.email}
                            onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                            placeholder="contato@empresa.com"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSupplierModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                        >
                          Salvar Fornecedor
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: COLLABORATORS */}
          {/* ================================================================= */}
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-cyan-400" /> Operadores & Equipe de Produção
                  </h2>
                  <p className="text-xs text-slate-400">
                    Responsáveis pelos setores de pré-impressão CTP, impressão offset e acabamento
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCollaboratorModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Operador
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm text-white">{c.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollaborator(c.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mb-1">{c.email}</div>
                      {c.phone && <div className="text-xs text-slate-400 font-mono">Tel: {c.phone}</div>}
                    </div>
                    <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                        {c.role?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">● Ativo</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Criar Colaborador */}
              {isCollaboratorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <h3 className="font-bold text-base text-white">Cadastrar Colaborador</h3>
                      <button onClick={() => setIsCollaboratorModalOpen(false)}>
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCollaborator} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={collaboratorForm.name}
                          onChange={(e) => setCollaboratorForm({ ...collaboratorForm, name: e.target.value })}
                          placeholder="Ex: Carlos Ferreira"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">E-mail de Acesso *</label>
                        <input
                          type="email"
                          required
                          value={collaboratorForm.email}
                          onChange={(e) => setCollaboratorForm({ ...collaboratorForm, email: e.target.value })}
                          placeholder="carlos@silkprint.com.br"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Função / Setor</label>
                          <select
                            value={collaboratorForm.role}
                            onChange={(e) => setCollaboratorForm({ ...collaboratorForm, role: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="pre_impressao">Pré-Impressão / CTP</option>
                            <option value="impressor">Impressão Offset / Digital</option>
                            <option value="acabamento">Acabamento & Refile</option>
                            <option value="expedicao">Expedição & Pacote</option>
                            <option value="gerente">Gerente de Produção</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Telefone</label>
                          <input
                            type="text"
                            value={collaboratorForm.phone}
                            onChange={(e) => setCollaboratorForm({ ...collaboratorForm, phone: e.target.value })}
                            placeholder="(11) 98888-8888"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCollaboratorModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                        >
                          Cadastrar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: CUSTOMERS */}
          {/* ================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" /> Clientes Cadastrados
                </h2>
                <p className="text-xs text-slate-400">
                  Base de clientes que já emitiram ordens de serviço ou cadastraram pedidos
                </p>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Contato</th>
                      <th className="p-3.5">Documento</th>
                      <th className="p-3.5">Pedidos Realizados</th>
                      <th className="p-3.5">Total Gasto</th>
                      <th className="p-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Nenhum cliente com pedidos concluídos ainda.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => {
                        const cleanPhone = (c.phone || '').replace(/\D/g, '');
                        return (
                          <tr key={c.id || c.email} className="hover:bg-slate-800/40">
                            <td className="p-3.5">
                              <div className="font-bold text-white">{c.name}</div>
                              {c.companyName && <div className="text-[11px] text-slate-400">{c.companyName}</div>}
                            </td>
                            <td className="p-3.5">
                              <div className="text-slate-300">{c.email}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-300">
                              {c.document || 'Não informado'}
                            </td>
                            <td className="p-3.5 font-bold text-white font-mono">
                              {c.totalOrders || 1} pedido(s)
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              {formatCurrency(c.totalSpent || 0)}
                            </td>
                            <td className="p-3.5 text-right">
                              {cleanPhone ? (
                                <a
                                  href={`https://wa.me/55${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 font-bold inline-flex items-center gap-1 text-[11px]"
                                >
                                  <Phone className="w-3 h-3" /> WhatsApp
                                </a>
                              ) : (
                                <span className="text-slate-600 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: SYSTEM DIAGNOSTICS */}
          {/* ================================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" /> Diagnóstico de Infraestrutura & VPS
                </h2>
                <p className="text-xs text-slate-400">
                  Verificação ao vivo das conexões com PostgreSQL, MinIO S3, Mercado Pago Pix e automação n8n
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* PostgreSQL Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">PostgreSQL</h4>
                        <div className="text-[10px] text-slate-400">Banco de Dados Relacional</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      systemStatus?.database?.connected 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {systemStatus?.database?.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Armazena todas as tabelas de pedidos, produtos, categorias, balcões e fornecedores.
                  </p>
                  {systemStatus?.database?.urlPreview && (
                    <div className="p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-400 truncate">
                      {systemStatus.database.urlPreview}
                    </div>
                  )}
                </div>

                {/* MinIO S3 Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">MinIO Storage S3</h4>
                        <div className="text-[10px] text-slate-400">Armazenamento de Artes</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      systemStatus?.minio?.connected 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {systemStatus?.minio?.connected ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bucket dedicado na VPS para upload de PDFs, TIFFs e arquivos vetoriais enviados pelos clientes.
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Bucket: <span className="text-white">{systemStatus?.minio?.bucket || 'silkprint-documents'}</span>
                  </div>
                </div>

                {/* Mercado Pago Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Mercado Pago Pix</h4>
                        <div className="text-[10px] text-slate-400">Gateway de Pagamentos</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      systemStatus?.mercadopago?.configured 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {systemStatus?.mercadopago?.configured ? 'Configurado' : 'Modo Demonstração'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gera QR Code Pix dinâmico no checkout e aprova o pagamento via Webhook instantâneo.
                  </p>
                </div>

                {/* n8n Webhook Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">n8n Automação</h4>
                        <div className="text-[10px] text-slate-400">Webhooks & Alertas WhatsApp</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      systemStatus?.n8n?.configured 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {systemStatus?.n8n?.configured ? 'Webhook Ativo' : 'Padrão'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dispara mensagens no WhatsApp do cliente a cada mudança de status na esteira gráfica.
                  </p>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================================================================= */}
      {/* MODAL: PRODUCT CREATE / EDIT */}
      {/* ================================================================= */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProductForEdit(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProductForEdit}
        categories={categories}
      />

      {/* ================================================================= */}
      {/* MODAL: ORDER SERVICE (O.S.) DETAILS & PRINT */}
      {/* ================================================================= */}
      <AdminOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrderForView(null);
        }}
        order={selectedOrderForView}
        onUpdateStatus={handleUpdateOrderStatus}
      />

    </div>
  );
};
