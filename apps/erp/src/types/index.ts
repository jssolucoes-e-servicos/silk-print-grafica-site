// ==========================================
// UNIFIED SILKPRINT TYPES (ERP + E-COMMERCE)
// ==========================================

export type SidebarMode = 'admin' | 'gestao';

export type AdminRoute =
  | 'dashboard'
  | 'gestao'
  | 'produtos'
  | 'categorias'
  | 'clientes'
  | 'acabamentos'
  | 'financeiro'
  | 'relatorios'
  | 'precificacao'
  | 'metricas'
  | 'exportar'
  | 'aparencia'
  | 'pagamentos'
  | 'integracoes'
  | 'funcionarios'
  | 'perfis'
  | 'configuracoes';

export type GestaoRoute =
  | 'visao-geral'
  | 'clientes'
  | 'produtos'
  | 'produtos-internos'
  | 'orcamentos'
  | 'novo-orcamento'
  | 'pedidos'
  | 'novo-pedido'
  | 'agenda'
  | 'pedidos-online'
  | 'logistica'
  | 'declaracao-conteudo'
  | 'perfis';

export type AppRoute = AdminRoute | GestaoRoute;

// ==========================================
// ACCESS CONTROL & PROFILES (RBAC / ABAC)
// ==========================================

export type StandardActionFlag = 'view' | 'create' | 'edit' | 'delete' | 'report' | 'admin';
export type ActionFlag = StandardActionFlag | string;

export interface PermissionActionDef {
  action: ActionFlag;
  code: string;
  description: string;
  danger: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceDefinition {
  resource: string;
  name: string;
  category: 'CRM & Sales' | 'Production & Operations' | 'Catalog & Pricing' | 'Finance & Accounting' | 'Administration & Security';
  description: string;
  route: AppRoute;
  mode: SidebarMode;
  apiEndpoint: string;
  actions: PermissionActionDef[];
}

export interface SystemScreenDef {
  id: string;
  name: string;
  category: 'Gestão Gráfica' | 'Comercial & Vendas' | 'Produção & Logística' | 'Financeiro & Fiscal' | 'Administração & Sistema';
  description: string;
  iconName: string;
  route: AppRoute;
  mode: SidebarMode;
}

export interface SystemRoutineDef {
  id: string;
  code: string;
  name: string;
  category: 'Gestão de Pedidos' | 'Orçamentos & Propostas' | 'Cadastro & Clientes' | 'Catálogo & Preços' | 'Financeiro & Caixa' | 'Logística & Despacho' | 'Usuários & Segurança' | 'Configurações Globais';
  description: string;
  dangerLevel: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface AccessProfile {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  isSystemDefault?: boolean;
  allowedPermissions: string[];
  allowedScreens: string[];
  allowedRoutines: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCustomPermission {
  id: string;
  permissionId: string;
  permissionType: 'screen' | 'routine' | 'action';
  permissionName: string;
  grantType: 'allow' | 'deny';
  expiresAt: string | null;
  grantedAt: string;
  grantedBy: string;
  reason: string;
}

export interface UserEmployee {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar?: string;
  jobTitle: string;
  department: 'Diretoria' | 'Comercial' | 'Arte & Pré-Impressão' | 'Produção' | 'Acabamento' | 'Logística' | 'Financeiro';
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  profileIds: string[];
  customPermissions: UserCustomPermission[];
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  twoFactorType?: 'totp' | 'whatsapp';
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  notifications?: {
    email?: boolean;
    whatsapp?: boolean;
    system?: boolean;
  };
  themePreference?: 'dark' | 'light' | 'system';
}

// ==========================================
// CLIENTS & CRM
// ==========================================

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  cpfCnpj?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  companyName?: string;
  stateRegistration?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
}

// ==========================================
// E-COMMERCE & STOREFRONT TYPES
// ==========================================

export interface ProductOption {
  id: string;
  name: string;
  priceModifier?: number;
  description?: string;
}

export interface PaperType {
  id: string;
  name: string;
  weight: string;
  description: string;
  category: 'couché' | 'offset' | 'especial' | 'adesivo' | 'lona' | 'kraft' | string;
  priceMultiplier: number;
}

export interface ColorMode {
  id: string;
  code: '4x0' | '4x1' | '4x4' | '1x0' | '1x1' | string;
  name: string;
  description: string;
  priceMultiplier: number;
}

export interface FinishOption {
  id: string;
  name: string;
  description: string;
  extraPrice: number;
  badge?: string;
}

export interface QuantityTier {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercent: number;
  popular?: boolean;
}

export type ProductQuantity = QuantityTier;
export type ProductPaper = PaperType;
export type ProductFinish = FinishOption;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: string;
  description?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BalcaoRetirada {
  id: string;
  name: string;
  state: string;
  city: string;
  neighborhood: string;
  address: string;
  cep: string;
  openingHours: string;
  price: number;
  phone?: string;
  contactName?: string;
  notes?: string;
  active?: boolean;
}

export type PickupPoint = BalcaoRetirada;

export interface Coupon {
  id?: string;
  code: string;
  discountPercent: number;
  freeShipping?: boolean;
  description: string;
  minSpend: number;
  active: boolean;
}

export interface SiteInfo {
  name: string;
  legalName?: string;
  cnpj?: string;
  tagline: string;
  whatsapp: string;
  phone: string;
  email: string;
  adminEmail: string;
  address: string;
  businessHours: string;
  heroNotice?: string;
  instagram?: string;
  rating?: number;
  reviewCount?: number;
}

// ==========================================
// PRODUCTS & FINISHINGS
// ==========================================

export interface PriceTier {
  id: string;
  quantity: number;
  price: number;
  cost?: number;
}

export interface ProductSizeVariation {
  id: string;
  size: string;
  price: number;
  cost?: number;
  sku?: string;
  inStock?: number;
  isActive?: boolean;
}

export interface KitSubItem {
  id: string;
  title: string;
  size?: string;
  printType?: string;
  paper?: string;
  finishing?: string;
  image?: string;
}

export interface ProductFinishingCustomization {
  finishingId: string;
  customPrice?: number;
  customCost?: number;
  customExtraDays?: number;
  isActive?: boolean;
}

export interface ProductGabarito {
  format?: string;
  name?: string;
  url?: string;
  pdfUrl?: string;
  cdrUrl?: string;
  aiUrl?: string;
  psdUrl?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  title?: string;
  slug?: string;
  category: string;
  categorySlug?: string;
  price?: number;
  basePrice?: number;
  cost?: number;
  unit?: string;
  minQty?: number;
  image?: string;
  imageUrl?: string;
  badge?: string;
  popular?: boolean;
  shortDescription?: string;
  description?: string;
  isInternal?: boolean;
  isAvailableForSale?: boolean;
  trackStock?: boolean;
  isM2?: boolean;
  baseM2Price?: number;
  productionDays?: number;
  productionTime?: string;
  productionTimeHours?: number;
  formats?: string[];
  defaultFormat?: string;
  paperType?: string;
  paperWeight?: string;
  printType?: string;
  papers?: PaperType[];
  colorModes?: ColorMode[];
  finishes?: FinishOption[];
  quantities?: QuantityTier[];
  bleedSpecs?: {
    bleedMm: number;
    safetyMm: number;
  };
  gabaritos?: ProductGabarito[];
  compatibleFinishings?: string[];
  productFinishings?: ProductFinishingCustomization[];
  hasSizeGrid?: boolean;
  sizeVariations?: ProductSizeVariation[];
  kitItems?: KitSubItem[];
  isActive?: boolean;
}

export type Product = CatalogProduct;

export interface InternalProduct {
  id: string;
  name: string;
  category: string;
  size?: string;
  printType?: string;
  paper?: string;
  finishing?: string;
  description?: string;
  productionTime?: string;
  priceType: 'quantidade' | 'escalonado';
  priceTiers: PriceTier[];
  isActive: boolean;
  isM2?: boolean;
  baseM2Price?: number;
}

export interface FinishingItem {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  linkGroup?: 'textil' | 'papelaria' | 'comunicacao_visual' | 'brindes' | 'geral' | string;
  linkGroups?: ('textil' | 'papelaria' | 'comunicacao_visual' | 'brindes' | 'geral' | string)[];
  price: number;
  cost?: number;
  unit?: string;
  pricingType: 'unidade' | 'm2' | 'fixo';
  extraDays?: number;
  description?: string;
  active?: boolean;
  isActive?: boolean;
}

export interface CatalogData {
  siteInfo: SiteInfo;
  categories: Category[];
  products: Product[];
  pickupPoints: BalcaoRetirada[];
  coupons: Coupon[];
}

// ==========================================
// ORDERS & QUOTES
// ==========================================

export type OrderStatus =
  | 'criando_arte'
  | 'em_aberto'
  | 'em_producao'
  | 'aguardando_retirada'
  | 'em_transporte'
  | 'entregue'
  | 'aguardando_pagamento'
  | 'cancelado'
  | 'pendente_pagamento'
  | 'aprovado'
  | 'pre_impressao'
  | 'impressao'
  | 'acabamento'
  | 'embalado'
  | 'pronto_retirada';

export interface OrderMessage {
  id: string;
  sender: 'grafica' | 'cliente' | 'sistema';
  text: string;
  timestamp: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  productName?: string;
  description?: string;
  sourceTab?: 'catalogo' | 'internos' | 'm2' | 'personalizado' | string;
  pricingType?: 'unidade' | 'm2' | 'milheiro' | 'pacote' | 'hora' | string;
  selectedSize?: string;
  sizeCost?: number;
  width?: number;
  height?: number;
  area?: number;
  unitCost?: number;
  finishings?: string[];
  quantity: number;
  unitPrice: number;
  total: number;
  totalPrice?: number;
}

export interface Quote {
  id: string;
  number?: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  items: QuoteItem[];
  observations?: string;
  validityDate?: string;
  validUntil?: string;
  subtotal: number;
  discount?: number;
  total: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'convertido';
  createdAt: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface OrderShipping {
  type: 'balcao' | 'endereco' | 'sedex' | 'pac';
  price: number;
  balcaoId?: string;
  balcaoName?: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  format: string;
  paperName: string;
  colorMode: string;
  finishes: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  code?: string;
  clientId?: string;
  clientName?: string;
  clientWhatsapp?: string;
  clientCpf?: string;
  clientEmail?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  description?: string;
  items?: QuoteItem[] | OrderItem[] | any[];
  itemsCount?: number;
  total?: number;
  paidAmount?: number;
  status: OrderStatus;
  paymentStatus?: 'pago' | 'pendente' | 'parcial';
  paymentMethod?: string;
  pixKey?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  deliveryDate?: string;
  createdAt?: string;
  notes?: string;
  isOnlineOrder?: boolean;
  messages?: OrderMessage[];

  // Storefront / E-commerce compatibility fields
  timestamp?: string;
  customer?: OrderCustomer;
  shipping?: OrderShipping;
  payment?: {
    method: 'pix' | 'credit' | 'boleto' | string;
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    installments?: number;
  };
  couponApplied?: string;
  paymentId?: string;
  mercadoPagoStatus?: string;
  qrCodePix?: string;
  qrCodePixBase64?: string;
  timeline?: {
    step: string;
    description: string;
    done: boolean;
    current?: boolean;
    timestamp: string;
  }[];
}

// ==========================================
// CART & STORE VIEWS
// ==========================================

export interface CartItem {
  id: string;
  productId?: string;
  productName?: string;
  category?: string;
  image?: string;
  product?: Product;
  format: string;
  paper: PaperType;
  colorMode: ColorMode;
  finishes: FinishOption[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productionTime: string;
  artworkOption: 'upload' | 'creation' | 'review';
  artworkFile?: {
    name: string;
    size: number;
    url?: string;
    previewUrl?: string;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  type: 'balcao' | 'transportadora' | 'sedex' | 'pac';
  estimatedDays: string;
  price: number;
  locationDetails?: string;
}

export type ActiveView =
  | 'home'
  | 'category'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'tracking'
  | 'quote'
  | 'gabaritos'
  | 'balcoes'
  | 'about'
  | 'how-to-buy'
  | 'help'
  | 'contact'
  | 'admin';

// ==========================================
// SUPPLIERS & RAW MATERIALS
// ==========================================

export interface Supplier {
  id: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  email: string;
  phone: string;
  category: 'papel' | 'tinta' | 'chapas_ctp' | 'embalagens' | 'acabamentos' | 'manutencao' | 'outros';
  notes?: string;
  address?: string;
  city?: string;
  state?: string;
  createdAt: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: 'papel' | 'chapa_ctp' | 'tinta' | 'acabamento' | 'embalagem';
  unit: string;
  stockQty: number;
  minStockQty: number;
  costPrice: number;
  supplierName: string;
  location?: string;
  lastRestockDate?: string;
}

export interface GraphicBudgetEstimate {
  id: string;
  customerName: string;
  jobName: string;
  paperType: string;
  paperWeight: string;
  sheetFormat: string;
  finalFormat: string;
  posesPerSheet: number;
  printColors: '4x0' | '4x4' | '1x0' | '1x1' | '4x1';
  quantity: number;
  sheetsNeeded: number;
  wasteSheets: number;
  totalSheets: number;
  ctpPlatesCount: number;
  costPaper: number;
  costCtp: number;
  costPrinting: number;
  costFinishing: number;
  costTotal: number;
  markupPercent: number;
  suggestedSalePrice: number;
  unitPrice: number;
  createdAt: string;
}

export interface CustomQuoteRequest {
  name: string;
  phone: string;
  email?: string;
  materialType: string;
  quantity: string;
  dimensions?: string;
  finishing?: string;
  message: string;
  urgency?: 'urgente' | 'normal' | 'flexivel';
}

export interface QuoteLead {
  id: string;
  timestamp: string;
  source: string;
  channel: 'whatsapp' | 'email';
  name: string;
  phone: string;
  email?: string;
  description: string;
  adminEmailNotified: string;
  adminPhoneNotified: string;
  n8nStatus: 'dispatched' | 'skipped_no_url' | 'failed';
  emailStatus: 'sent_resend' | 'logged_fallback' | 'failed';
  details?: Record<string, any>;
}

// ==========================================
// FINANCIAL & TRANSACTIONS
// ==========================================

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  paymentMethod?: 'PIX' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto' | 'Transferência' | string;
  status: 'pago' | 'pendente';
  dueDate?: string;
  category?: string;
  observations?: string;
  clientName?: string;
  clientId?: string;
  orderId?: string;
  orderCode?: string;
  paidAt?: string;
  documentNumber?: string;
  supplierName?: string;
  createdAt: string;
}

export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'pre_impressao' | 'impressor' | 'acabamento' | 'expedicao' | 'vendedor';
  phone?: string;
  active: boolean;
  createdAt: string;
}

// ==========================================
// EVOLUTION API & WHATSAPP
// ==========================================

export type EvolutionConnectionState = 'open' | 'close' | 'connecting' | 'qrcode' | 'disconnected' | 'error';

export interface EvolutionConfig {
  apiUrl: string;
  instanceName: string;
  apiKey: string;
  status: EvolutionConnectionState;
  phoneNumber?: string;
  profileName?: string;
  profilePicUrl?: string;
  lastChecked?: string;
  autoSync?: boolean;
  webhookUrl?: string;
}

export interface WhatsAppChatMessage {
  id: string;
  remoteJid: string;
  clientName?: string;
  fromMe: boolean;
  text: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  mediaType?: 'text' | 'image' | 'document' | 'audio';
  mediaUrl?: string;
  orderCode?: string;
  quoteNumber?: string;
}

// ==========================================
// POSTGRESQL & PRISMA
// ==========================================

export type PostgresConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface PostgresConfig {
  connectionString?: string;
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl: boolean;
  status: PostgresConnectionStatus;
  lastChecked?: string;
  tablesCount?: number;
  serverVersion?: string;
  totalRecords?: Record<string, number>;
}

export interface DatabaseTableInfo {
  tableName: string;
  rowCount: number;
  columnsCount: number;
}

export interface PrismaModelField {
  name: string;
  type: string;
  isRequired: boolean;
  isList: boolean;
  isUnique: boolean;
  isId: boolean;
  default?: any;
  documentation?: string;
}

export interface PrismaModelMeta {
  name: string;
  tableName: string;
  fields: PrismaModelField[];
  relations: string[];
  recordsCount?: number;
}

export interface PrismaStatus {
  isInitialized: boolean;
  version: string;
  modelsCount: number;
  models: PrismaModelMeta[];
  status: 'connected' | 'disconnected' | 'error';
  lastChecked?: string;
  message?: string;
}

// ==========================================
// MINIO S3 STORAGE
// ==========================================

export type MinioConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey?: string;
  bucket: string;
  status: MinioConnectionStatus;
  lastChecked?: string;
  totalBuckets?: number;
  totalFiles?: number;
}

export interface MinioBucketItem {
  name: string;
  creationDate: string;
}

export interface MinioFileItem {
  name: string;
  size: number;
  lastModified: string;
  etag?: string;
  url?: string;
  category?: 'arte' | 'comprovante' | 'relatorio' | 'geral';
}

// ==========================================
// N8N AUTOMATIONS
// ==========================================

export type N8nConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  webhookOrderCreated?: string;
  webhookStatusChanged?: string;
  webhookQuoteCreated?: string;
  webhookFinancialAlert?: string;
  status: N8nConnectionStatus;
  lastChecked?: string;
  enabledTriggers: {
    orderCreated: boolean;
    statusChanged: boolean;
    quoteCreated: boolean;
    financialAlert: boolean;
  };
}

export interface N8nEventLog {
  id: string;
  eventType: 'order.created' | 'order.status_changed' | 'quote.created' | 'financial.alert' | 'manual.test';
  targetUrl: string;
  payload: any;
  status: 'success' | 'failed' | 'pending';
  httpStatus?: number;
  response?: string;
  timestamp: string;
}
