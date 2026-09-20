// Package: @silkprint/types
// Modelos e interfaces TypeScript compartilhados entre a Loja Virtual, o ERP e a API Backend

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
  category: 'couché' | 'offset' | 'especial' | 'adesivo' | 'lona' | 'kraft';
  priceMultiplier: number;
}

export interface ColorMode {
  id: string;
  code: '4x0' | '4x1' | '4x4' | '1x0' | '1x1';
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

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  image: string;
  badge?: string;
  popular?: boolean;
  productionTimeHours: number; // e.g. 24, 48, 72
  formats: string[];
  defaultFormat: string;
  papers: PaperType[];
  colorModes: ColorMode[];
  finishes: FinishOption[];
  quantities: QuantityTier[];
  bleedSpecs: {
    bleedMm: number;
    safetyMarginMm: number;
    dpi: number;
    colorSpace: string;
  };
  gabaritos: {
    format: string;
    cdrUrl?: string;
    aiUrl?: string;
    psdUrl?: string;
    pdfUrl?: string;
  }[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  image: string;
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

export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'pre_impressao' | 'impressor' | 'acabamento' | 'expedicao' | 'vendedor';
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  companyName?: string;
  stateRegistration?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercent: number;
  freeShipping?: boolean;
  description: string;
  minSpend: number;
  active: boolean;
}

export type PickupPoint = BalcaoRetirada;
export type ProductQuantity = QuantityTier;
export type ProductPaper = PaperType;
export type ProductFinish = FinishOption;

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

export type OrderStatus = 
  | 'pendente_pagamento'
  | 'aprovado' 
  | 'pre_impressao' 
  | 'impressao' 
  | 'acabamento' 
  | 'embalado' 
  | 'pronto_retirada' 
  | 'entregue'
  | 'cancelado';

export interface Order {
  id: string;
  timestamp: string;
  status: OrderStatus;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItem[];
  payment: {
    method: 'pix' | 'credit' | 'boleto';
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
  timeline: {
    step: string;
    description: string;
    done: boolean;
    current?: boolean;
    timestamp: string;
  }[];
}

export interface CatalogData {
  siteInfo: SiteInfo;
  categories: Category[];
  products: Product[];
  pickupPoints: BalcaoRetirada[];
  coupons: Coupon[];
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

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: 'papel' | 'chapa_ctp' | 'tinta' | 'acabamento' | 'embalagem';
  unit: string; // 'resma', 'chapa', 'lata_kg', 'rolo_m', 'cento'
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
  sheetFormat: string; // ex: 66x96 cm
  finalFormat: string; // ex: 9x5 cm, A4, A5
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
