import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{0,3})/, '$1-$2');
}

/**
 * Formats production time in working days (Dias Úteis) instead of hours.
 * Supports both hour inputs (e.g. 24, 48, 72h) and direct day inputs (1, 2, 3 dias).
 */
export function getProductionDaysCount(value?: number | string): number {
  if (!value) return 1;
  const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) || 1 : value;
  if (num <= 10) return Math.max(1, Math.round(num));
  return Math.max(1, Math.round(num / 24));
}

export function formatProductionDays(value?: number | string): string {
  if (typeof value === 'string' && value.toLowerCase().includes('dia')) {
    return value;
  }
  const days = getProductionDaysCount(value);
  return days === 1 ? '1 dia útil' : `${days} dias úteis`;
}
