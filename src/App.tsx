import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  SidebarMode,
  Client,
  Order,
  OrderStatus,
  OrderMessage,
  Quote,
  QuoteItem,
  Transaction,
  CatalogProduct,
  FinishingItem,
  AccessProfile,
  UserEmployee,
} from './types';
import {
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_QUOTES,
  INITIAL_TRANSACTIONS,
  CATALOG_PRODUCTS,
} from './data/mockData';
import {
  INITIAL_ACCESS_PROFILES,
  INITIAL_EMPLOYEES,
  evaluateUserPermission,
} from './lib/permissionsEngine';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  fetchOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  addOrderMessage,
  deleteOrder,
  fetchQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchFinishings,
  createFinishing,
  updateFinishing,
  deleteFinishing,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchAccessProfiles,
  createAccessProfile,
  updateAccessProfile,
  deleteAccessProfile,
  fetchCurrentUserProfile,
  logoutApi,
  getStoredAuthToken,
} from './lib/realDataApi';

// Components
import { SidebarAdmin } from './components/SidebarAdmin';
import { SidebarGestao } from './components/SidebarGestao';
import { TopHeader } from './components/TopHeader';
import { UserSimulatorBar } from './components/UserSimulatorBar';
import { LoginScreen } from './components/screens/LoginScreen';
import { SystemSwitcherBar } from './components/SystemSwitcherBar';

// Modals
import { ModalNovaReceita } from './components/modals/ModalNovaReceita';
import { ModalNovaDespesa } from './components/modals/ModalNovaDespesa';
import { ModalNovoCliente } from './components/modals/ModalNovoCliente';
import { ModalAdicionarItem } from './components/modals/ModalAdicionarItem';
import { ModalNovoPedido } from './components/modals/ModalNovoPedido';
import { ModalUpgrade } from './components/modals/ModalUpgrade';
import { ModalTutoriais } from './components/modals/ModalTutoriais';
import { ModalCatalogoPreview } from './components/modals/ModalCatalogoPreview';
import { ModalDetalhesPedido } from './components/modals/ModalDetalhesPedido';
import { ModalDetalhesCliente } from './components/modals/ModalDetalhesCliente';
import { ModalDetalhesProduto } from './components/modals/ModalDetalhesProduto';
import { ModalDetalhesTransacao } from './components/modals/ModalDetalhesTransacao';
import { ModalWhatsAppChat } from './components/modals/ModalWhatsAppChat';
import { ModalGerenciarDadosReais } from './components/modals/ModalGerenciarDadosReais';

// Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { GestaoVisaoGeralScreen } from './components/screens/GestaoVisaoGeralScreen';
import { NovoOrcamentoScreen } from './components/screens/NovoOrcamentoScreen';
import { ClientesScreen } from './components/screens/ClientesScreen';
import { OrcamentosListScreen } from './components/screens/OrcamentosListScreen';
import { PedidosListScreen } from './components/screens/PedidosListScreen';
import { FinanceiroScreen } from './components/screens/FinanceiroScreen';
import { ProdutosScreen } from './components/screens/ProdutosScreen';
import { CatalogoEcommerceProdutosScreen } from './components/screens/CatalogoEcommerceProdutosScreen';
import { CategoriasScreen } from './components/screens/CategoriasScreen';
import { AparenciaScreen } from './components/screens/AparenciaScreen';
import { ConfiguracoesScreen } from './components/screens/ConfiguracoesScreen';
import { PrecificacaoScreen } from './components/screens/PrecificacaoScreen';
import { MetricasScreen } from './components/screens/MetricasScreen';
import { ExportarScreen } from './components/screens/ExportarScreen';
import { PagamentosScreen } from './components/screens/PagamentosScreen';
import { IntegracoesScreen } from './components/screens/IntegracoesScreen';
import { FuncionariosScreen } from './components/screens/FuncionariosScreen';
import { PerfisAcessoScreen } from './components/screens/PerfisAcessoScreen';
import { AcabamentosScreen } from './components/screens/AcabamentosScreen';
import { AgendaScreen } from './components/screens/AgendaScreen';
import { PedidosOnlineScreen } from './components/screens/PedidosOnlineScreen';
import { DeclaracaoConteudoScreen } from './components/screens/DeclaracaoConteudoScreen';
import { LogisticaScreen } from './components/screens/LogisticaScreen';
import { RelatoriosScreen } from './components/screens/RelatoriosScreen';
import { MyAccountScreen } from './components/screens/MyAccountScreen';
import { EcommerceStorefrontScreen } from './components/screens/EcommerceStorefrontScreen';

const INITIAL_FINISHINGS: FinishingItem[] = [
  // Confecção & Têxtil
  {
    id: 'acab-dobra-embalagem',
    name: 'Dobra e Embalagem Individual em Saquinho',
    category: 'Embalagem & Apresentação',
    linkGroup: 'textil',
    pricingType: 'unidade',
    price: 1.5,
    cost: 0.4,
    unit: 'un',
    extraDays: 0,
    description: 'Peça passada, dobrada e embalada em saquinho transparente individual com fita adesiva.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-tag-personalizada',
    name: 'Aplicação de Tag com Cordão e Trava',
    category: 'Identificação',
    linkGroup: 'textil',
    pricingType: 'unidade',
    price: 1.2,
    cost: 0.35,
    unit: 'un',
    extraDays: 0,
    description: 'Tag personalizada com cordão e trava de segurança na gola da camiseta.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-estampa-costas',
    name: 'Estampa Costas Adicional (A3 DTF / Silk)',
    category: 'Impressão Adicional',
    linkGroup: 'textil',
    pricingType: 'unidade',
    price: 12.0,
    cost: 4.5,
    unit: 'un',
    extraDays: 1,
    description: 'Aplicação de arte adicional nas costas formato até 29x42cm.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-estampa-manga',
    name: 'Estampa na Manga Adicional (10x10cm)',
    category: 'Impressão Adicional',
    linkGroup: 'textil',
    pricingType: 'unidade',
    price: 6.0,
    cost: 2.0,
    unit: 'un',
    extraDays: 1,
    description: 'Aplicação de logotipo na manga direita ou esquerda.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-etiqueta-gola',
    name: 'Etiqueta Termocolante Interna de Gola',
    category: 'Identificação',
    linkGroup: 'textil',
    pricingType: 'unidade',
    price: 1.8,
    cost: 0.5,
    unit: 'un',
    extraDays: 1,
    description: 'Estampa interna personalizada com tamanho e instruções de lavagem.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-matriz-silk',
    name: 'Gravação de Matriz / Tela Silk Screen (Setup Fixo)',
    category: 'Setup de Impressão',
    linkGroup: 'textil',
    pricingType: 'fixo',
    price: 45.0,
    cost: 15.0,
    unit: 'serviço',
    extraDays: 1,
    description: 'Taxa única de fotolito e revelação da matriz serigráfica por cor.',
    active: true,
    isActive: true,
  },
  // Papelaria & Gráfica
  {
    id: 'acab-1',
    name: 'Laminação Fosca Bopp',
    category: 'Plastificação / Laminação',
    linkGroup: 'papelaria',
    pricingType: 'unidade',
    price: 0.45,
    cost: 0.15,
    unit: 'un',
    extraDays: 1,
    description: 'Película aveludada antirreflexo de alto padrão para impressos.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-2',
    name: 'Verniz Localizado UV',
    category: 'Verniz',
    linkGroup: 'papelaria',
    pricingType: 'unidade',
    price: 0.85,
    cost: 0.25,
    unit: 'un',
    extraDays: 2,
    description: 'Máscara de verniz com alto brilho em áreas selecionadas da arte.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-3',
    name: 'Corte Especial / Vinco',
    category: 'Acabamento Gráfico',
    linkGroup: 'papelaria',
    pricingType: 'fixo',
    price: 35.0,
    cost: 10.0,
    unit: 'serviço',
    extraDays: 1,
    description: 'Faca especial para cantos arredondados, dobras ou formatos especiais.',
    active: true,
    isActive: true,
  },
  // Comunicação Visual
  {
    id: 'acab-4',
    name: 'Ilhós com Bainha Reforçada',
    category: 'Comunicação Visual',
    linkGroup: 'comunicacao_visual',
    pricingType: 'unidade',
    price: 2.5,
    cost: 0.8,
    unit: 'un',
    extraDays: 1,
    description: 'Ilhós metálicos antiferrugem aplicados com reforço térmico em lonas.',
    active: true,
    isActive: true,
  },
  {
    id: 'acab-madeira-corda',
    name: 'Madeira e Corda para Banner',
    category: 'Montagem de Banner',
    linkGroup: 'comunicacao_visual',
    pricingType: 'unidade',
    price: 15.0,
    cost: 5.0,
    unit: 'un',
    extraDays: 1,
    description: 'Bastão superior e inferior com ponteiras plásticas e cordão.',
    active: true,
    isActive: true,
  },
];

export default function App() {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Active System State: 'store' (public e-commerce at /) or 'erp' (internal management at /erp)
  const [activeSystem, setActiveSystem] = useState<'store' | 'erp'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/erp')) {
        return 'erp';
      }
    }
    return 'store';
  });

  // Navigation state
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('admin');
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data state (Initialized clean for production)
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [finishings, setFinishings] = useState<FinishingItem[]>([]);

  // Access Control & Multi-Profile State
  const [accessProfiles, setAccessProfiles] = useState<AccessProfile[]>(INITIAL_ACCESS_PROFILES);
  const [employees, setEmployees] = useState<UserEmployee[]>(INITIAL_EMPLOYEES);
  const [activeUser, setActiveUser] = useState<UserEmployee>(INITIAL_EMPLOYEES[0]);

  // Active drafting state for Novo Orçamento
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [lastCreatedClientId, setLastCreatedClientId] = useState<string | undefined>(undefined);

  // Modal Visibility states
  const [isNovaReceitaOpen, setIsNovaReceitaOpen] = useState(false);
  const [isNovaDespesaOpen, setIsNovaDespesaOpen] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [isAdicionarItemOpen, setIsAdicionarItemOpen] = useState(false);
  const [isNovoPedidoOpen, setIsNovoPedidoOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isTutoriaisModalOpen, setIsTutoriaisModalOpen] = useState(false);
  const [isCatalogPreviewOpen, setIsCatalogPreviewOpen] = useState(false);
  const [isDataControlsOpen, setIsDataControlsOpen] = useState(false);

  // Order Details Modal state
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Client Details Modal state
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

  // Product Details Modal state
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<CatalogProduct | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  // Financial Transaction Details Modal state
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<Transaction | null>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);

  // WhatsApp Evolution Chat Modal state
  const [isWhatsAppChatOpen, setIsWhatsAppChatOpen] = useState(false);
  const [whatsAppChatParams, setWhatsAppChatParams] = useState<{
    clientName: string;
    clientPhone: string;
    initialMessage?: string;
    orderCode?: string;
    quoteNumber?: string;
  }>({
    clientName: '',
    clientPhone: '',
  });

  // ==========================================
  // REAL DATA SYNCHRONIZATION HOOK
  // ==========================================
  const loadAllRealData = useCallback(async () => {
    try {
      const [
        loadedClients,
        loadedOrders,
        loadedQuotes,
        loadedProducts,
        loadedFinishings,
        loadedTxs,
        loadedEmployees,
        loadedProfiles,
      ] = await Promise.all([
        fetchClients(),
        fetchOrders(),
        fetchQuotes(),
        fetchProducts(),
        fetchFinishings(),
        fetchTransactions(),
        fetchEmployees(),
        fetchAccessProfiles(),
      ]);

      if (Array.isArray(loadedClients)) setClients(loadedClients);
      if (Array.isArray(loadedOrders)) setOrders(loadedOrders);
      if (Array.isArray(loadedQuotes)) setQuotes(loadedQuotes);
      if (Array.isArray(loadedProducts)) setProducts(loadedProducts);
      if (Array.isArray(loadedFinishings)) setFinishings(loadedFinishings);
      if (Array.isArray(loadedTxs)) setTransactions(loadedTxs);
      if (Array.isArray(loadedEmployees) && loadedEmployees.length > 0) {
        setEmployees(loadedEmployees);
        setActiveUser((prev) => loadedEmployees.find((e) => e.id === prev.id) || loadedEmployees[0]);
      }
      if (Array.isArray(loadedProfiles) && loadedProfiles.length > 0) setAccessProfiles(loadedProfiles);
    } catch (err) {
      console.error('[RealData] Synchronization warning:', err);
    }
  }, []);

  // Initial Auth Check
  useEffect(() => {
    async function verifyAuth() {
      try {
        const profile = await fetchCurrentUserProfile();
        if (profile && profile.user) {
          setActiveUser(profile.user);
          if (profile.assignedProfiles && profile.assignedProfiles.length > 0) {
            setAccessProfiles(profile.assignedProfiles);
          }
          setIsAuthenticated(true);
          await loadAllRealData();
        } else {
          setIsAuthenticated(false);
          // Load public catalog products for visitors on the store
          fetchProducts().then((p) => {
            if (p && p.length > 0) setProducts(p);
          }).catch(() => {});
        }
      } catch {
        setIsAuthenticated(false);
        fetchProducts().then((p) => {
          if (p && p.length > 0) setProducts(p);
        }).catch(() => {});
      } finally {
        setIsCheckingAuth(false);
      }
    }
    verifyAuth();
  }, [loadAllRealData]);

  // Sync active system with browser history (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/erp')) {
        setActiveSystem('erp');
      } else {
        setActiveSystem('store');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToStore = () => {
    setActiveSystem('store');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const navigateToErp = () => {
    setActiveSystem('erp');
    if (!window.location.pathname.startsWith('/erp')) {
      window.history.pushState(null, '', '/erp');
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setIsAuthenticated(false);
  };

  const handleOpenWhatsAppChat = (params: {
    clientName: string;
    clientPhone: string;
    initialMessage?: string;
    orderCode?: string;
    quoteNumber?: string;
  }) => {
    setWhatsAppChatParams(params);
    setIsWhatsAppChatOpen(true);
  };

  // Navigation handler
  const handleNavigate = (route: string, mode?: SidebarMode) => {
    if (route === 'loja') {
      navigateToStore();
      return;
    }
    if (mode) {
      setSidebarMode(mode);
    }
    setCurrentRoute(route);
    setIsMobileMenuOpen(false);
  };

  const toggleSidebarMode = () => {
    if (sidebarMode === 'admin') {
      setSidebarMode('gestao');
      setCurrentRoute('visao-geral');
    } else {
      setSidebarMode('admin');
      setCurrentRoute('dashboard');
    }
  };

  // Handlers for Data Updates with Persistent Backend API Sync
  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTransactions((prev) => [newTx, ...prev]);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    try {
      await createTransaction(newTx);
    } catch (err) {
      console.error('[Persist Error - Transaction]:', err);
    }
  };

  const handleOpenTransactionDetails = (tx: Transaction) => {
    setSelectedTransactionForDetails(tx);
    setIsTransactionDetailsOpen(true);
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    if (selectedTransactionForDetails && selectedTransactionForDetails.id === updatedTx.id) {
      setSelectedTransactionForDetails(updatedTx);
    }
    try {
      await updateTransaction(updatedTx);
    } catch (err) {
      console.error('[Persist Error - Update Transaction]:', err);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    if (selectedTransactionForDetails && selectedTransactionForDetails.id === txId) {
      setIsTransactionDetailsOpen(false);
      setSelectedTransactionForDetails(null);
    }
    try {
      await deleteTransaction(txId);
    } catch (err) {
      console.error('[Persist Error - Delete Transaction]:', err);
    }
  };

  const handleToggleTransactionStatus = async (txId: string, newStatus: 'pago' | 'pendente') => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    const updatedTx: Transaction = {
      ...targetTx,
      status: newStatus,
      paidAt: newStatus === 'pago' ? new Date().toISOString() : undefined,
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? updatedTx : t))
    );
    if (selectedTransactionForDetails && selectedTransactionForDetails.id === txId) {
      setSelectedTransactionForDetails(updatedTx);
    }
    try {
      await updateTransaction(updatedTx);
    } catch (err) {
      console.error('[Persist Error - Toggle Transaction Status]:', err);
    }
  };

  const handleDuplicateTransaction = async (tx: Transaction) => {
    const dup: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      description: `${tx.description} (Cópia)`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pendente',
    };
    setTransactions((prev) => [dup, ...prev]);
    setSelectedTransactionForDetails(dup);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createTransaction(dup);
    } catch (err) {
      console.error('[Persist Error - Duplicate Transaction]:', err);
    }
  };

  const handleSaveClient = async (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    setLastCreatedClientId(newClient.id);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createClient(newClient);
    } catch (err) {
      console.error('[Persist Error - Client]:', err);
    }
  };

  const handleOpenClientDetails = (client: Client) => {
    setSelectedClientForDetails(client);
    setIsClientDetailsOpen(true);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    if (selectedClientForDetails && selectedClientForDetails.id === updatedClient.id) {
      setSelectedClientForDetails(updatedClient);
    }
    try {
      await updateClient(updatedClient);
    } catch (err) {
      console.error('[Persist Error - Update Client]:', err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (selectedClientForDetails && selectedClientForDetails.id === clientId) {
      setIsClientDetailsOpen(false);
      setSelectedClientForDetails(null);
    }
    try {
      await deleteClient(clientId);
    } catch (err) {
      console.error('[Persist Error - Delete Client]:', err);
    }
  };

  const handleOpenProductDetails = (product: CatalogProduct) => {
    setSelectedProductForDetails(product);
    setIsProductDetailsOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: CatalogProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    if (selectedProductForDetails && selectedProductForDetails.id === updatedProduct.id) {
      setSelectedProductForDetails(updatedProduct);
    }
    try {
      await updateProduct(updatedProduct);
    } catch (err) {
      console.error('[Persist Error - Update Product]:', err);
    }
  };

  const handleDuplicateProduct = async (product: CatalogProduct) => {
    const dup: CatalogProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (Cópia)`,
    };
    setProducts((prev) => [dup, ...prev]);
    setSelectedProductForDetails(dup);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createProduct(dup);
    } catch (err) {
      console.error('[Persist Error - Duplicate Product]:', err);
    }
  };

  const handleSaveOrder = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    try {
      await createOrder(newOrder);
    } catch (err) {
      console.error('[Persist Error - Order]:', err);
    }
  };

  const handleAddQuoteItems = (newItems: QuoteItem[]) => {
    setQuoteItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveQuoteItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveQuote = async (newQuote: Quote) => {
    setQuotes((prev) => [newQuote, ...prev]);
    setQuoteItems([]);
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    try {
      await createQuote(newQuote);
    } catch (err) {
      console.error('[Persist Error - Quote]:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      setSelectedOrderForDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('[Persist Error - Order Status]:', err);
    }
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrderForDetails(order);
    setIsOrderDetailsOpen(true);
  };

  const handleUpdateOrderPaymentStatus = async (
    orderId: string,
    newPaymentStatus: 'pago' | 'pendente' | 'parcial'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
    );
    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      setSelectedOrderForDetails((prev) =>
        prev ? { ...prev, paymentStatus: newPaymentStatus } : null
      );
    }
    try {
      await updateOrderPaymentStatus(orderId, newPaymentStatus);
    } catch (err) {
      console.error('[Persist Error - Order Payment]:', err);
    }
  };

  const handleAddOrderMessage = async (orderId: string, message: OrderMessage) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, messages: [...(o.messages || []), message] } : o
      )
    );
    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      setSelectedOrderForDetails((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), message] } : null
      );
    }
    try {
      await addOrderMessage(orderId, message);
    } catch (err) {
      console.error('[Persist Error - Order Message]:', err);
    }
  };

  const handleConvertQuoteToOrder = async (quote: Quote) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `#${orderNumber}`,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientWhatsapp: quote.clientWhatsapp,
      description: quote.items.map((i) => `${i.quantity}x ${i.name}`).join(' + '),
      itemsCount: quote.items.length,
      total: quote.total,
      status: 'em_aberto',
      paymentStatus: 'pago',
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: `Convertido a partir do orçamento ${quote.number}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'convertido' } : q))
    );
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    handleNavigate('visao-geral', 'gestao');

    try {
      await createOrder(newOrder);
      await updateQuote({ ...quote, status: 'convertido' });
    } catch (err) {
      console.error('[Persist Error - Convert Quote]:', err);
    }
  };

  const handleAddProduct = async (newProd: CatalogProduct) => {
    setProducts((prev) => [newProd, ...prev]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createProduct(newProd);
    } catch (err) {
      console.error('[Persist Error - Product]:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('[Persist Error - Delete Product]:', err);
    }
  };

  const handleToggleProductInternal = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, isInternal: !target.isInternal };

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    try {
      await updateProduct(updated);
    } catch (err) {
      console.error('[Persist Error - Toggle Product Internal]:', err);
    }
  };

  const handleAddFinishing = async (newFinishing: FinishingItem) => {
    setFinishings((prev) => [newFinishing, ...prev]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createFinishing(newFinishing);
    } catch (err) {
      console.error('[Persist Error - Finishing]:', err);
    }
  };

  const handleUpdateFinishing = async (updated: FinishingItem) => {
    setFinishings((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    try {
      await updateFinishing(updated);
    } catch (err) {
      console.error('[Persist Error - Update Finishing]:', err);
    }
  };

  const handleToggleFinishing = async (id: string) => {
    const target = finishings.find((f) => f.id === id);
    if (!target) return;
    const updated = { ...target, active: !target.active };

    setFinishings((prev) =>
      prev.map((f) => (f.id === id ? updated : f))
    );
    try {
      await updateFinishing(updated);
    } catch (err) {
      console.error('[Persist Error - Toggle Finishing]:', err);
    }
  };

  const handleDeleteFinishing = async (id: string) => {
    setFinishings((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteFinishing(id);
    } catch (err) {
      console.error('[Persist Error - Delete Finishing]:', err);
    }
  };

  // Profile Management Handlers
  const handleCreateProfile = async (
    profileData: Omit<AccessProfile, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newProfile: AccessProfile = {
      ...profileData,
      id: `prof_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAccessProfiles((prev) => [...prev, newProfile]);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
    try {
      await createAccessProfile(newProfile);
    } catch (err) {
      console.error('[Persist Error - Profile]:', err);
    }
  };

  const handleUpdateProfile = async (updatedProfile: AccessProfile) => {
    setAccessProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
    try {
      await updateAccessProfile(updatedProfile);
    } catch (err) {
      console.error('[Persist Error - Update Profile]:', err);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    // Remove profile from all users
    setEmployees((prev) =>
      prev.map((e) => ({
        ...e,
        profileIds: e.profileIds.filter((pId) => pId !== profileId),
      }))
    );
    setAccessProfiles((prev) => prev.filter((p) => p.id !== profileId));
    try {
      await deleteAccessProfile(profileId);
    } catch (err) {
      console.error('[Persist Error - Delete Profile]:', err);
    }
  };

  // Employee Management Handlers
  const handleAddEmployee = async (
    empData: Omit<UserEmployee, 'id' | 'createdAt'>
  ) => {
    const newEmp: UserEmployee = {
      ...empData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmp]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    try {
      await createEmployee(newEmp);
    } catch (err) {
      console.error('[Persist Error - Employee]:', err);
    }
  };

  const handleUpdateEmployee = async (updatedEmp: UserEmployee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
    if (activeUser.id === updatedEmp.id) {
      setActiveUser(updatedEmp);
    }
    try {
      await updateEmployee(updatedEmp);
    } catch (err) {
      console.error('[Persist Error - Update Employee]:', err);
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (activeUser.id === id && employees.length > 1) {
      const nextUser = employees.find((e) => e.id !== id) || employees[0];
      setActiveUser(nextUser);
    }
    try {
      await deleteEmployee(id);
    } catch (err) {
      console.error('[Persist Error - Delete Employee]:', err);
    }
  };

  // 1. Separate Standalone E-commerce Storefront (Route: /)
  if (activeSystem === 'store') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <SystemSwitcherBar
          activeSystem="store"
          onSwitchToStore={navigateToStore}
          onSwitchToErp={navigateToErp}
        />
        <EcommerceStorefrontScreen
          products={products}
          finishings={finishings}
          onBackToErp={navigateToErp}
        />
      </div>
    );
  }

  // 2. Separate ERP Application (Route: /erp)
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <SystemSwitcherBar
          activeSystem="erp"
          onSwitchToStore={navigateToStore}
          onSwitchToErp={navigateToErp}
        />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 font-sans">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-400">Verificando credenciais de sessão corporativa...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <SystemSwitcherBar
          activeSystem="erp"
          onSwitchToStore={navigateToStore}
          onSwitchToErp={navigateToErp}
        />
        <div className="flex-1 flex flex-col justify-center">
          <LoginScreen
            onLoginSuccess={(user, profiles, allowedScreens, isAdmin) => {
              setActiveUser(user);
              if (profiles && profiles.length > 0) setAccessProfiles(profiles);
              setIsAuthenticated(true);
              loadAllRealData();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden select-none">
      {/* Top System Switcher Banner */}
      <SystemSwitcherBar
        activeSystem="erp"
        onSwitchToStore={navigateToStore}
        onSwitchToErp={navigateToErp}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar: Admin or Gestao */}
        <div className="hidden md:flex shrink-0 h-full">
          {sidebarMode === 'admin' ? (
            <SidebarAdmin
              currentRoute={currentRoute}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onNavigateToStore={navigateToStore}
              ordersCount={orders.length}
              activeUser={activeUser}
              profiles={accessProfiles}
            />
          ) : (
            <SidebarGestao
              currentRoute={currentRoute}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onNavigateToStore={navigateToStore}
              ordersCount={orders.length}
              quotesCount={quotes.length}
              clientsCount={clients.length}
              activeUser={activeUser}
              profiles={accessProfiles}
            />
          )}
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col">
              {sidebarMode === 'admin' ? (
                <SidebarAdmin
                  currentRoute={currentRoute}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                  onOpenUpgradeModal={() => {
                    setIsMobileMenuOpen(false);
                    setIsUpgradeModalOpen(true);
                  }}
                  onOpenCatalogPreview={() => {
                    setIsMobileMenuOpen(false);
                    setIsCatalogPreviewOpen(true);
                  }}
                  onNavigateToStore={() => {
                    setIsMobileMenuOpen(false);
                    navigateToStore();
                  }}
                  ordersCount={orders.length}
                  activeUser={activeUser}
                  profiles={accessProfiles}
                />
              ) : (
                <SidebarGestao
                  currentRoute={currentRoute}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                  onNavigateToStore={() => {
                    setIsMobileMenuOpen(false);
                    navigateToStore();
                  }}
                  ordersCount={orders.length}
                  quotesCount={quotes.length}
                  clientsCount={clients.length}
                  activeUser={activeUser}
                  profiles={accessProfiles}
                />
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#09090b]">
          {/* User Simulation Bar for Access Control Testing */}
          <UserSimulatorBar
            employees={employees}
            profiles={accessProfiles}
            activeUser={activeUser}
            onSelectUser={(u) => setActiveUser(u)}
          />

          {/* Top Header */}
          <TopHeader
            sidebarMode={sidebarMode}
            currentRoute={currentRoute}
            activeUser={activeUser}
            onLogout={handleLogout}
            onNavigateToMyAccount={() => handleNavigate('minha-conta')}
            onToggleSidebarMode={toggleSidebarMode}
            onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
            onOpenNovaReceita={() => setIsNovaReceitaOpen(true)}
            onNavigateToNovoOrcamento={() => handleNavigate('novo-orcamento', 'gestao')}
            onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
            onOpenDataControls={() => setIsDataControlsOpen(true)}
            onOpenEcommerceStorefront={navigateToStore}
          />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {currentRoute === 'dashboard' && (
            <DashboardScreen
              products={products}
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onNavigateToGestao={() => handleNavigate('visao-geral', 'gestao')}
              onNavigateToProdutos={() => handleNavigate('produtos', 'admin')}
              onNavigate={handleNavigate}
            />
          )}

          {(currentRoute === 'visao-geral' || currentRoute === 'gestao') && (
            <GestaoVisaoGeralScreen
              orders={orders}
              clients={clients}
              quotes={quotes}
              onOpenNovaReceita={() => setIsNovaReceitaOpen(true)}
              onNavigateToNovoOrcamento={() => handleNavigate('novo-orcamento', 'gestao')}
              onOpenNovoPedido={() => setIsNovoPedidoOpen(true)}
              onNavigateToClientes={() => handleNavigate('clientes', 'gestao')}
              onNavigateToOrcamentos={() => handleNavigate('orcamentos', 'gestao')}
              onNavigateToPedidos={() => handleNavigate('pedidos', 'gestao')}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenOrderDetails={handleOpenOrderDetails}
            />
          )}

          {currentRoute === 'novo-orcamento' && (
            <NovoOrcamentoScreen
              clients={clients}
              items={quoteItems}
              createdClientId={lastCreatedClientId}
              onBack={() => handleNavigate('visao-geral', 'gestao')}
              onOpenNovoClienteModal={() => setIsNovoClienteOpen(true)}
              onOpenAdicionarItemModal={() => setIsAdicionarItemOpen(true)}
              onRemoveItem={handleRemoveQuoteItem}
              onSaveQuote={handleSaveQuote}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentRoute === 'clientes' && (
            <ClientesScreen
              clients={clients}
              onOpenNovoClienteModal={() => setIsNovoClienteOpen(true)}
              onNavigateToNovoOrcamento={() => handleNavigate('novo-orcamento', 'gestao')}
              onOpenClientDetails={handleOpenClientDetails}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentRoute === 'orcamentos' && (
            <OrcamentosListScreen
              quotes={quotes}
              onNavigateToNovoOrcamento={() => handleNavigate('novo-orcamento', 'gestao')}
              onConvertToOrder={handleConvertQuoteToOrder}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentRoute === 'pedidos' && (
            <PedidosListScreen
              orders={orders}
              onOpenNovoPedido={() => setIsNovoPedidoOpen(true)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenOrderDetails={handleOpenOrderDetails}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentRoute === 'logistica' && (
            <LogisticaScreen
              orders={orders}
              clients={clients}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentRoute === 'financeiro' && (
            <FinanceiroScreen
              transactions={transactions}
              onOpenNovaReceita={() => setIsNovaReceitaOpen(true)}
              onOpenNovaDespesa={() => setIsNovaDespesaOpen(true)}
              onOpenRelatorio={() => handleNavigate('relatorios', 'gestao')}
              onOpenTransactionDetails={handleOpenTransactionDetails}
            />
          )}

          {/* Produtos (Unificado: Catálogo e Insumos Internos) */}
          {currentRoute === 'produtos' && (
            <CatalogoEcommerceProdutosScreen
              products={products}
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleProductInternal={handleToggleProductInternal}
              onOpenProductDetails={handleOpenProductDetails}
              initialTypeFilter="todos"
            />
          )}

          {/* Gestão: Produtos Internos (Redirecionamento / Filtro Direto) */}
          {currentRoute === 'produtos-internos' && (
            <CatalogoEcommerceProdutosScreen
              products={products}
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleProductInternal={handleToggleProductInternal}
              onOpenProductDetails={handleOpenProductDetails}
              initialTypeFilter="internos"
            />
          )}

          {/* Admin: Categorias */}
          {currentRoute === 'categorias' && (
            <CategoriasScreen
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
            />
          )}

          {/* Admin: Precificação */}
          {currentRoute === 'precificacao' && (
            <ConfiguracoesScreen
              initialTab="precificacao"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Métricas */}
          {currentRoute === 'metricas' && (
            <MetricasScreen orders={orders} products={products} />
          )}

          {/* Admin: Exportar */}
          {currentRoute === 'exportar' && (
            <ConfiguracoesScreen
              initialTab="exportar"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Aparência */}
          {currentRoute === 'aparencia' && (
            <ConfiguracoesScreen
              initialTab="aparencia"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Configurações */}
          {currentRoute === 'configuracoes' && (
            <ConfiguracoesScreen
              initialTab="geral"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Pagamentos */}
          {currentRoute === 'pagamentos' && (
            <ConfiguracoesScreen
              initialTab="pagamentos"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Integrações */}
          {currentRoute === 'integracoes' && (
            <ConfiguracoesScreen
              initialTab="integracoes"
              onOpenCatalogPreview={() => setIsCatalogPreviewOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              clients={clients}
              orders={orders}
              products={products}
              transactions={transactions}
            />
          )}

          {/* Admin: Funcionários & Permissões */}
          {currentRoute === 'funcionarios' && (
            <FuncionariosScreen
              employees={employees}
              profiles={accessProfiles}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onRemoveEmployee={handleRemoveEmployee}
              onOpenProfilesScreen={() => handleNavigate('perfis', 'admin')}
            />
          )}

          {/* Admin: Perfis de Acesso & Matriz de Permissões */}
          {currentRoute === 'perfis' && (
            <PerfisAcessoScreen
              profiles={accessProfiles}
              employees={employees}
              onCreateProfile={handleCreateProfile}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
              onOpenEmployeesScreen={() => handleNavigate('funcionarios', 'admin')}
            />
          )}

          {currentRoute === 'acabamentos' && (
            <AcabamentosScreen
              finishings={finishings}
              onAddFinishing={handleAddFinishing}
              onUpdateFinishing={handleUpdateFinishing}
              onRemoveFinishing={handleDeleteFinishing}
            />
          )}

          {currentRoute === 'agenda' && (
            <AgendaScreen
              orders={orders}
            />
          )}

          {currentRoute === 'pedidos-online' && (
            <PedidosOnlineScreen
              orders={orders}
            />
          )}

          {currentRoute === 'declaracao-conteudo' && (
            <LogisticaScreen
              orders={orders}
              clients={clients}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentRoute === 'relatorios' && (
            <RelatoriosScreen
              orders={orders}
              quotes={quotes}
              products={products}
              transactions={transactions}
            />
          )}

          {(currentRoute === 'minha-conta' || currentRoute === 'perfil') && (
            <div className="p-4 sm:p-6 lg:p-8">
              <MyAccountScreen
                currentUser={activeUser}
                assignedProfiles={accessProfiles.filter((p) =>
                  activeUser.profileIds?.includes(p.id)
                )}
                onUserUpdated={(updatedUser) => {
                  setActiveUser(updatedUser);
                  setEmployees((prev) =>
                    prev.map((e) => (e.id === updatedUser.id ? updatedUser : e))
                  );
                }}
                onLogout={handleLogout}
              />
            </div>
          )}

        </main>
      </div>
    </div>

      {/* Global Interactive Modals */}
      <ModalNovaReceita
        isOpen={isNovaReceitaOpen}
        onClose={() => setIsNovaReceitaOpen(false)}
        onSave={handleSaveTransaction}
      />

      <ModalNovaDespesa
        isOpen={isNovaDespesaOpen}
        onClose={() => setIsNovaDespesaOpen(false)}
        onSave={handleSaveTransaction}
      />

      <ModalNovoCliente
        isOpen={isNovoClienteOpen}
        onClose={() => setIsNovoClienteOpen(false)}
        onSave={handleSaveClient}
      />

      <ModalAdicionarItem
        isOpen={isAdicionarItemOpen}
        onClose={() => setIsAdicionarItemOpen(false)}
        onAddItems={handleAddQuoteItems}
        products={products}
        finishings={finishings}
      />

      <ModalNovoPedido
        isOpen={isNovoPedidoOpen}
        onClose={() => setIsNovoPedidoOpen(false)}
        clients={clients}
        onSave={handleSaveOrder}
      />

      <ModalUpgrade
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <ModalTutoriais
        isOpen={isTutoriaisModalOpen}
        onClose={() => setIsTutoriaisModalOpen(false)}
      />

      <ModalCatalogoPreview
        isOpen={isCatalogPreviewOpen}
        onClose={() => setIsCatalogPreviewOpen(false)}
        products={products}
        onOpenStoreView={() => handleNavigate('loja')}
      />

      <ModalDetalhesPedido
        order={selectedOrderForDetails}
        isOpen={isOrderDetailsOpen}
        onClose={() => {
          setIsOrderDetailsOpen(false);
          setSelectedOrderForDetails(null);
        }}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdatePaymentStatus={handleUpdateOrderPaymentStatus}
        onAddMessage={handleAddOrderMessage}
        onOpenWhatsAppChat={handleOpenWhatsAppChat}
      />

      {/* Modal Detalhes do Cliente */}
      <ModalDetalhesCliente
        client={selectedClientForDetails}
        isOpen={isClientDetailsOpen}
        onClose={() => {
          setIsClientDetailsOpen(false);
          setSelectedClientForDetails(null);
        }}
        orders={orders}
        quotes={quotes}
        transactions={transactions}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        onOpenNovoPedidoParaCliente={(client) => {
          setIsClientDetailsOpen(false);
          setIsNovoPedidoOpen(true);
        }}
        onOpenNovoOrcamentoParaCliente={(client) => {
          setIsClientDetailsOpen(false);
          handleNavigate('novo-orcamento', 'gestao');
        }}
        onOpenNovaReceitaParaCliente={(client) => {
          setIsClientDetailsOpen(false);
          setIsNovaReceitaOpen(true);
        }}
        onOpenOrderDetails={handleOpenOrderDetails}
        onOpenTransactionDetails={handleOpenTransactionDetails}
        onOpenWhatsAppChat={handleOpenWhatsAppChat}
      />

      {/* Modal Detalhes do Produto */}
      <ModalDetalhesProduto
        product={selectedProductForDetails}
        isOpen={isProductDetailsOpen}
        onClose={() => {
          setIsProductDetailsOpen(false);
          setSelectedProductForDetails(null);
        }}
        orders={orders}
        finishings={finishings}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleInternal={handleToggleProductInternal}
        onDuplicateProduct={handleDuplicateProduct}
        onOpenCatalogPreview={() => {
          setIsProductDetailsOpen(false);
          setIsCatalogPreviewOpen(true);
        }}
        onOpenNovoPedidoComProduto={(product) => {
          setIsProductDetailsOpen(false);
          setIsNovoPedidoOpen(true);
        }}
        onOpenOrderDetails={handleOpenOrderDetails}
      />

      {/* Modal Detalhes da Transação Financeira */}
      <ModalDetalhesTransacao
        transaction={selectedTransactionForDetails}
        isOpen={isTransactionDetailsOpen}
        onClose={() => {
          setIsTransactionDetailsOpen(false);
          setSelectedTransactionForDetails(null);
        }}
        clients={clients}
        orders={orders}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onToggleStatus={handleToggleTransactionStatus}
        onDuplicateTransaction={handleDuplicateTransaction}
        onOpenClientDetails={(client) => {
          setIsTransactionDetailsOpen(false);
          handleOpenClientDetails(client);
        }}
        onOpenOrderDetails={(order) => {
          setIsTransactionDetailsOpen(false);
          handleOpenOrderDetails(order);
        }}
      />

      {/* Modal WhatsApp Chat (Evolution API Integration) */}
      <ModalWhatsAppChat
        isOpen={isWhatsAppChatOpen}
        onClose={() => setIsWhatsAppChatOpen(false)}
        clientName={whatsAppChatParams.clientName}
        clientPhone={whatsAppChatParams.clientPhone}
        initialMessage={whatsAppChatParams.initialMessage}
        orderCode={whatsAppChatParams.orderCode}
        quoteNumber={whatsAppChatParams.quoteNumber}
      />

      {/* Modal de Gestão de Dados Reais e Persistência */}
      <ModalGerenciarDadosReais
        isOpen={isDataControlsOpen}
        onClose={() => setIsDataControlsOpen(false)}
        onDataReloaded={loadAllRealData}
        onNavigateToIntegracoes={() => {
          handleNavigate('integracoes', 'admin');
        }}
      />
    </div>
  );
}
