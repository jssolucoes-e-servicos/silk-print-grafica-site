// Cliente HTTP para comunicação da Loja Virtual (Next.js) com o Backend NestJS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchCatalog() {
  const res = await fetch(`${API_BASE_URL}/products`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Falha ao carregar catálogo');
  return res.json();
}

export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPickupPoints(state?: string) {
  const url = state && state !== 'TODOS' 
    ? `${API_BASE_URL}/pickup-points?state=${encodeURIComponent(state)}`
    : `${API_BASE_URL}/pickup-points`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createOrder(orderData: any) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return res.json();
}

export async function trackOrder(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderId)}`);
  return res.json();
}

export async function getPresignedUploadUrl(filename: string, contentType: string) {
  const res = await fetch(`${API_BASE_URL}/storage/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });
  return res.json();
}

export async function submitCustomQuote(quoteData: any) {
  const res = await fetch(`${API_BASE_URL}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteData),
  });
  return res.json();
}
