import catalogJson from '../data/catalog.json';
import { createId } from '@paralleldrive/cuid2';
import { CatalogData, Product, Category, BalcaoRetirada, Coupon, Order, SiteInfo } from '../types';

// In-memory catalog state initialized with catalog.json
export let catalogState: CatalogData = JSON.parse(JSON.stringify(catalogJson));

// In-memory orders state (clean - orders persist in PostgreSQL)
export const ordersLog: Order[] = [];

export function getFullCatalog(): CatalogData {
  return catalogState;
}

export function getSiteInfo(): SiteInfo {
  return catalogState.siteInfo;
}

export function getAllCategories(): (Category & { productCount: number })[] {
  return catalogState.categories.map(cat => ({
    ...cat,
    productCount: catalogState.products.filter(p => p.categorySlug === cat.slug).length
  }));
}

export function getCategoryBySlug(slug: string): (Category & { products: Product[] }) | null {
  const category = catalogState.categories.find(c => c.slug === slug || c.id === slug);
  if (!category) return null;
  const products = catalogState.products.filter(p => p.categorySlug === category.slug);
  return { ...category, products };
}

export function getAllProducts(filter?: {
  category?: string;
  search?: string;
  popular?: boolean;
  limit?: number;
  sort?: string;
}): { total: number; products: Product[] } {
  let list = [...catalogState.products];

  if (filter?.category && filter.category !== 'TODOS') {
    list = list.filter(p => p.categorySlug === filter.category || p.category.toLowerCase() === filter.category?.toLowerCase());
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (filter?.popular !== undefined) {
    list = list.filter(p => Boolean(p.popular) === filter.popular);
  }

  if (filter?.sort === 'price_asc') {
    list.sort((a, b) => a.basePrice - b.basePrice);
  } else if (filter?.sort === 'price_desc') {
    list.sort((a, b) => b.basePrice - a.basePrice);
  } else if (filter?.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = list.length;
  if (filter?.limit && filter.limit > 0) {
    list = list.slice(0, filter.limit);
  }

  return { total, products: list };
}

export function getProductByIdOrSlug(idOrSlug: string): Product | null {
  return catalogState.products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export function createProduct(product: Product): Product {
  const existingIndex = catalogState.products.findIndex(p => p.id === product.id || p.slug === product.slug);
  if (existingIndex >= 0) {
    catalogState.products[existingIndex] = product;
  } else {
    catalogState.products.push(product);
  }
  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = catalogState.products.findIndex(p => p.id === id);
  if (index === -1) return null;
  catalogState.products[index] = { ...catalogState.products[index], ...updates };
  return catalogState.products[index];
}

export function deleteProduct(id: string): boolean {
  const initialLen = catalogState.products.length;
  catalogState.products = catalogState.products.filter(p => p.id !== id);
  return catalogState.products.length < initialLen;
}

export function getPickupPoints(filter?: { state?: string; search?: string }): BalcaoRetirada[] {
  let list = [...catalogState.pickupPoints];
  if (filter?.state && filter.state !== 'TODOS') {
    list = list.filter(b => b.state.toUpperCase() === filter.state?.toUpperCase());
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.neighborhood.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
  }
  return list;
}

export function deletePickupPoint(id: string): boolean {
  if (catalogState.pickupPoints) {
    const initialLen = catalogState.pickupPoints.length;
    catalogState.pickupPoints = catalogState.pickupPoints.filter(b => String(b.id) !== String(id));
    return catalogState.pickupPoints.length < initialLen;
  }
  return false;
}

export function getGabaritosCatalog() {
  return catalogState.products.map(prod => ({
    productId: prod.id,
    productName: prod.name,
    category: prod.category,
    image: prod.image,
    defaultFormat: prod.defaultFormat,
    bleedSpecs: prod.bleedSpecs,
    formats: prod.gabaritos.map(g => ({
      format: g.format,
      downloads: {
        pdf: g.pdfUrl || '#',
        cdr: g.cdrUrl || '#',
        ai: g.aiUrl || '#',
        psd: g.psdUrl || '#'
      }
    }))
  }));
}

export function validateCoupon(code: string, subtotal: number): {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
} {
  const cleanCode = (code || '').trim().toUpperCase();
  const coupon = catalogState.coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);
  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Cupom inválido ou expirado.' };
  }
  if (subtotal < coupon.minSpend) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Este cupom requer pedido mínimo de R$ ${coupon.minSpend.toFixed(2)}.`
    };
  }
  const discountAmount = (subtotal * coupon.discountPercent) / 100;
  return {
    valid: true,
    coupon,
    discountAmount,
    message: `Cupom ${coupon.code} aplicado com sucesso! (${coupon.discountPercent}% OFF)`
  };
}

export function calculateShippingQuotes(cep: string, subtotal: number) {
  const cleanCep = (cep || '').replace(/\D/g, '');
  const isSP = cleanCep.startsWith('0');
  const isSudeste = cleanCep.startsWith('1') || cleanCep.startsWith('2') || cleanCep.startsWith('3');
  
  const sedexPrice = isSP ? 18.90 : isSudeste ? 28.50 : 42.00;
  const pacPrice = isSP ? 12.50 : isSudeste ? 19.90 : 29.90;
  const transportadoraPrice = subtotal > 199 ? 0 : isSP ? 15.00 : 24.00;

  return {
    cep: cleanCep,
    methods: [
      {
        id: 'balcao',
        name: 'Retirada no Balcão Parceiro',
        type: 'balcao',
        price: 0,
        estimatedDays: isSP ? '1 a 2 dias úteis' : '2 a 4 dias úteis',
        highlight: 'Mais Econômico / Grátis'
      },
      {
        id: 'transportadora',
        name: 'Transportadora Express Silk Print',
        type: 'transportadora',
        price: transportadoraPrice,
        estimatedDays: isSP ? '1 dia útil' : '2 a 3 dias úteis',
        highlight: subtotal > 199 ? 'Frete Grátis' : undefined
      },
      {
        id: 'sedex',
        name: 'Correios SEDEX Express',
        type: 'sedex',
        price: sedexPrice,
        estimatedDays: isSP ? '1 dia útil' : '1 a 2 dias úteis'
      },
      {
        id: 'pac',
        name: 'Correios PAC Econômico',
        type: 'pac',
        price: pacPrice,
        estimatedDays: isSP ? '3 a 5 dias úteis' : '5 a 8 dias úteis'
      }
    ]
  };
}

export function createOrder(orderPayload: Partial<Order>): Order {
  const id = orderPayload.id || createId();
  const now = new Date().toISOString();

  const items = (orderPayload.items || []).map(it => ({
    ...it,
    id: it.id || createId()
  }));

  const order: Order = {
    id,
    timestamp: now,
    status: 'aprovado',
    customer: orderPayload.customer || {
      name: 'Cliente',
      email: '',
      phone: '',
      document: ''
    },
    shipping: orderPayload.shipping || {
      type: 'balcao',
      price: 0
    },
    items,
    payment: orderPayload.payment || {
      method: 'pix',
      subtotal: 0,
      discount: 0,
      shippingCost: 0,
      total: 0
    },
    couponApplied: orderPayload.couponApplied,
    timeline: [
      {
        step: 'Pedido Recebido & Pagamento Aprovado',
        description: 'Pedido registrado e pagamento autorizado com sucesso.',
        done: true,
        current: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      },
      {
        step: 'Pré-impressão & RIP de Arquivos',
        description: 'Checagem automática de sangria, margens e perfil de cor CMYK.',
        done: true,
        current: true,
        timestamp: 'Em andamento'
      },
      {
        step: 'Gravação CTP & Impressão Gráfica',
        description: 'Impressão em parque gráfico industrial de alta performance.',
        done: false,
        timestamp: 'Próxima etapa'
      },
      {
        step: 'Enobrecimento & Acabamentos',
        description: 'Aplicação de verniz, laminação e corte/refile de precisão.',
        done: false,
        timestamp: 'Aguardando impressão'
      },
      {
        step: 'Expedição & Envio para Balcão / Endereço',
        description: 'Conferência de qualidade, embalagem protetora e despacho.',
        done: false,
        timestamp: 'Logística programada'
      }
    ]
  };

  ordersLog.unshift(order);
  if (ordersLog.length > 500) ordersLog.pop();
  return order;
}

export function getAllOrders(): Order[] {
  return ordersLog;
}

export function getOrderById(id: string): Order | null {
  const cleanId = (id || '').trim().toUpperCase();
  return ordersLog.find(o => o.id.toUpperCase() === cleanId) || null;
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const order = getOrderById(id);
  if (!order) return null;
  order.status = status;

  // Update timeline
  const stepMap: Record<Order['status'], number> = {
    pendente_pagamento: 0,
    aprovado: 0,
    pre_impressao: 1,
    impressao: 2,
    acabamento: 3,
    embalado: 4,
    pronto_retirada: 4,
    entregue: 4,
    cancelado: 0,
  };

  const currentIdx = stepMap[status] ?? 0;
  order.timeline = order.timeline.map((step, idx) => ({
    ...step,
    done: idx <= currentIdx,
    current: idx === currentIdx,
  }));

  return order;
}

export { createId };

// In-memory suppliers, collaborators & customers (clean - persist in PostgreSQL)
export let suppliersState: any[] = [];
export let collaboratorsState: any[] = [];
export let customersState: any[] = [];

// CRUD Fornecedores
export function getSuppliers() { return suppliersState; }
export function createSupplier(sup: any) {
  const newSup = { ...sup, id: createId(), createdAt: new Date().toISOString() };
  suppliersState.unshift(newSup);
  return newSup;
}
export function deleteSupplier(id: string) {
  suppliersState = suppliersState.filter(s => s.id !== id);
  return true;
}

// CRUD Colaboradores
export function getCollaborators() { return collaboratorsState; }
export function createCollaborator(col: any) {
  const newCol = { ...col, id: createId(), createdAt: new Date().toISOString() };
  collaboratorsState.unshift(newCol);
  return newCol;
}
export function deleteCollaborator(id: string) {
  collaboratorsState = collaboratorsState.filter(c => c.id !== id);
  return true;
}

// Clientes
export function getCustomers() { return customersState; }
export function createOrUpdateCustomer(cust: any) {
  const existing = customersState.find(c => c.email === cust.email || c.document === cust.document);
  if (existing) {
    existing.totalOrders += 1;
    existing.totalSpent += (cust.orderTotal || 0);
    existing.lastOrderAt = new Date().toISOString();
    return existing;
  }
  const newCust = {
    id: createId(),
    name: cust.name,
    email: cust.email,
    phone: cust.phone,
    document: cust.document,
    companyName: cust.companyName || '',
    totalOrders: 1,
    totalSpent: cust.orderTotal || 0,
    lastOrderAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  customersState.unshift(newCust);
  return newCust;
}

// Categorias CRUD
export function createCategory(category: Category): Category {
  const existingIndex = catalogState.categories.findIndex(c => c.id === category.id || c.slug === category.slug);
  if (existingIndex >= 0) {
    catalogState.categories[existingIndex] = category;
  } else {
    catalogState.categories.push(category);
  }
  return category;
}

export function deleteCategory(id: string): boolean {
  catalogState.categories = catalogState.categories.filter(c => c.id !== id && c.slug !== id);
  return true;
}
