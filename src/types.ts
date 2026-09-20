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
// ACCESS CONTROL & PROFILES (RBAC / ABAC) - resource.action convention
// ==========================================

export type StandardActionFlag = 'view' | 'create' | 'edit' | 'delete' | 'report' | 'admin';
export type ActionFlag = StandardActionFlag | string;

export interface PermissionActionDef {
  action: ActionFlag;
  code: string; // e.g. 'customers.create'
  description: string;
  danger: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceDefinition {
  resource: string; // e.g. 'customers', 'products', 'orders'
  name: string; // PT-BR Display Name
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
  code: string; // e.g. 'orders.update_status', 'customers.create'
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
  allowedPermissions: string[]; // List of 'resource.action' e.g. ['customers.view', 'customers.create', 'products.view']
  allowedScreens: string[]; // List of SystemScreenDef.id or resource routes for backward compatibility
  allowedRoutines: string[]; // List of routine codes or action codes
  createdAt: string;
  updatedAt: string;
}

export interface UserCustomPermission {
  id: string;
  permissionId: string; // 'resource.action' code (e.g. 'customers.delete', 'financial.admin') or screen ID
  permissionType: 'screen' | 'routine' | 'action';
  permissionName: string;
  grantType: 'allow' | 'deny';
  expiresAt: string | null; // null = permanente | ISO string = temporário
  grantedAt: string;
  grantedBy: string; // Nome do administrador que concedeu
  reason: string; // Justificativa / Motivo
}

export interface UserEmployee {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar?: string;
  jobTitle: string; // Ex: 'Arte-Finalista', 'Gerente Comercial', 'Operador de Máquinas'
  department: 'Diretoria' | 'Comercial' | 'Arte & Pré-Impressão' | 'Produção' | 'Acabamento' | 'Logística' | 'Financeiro';
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  profileIds: string[]; // Múltiplos perfis de acesso ativos para o usuário!
  customPermissions: UserCustomPermission[]; // Permissões avulsas (temporárias ou permanentes)
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

export type OrderStatus =
  | 'criando_arte'
  | 'em_aberto'
  | 'em_producao'
  | 'aguardando_retirada'
  | 'em_transporte'
  | 'entregue'
  | 'aguardando_pagamento'
  | 'cancelado';

export interface OrderMessage {
  id: string;
  sender: 'grafica' | 'cliente' | 'sistema';
  text: string;
  timestamp: string;
}

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

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  sourceTab: 'catalogo' | 'internos' | 'm2' | 'personalizado';
  pricingType: 'unidade' | 'm2' | 'milheiro' | 'pacote' | 'hora';
  selectedSize?: string; // Ex: '1 ano', 'M', 'G3'
  sizeCost?: number; // Custo unitário de confecção daquele tamanho
  width?: number; // cm
  height?: number; // cm
  area?: number; // m²
  unitCost?: number; // Custo unitário para cálculo de margem
  finishings?: string[]; // Acabamentos/opcionais selecionados
  quantity: number;
  unitPrice: number;
  total: number;
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

export interface Order {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  clientCpf?: string;
  clientEmail?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  description: string;
  items?: QuoteItem[];
  itemsCount: number;
  total: number;
  paidAmount?: number;
  status: OrderStatus;
  paymentStatus: 'pago' | 'pendente' | 'parcial';
  paymentMethod?: string;
  pixKey?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  deliveryDate: string;
  createdAt: string;
  notes?: string;
  isOnlineOrder?: boolean;
  messages?: OrderMessage[];
}

export interface PriceTier {
  id: string;
  quantity: number;
  price: number;
  cost?: number;
}

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
  linkGroup?: 'textil' | 'papelaria' | 'comunicacao_visual' | 'brindes' | 'geral' | string;
  price: number;
  cost?: number;
  unit?: string;
  pricingType: 'unidade' | 'm2' | 'fixo';
  extraDays?: number; // Prazo adicional estritamente numérico em dias úteis
  description?: string;
  active?: boolean;
  isActive?: boolean;
}

export interface ProductFinishingCustomization {
  finishingId: string;
  customPrice?: number; // Preço customizado para este acabamento neste produto específico
  customCost?: number; // Custo customizado para este produto específico
  customExtraDays?: number; // Prazo adicional (dias úteis) específico para este acabamento neste produto
  isActive?: boolean;
}

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

export interface KitSubItem {
  id: string;
  title: string;
  size?: string;
  printType?: string;
  paper?: string;
  finishing?: string;
  image?: string;
}

export interface EcommerceKit {
  id: string;
  name: string;
  category: string;
  price: number;
  productionTime?: string;
  description?: string;
  items: KitSubItem[];
  image?: string;
  isActive?: boolean;
}

export interface ProductSizeVariation {
  id: string;
  size: string; // Ex: '1 ano', '2 anos', '4 anos', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3'
  price: number; // Preço de venda para este tamanho
  cost?: number; // Preço de custo da confecção neste tamanho
  sku?: string;
  inStock?: number;
  isActive?: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  title?: string;
  category: string;
  price: number;
  basePrice?: number;
  cost?: number;
  unit: string;
  minQty?: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  isInternal?: boolean;
  isAvailableForSale?: boolean; // Habilitar ou desabilitar a venda do produto
  trackStock?: boolean; // Habilitar ou desabilitar controle de estoque para o produto (se false: sob demanda/infinito)
  isM2?: boolean;
  baseM2Price?: number;
  productionDays?: number; // Prazo de produção estritamente numérico em dias úteis
  productionTime?: string; // Descrição textual/formatada ex: "3 dias úteis"
  paperType?: string;
  paperWeight?: string;
  printType?: string;
  compatibleFinishings?: string[]; // IDs ou nomes dos acabamentos e opcionais vinculados ao produto
  productFinishings?: ProductFinishingCustomization[]; // Customizações de valor e prazo para este produto específico
  hasSizeGrid?: boolean; // Se o produto trabalha com grade de tamanhos (ex: camisetas, uniformes)
  sizeVariations?: ProductSizeVariation[]; // Lista detalhada de variações de tamanho com preços e custos
  kitItems?: KitSubItem[];
  isActive?: boolean;
}

export type Product = CatalogProduct;

// ==========================================
// EVOLUTION API & WHATSAPP INTEGRATION TYPES
// ==========================================

export type EvolutionConnectionState = 'open' | 'close' | 'connecting' | 'qrcode' | 'disconnected' | 'error';

export interface EvolutionConfig {
  apiUrl: string; // ex: https://evo.meudominio.com.br
  instanceName: string; // ex: silkprint
  apiKey: string; // Global API Key ou Token da instância
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
  remoteJid: string; // ex: 5511999999999
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
// POSTGRESQL DATABASE TYPES
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

// ==========================================
// PRISMA ORM TYPES
// ==========================================

export interface PrismaModelField {
  name: string;
  type: string;
  isId?: boolean;
  isRequired?: boolean;
  isList?: boolean;
  relationName?: string;
  mappedName?: string;
}

export interface PrismaModelMeta {
  name: string;
  tableName: string;
  description: string;
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
// MINIO S3 STORAGE TYPES
// ==========================================

export type MinioConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface MinioConfig {
  endpoint: string; // ex: minio.meudominio.com.br or 192.168.1.100
  port: number; // default 9000
  useSSL: boolean;
  accessKey: string;
  secretKey?: string;
  bucket: string; // default silkprint-files
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
// N8N AUTOMATIONS & WEBHOOKS TYPES
// ==========================================

export type N8nConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface N8nConfig {
  baseUrl: string; // ex: https://n8n.meudominio.com.br
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

