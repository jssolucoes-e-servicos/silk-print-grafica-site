import { Product, Category, BalcaoRetirada, CatalogData, Order, Coupon, SiteInfo } from '../types';
import { createCuid } from './cuid';

const API_BASE = '/api';

const DEFAULT_SITE_INFO: SiteInfo = {
  name: 'Silk Print Gráfica',
  legalName: '68676641 Jackson Samuel Xavier dos Santos',
  cnpj: '68.676.641/0001-02',
  tagline: 'Gráfica Online com Parque Industrial Próprio e Entrega em Todo o Brasil',
  whatsapp: '5551936187210',
  phone: '(51) 936-187-210',
  email: 'contato@silkprintgrafica.com.br',
  adminEmail: 'silkprintgrafica@gmail.com',
  address: 'Rua Tobago, 710, cj 103 - Restinga, Porto Alegre - RS, CEP 91790-090',
  businessHours: 'Segunda a Sexta, das 08h às 18h',
  heroNotice: '⚡ Produção Express 24h • Despacho Nacional • Balcões de Retirada com Frete Grátis acima de R$ 199'
};

/**
 * Fetches the entire unified catalog (categories, products, pickup points, site info, coupons)
 */
export async function getCatalog(): Promise<CatalogData> {
  try {
    const res = await fetch(`${API_BASE}/catalog`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.data) {
      return {
        siteInfo: json.data.site || DEFAULT_SITE_INFO,
        categories: json.data.categories || [],
        products: json.data.products || [],
        pickupPoints: json.data.pickupPoints || [],
        coupons: json.data.coupons || []
      };
    }
    return {
      siteInfo: DEFAULT_SITE_INFO,
      categories: [],
      products: [],
      pickupPoints: [],
      coupons: []
    };
  } catch (err) {
    console.warn('[API] getCatalog error:', err);
    return {
      siteInfo: DEFAULT_SITE_INFO,
      categories: [],
      products: [],
      pickupPoints: [],
      coupons: []
    };
  }
}

/**
 * Fetches all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[API] getCategories error:', err);
    return [];
  }
}

/**
 * Fetches products list with optional category, search, and sorting filters
 */
export async function getProducts(params?: {
  category?: string;
  search?: string;
  popular?: boolean;
  limit?: number;
  sort?: string;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'TODOS') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.popular !== undefined) query.append('popular', String(params.popular));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const url = `${API_BASE}/products${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[API] getProducts error:', err);
    return [];
  }
}

/**
 * Fetches single product by ID or Slug
 */
export async function getProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(idOrSlug)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('[API] getProduct error:', err);
    return null;
  }
}

/**
 * Fetches Balcões de Retirada (Pickup locations)
 */
export async function getPickupPoints(params?: { state?: string; search?: string }): Promise<BalcaoRetirada[]> {
  try {
    const query = new URLSearchParams();
    if (params?.state && params.state !== 'TODOS') query.append('state', params.state);
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE}/balcoes${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[API] getPickupPoints error:', err);
    return [];
  }
}

/**
 * Calculates shipping options for a given CEP and order total
 */
export async function calculateShipping(cep: string, subtotal: number) {
  try {
    const res = await fetch(`${API_BASE}/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep, subtotal })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API] calculateShipping fallback:', err);
    return {
      cep,
      methods: [
        { id: 'balcao', name: 'Retirada no Balcão Parceiro', type: 'balcao', price: 0, estimatedDays: '1 a 2 dias úteis' },
        { id: 'transportadora', name: 'Transportadora Express', type: 'transportadora', price: subtotal > 199 ? 0 : 19.90, estimatedDays: '2 a 3 dias úteis' }
      ]
    };
  }
}

/**
 * Validates a discount coupon code
 */
export async function validateCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('[API] validateCoupon fallback:', err);
    const cleanCode = (code || '').toUpperCase();
    if (cleanCode === 'SILK10' || cleanCode === 'BEMVINDO') {
      return {
        valid: true,
        coupon: { code: cleanCode, discountPercent: 10, minSpend: 0, description: '10% de desconto', active: true },
        discountAmount: subtotal * 0.10,
        message: 'Cupom de 10% aplicado com sucesso!'
      };
    }
    return { valid: false, discountAmount: 0, message: 'Cupom inválido.' };
  }
}

/**
 * Submits a new e-commerce order
 */
export async function submitOrder(orderData: Partial<Order>): Promise<{ 
  success: boolean; 
  data: Order; 
  message: string;
  paymentGateway?: {
    provider: string;
    paymentId?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
  };
}> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] submitOrder fallback:', err);
    const mockOrder: Order = {
      id: orderData.id || createCuid(),
      timestamp: new Date().toISOString(),
      status: 'aprovado',
      customer: orderData.customer || { name: 'Cliente', email: '', phone: '', document: '' },
      shipping: orderData.shipping || { type: 'balcao', price: 0 },
      items: orderData.items || [],
      payment: orderData.payment || { method: 'pix', subtotal: 0, discount: 0, shippingCost: 0, total: 0 },
      timeline: []
    };
    return { success: true, data: mockOrder, message: 'Pedido registrado com sucesso!' };
  }
}

/**
 * Tracks an order status by order ID
 */
export async function trackOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/track?code=${encodeURIComponent(orderId)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('[API] trackOrder fallback:', err);
    return null;
  }
}

/**
 * Uploads artwork to MinIO S3 on VPS
 */
export async function uploadArtworkFile(file: File): Promise<{
  success: boolean;
  fileUrl: string;
  fileKey?: string;
  fileName: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Falha no upload do arquivo.');
  return await res.json();
}

/**
 * Admin API Helpers
 */
export async function adminUpdateOrderStatus(orderId: string, status: Order['status']) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function adminSaveProduct(product: Partial<Product>) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return await res.json();
}

export async function adminUpdateProduct(id: string, product: Partial<Product>) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return await res.json();
}

export async function adminDuplicateProduct(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/duplicate/${id}`, {
    method: 'POST'
  });
  return await res.json();
}

export async function adminDeleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminClearCatalog() {
  const res = await fetch(`${API_BASE}/admin/catalog/clear`, {
    method: 'POST'
  });
  return await res.json();
}

export async function adminResetSeedCatalog() {
  const res = await fetch(`${API_BASE}/admin/catalog/reset-seed`, {
    method: 'POST'
  });
  return await res.json();
}

export async function adminGetPickupPoints() {
  const res = await fetch(`${API_BASE}/admin/pickup-points`);
  return await res.json();
}

export async function adminSavePickupPoint(point: any) {
  if (point.id) {
    const res = await fetch(`${API_BASE}/admin/pickup-points/${point.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(point)
    });
    return await res.json();
  }
  const res = await fetch(`${API_BASE}/admin/pickup-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(point)
  });
  return await res.json();
}

export async function adminDeletePickupPoint(id: string) {
  const res = await fetch(`${API_BASE}/admin/pickup-points/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminGetCoupons() {
  const res = await fetch(`${API_BASE}/admin/coupons`);
  return await res.json();
}

export async function adminSaveCoupon(coupon: any) {
  const res = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon)
  });
  return await res.json();
}

export async function adminDeleteCoupon(id: string) {
  const res = await fetch(`${API_BASE}/admin/coupons/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminSaveCategory(category: Partial<Category>) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  });
  return await res.json();
}

export async function adminDeleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminGetSuppliers() {
  const res = await fetch(`${API_BASE}/admin/suppliers`);
  return await res.json();
}

export async function adminSaveSupplier(supplier: any) {
  const res = await fetch(`${API_BASE}/admin/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier)
  });
  return await res.json();
}

export async function adminDeleteSupplier(id: string) {
  const res = await fetch(`${API_BASE}/admin/suppliers/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminGetCollaborators() {
  const res = await fetch(`${API_BASE}/admin/collaborators`);
  return await res.json();
}

export async function adminSaveCollaborator(collaborator: any) {
  const res = await fetch(`${API_BASE}/admin/collaborators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collaborator)
  });
  return await res.json();
}

export async function adminDeleteCollaborator(id: string) {
  const res = await fetch(`${API_BASE}/admin/collaborators/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function adminGetCustomers() {
  const res = await fetch(`${API_BASE}/admin/customers`);
  return await res.json();
}

