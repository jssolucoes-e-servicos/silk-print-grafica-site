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
  | 'contact';
