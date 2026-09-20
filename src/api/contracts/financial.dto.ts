// ============================================================================
// DTOs & Contracts: Financial & Transactions (Financeiro, Caixa & DRE)
// NestJS Controller: @Controller('financial') ou @Controller('financeiro')
// ============================================================================

export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pago' | 'pendente';

export interface CreateTransactionDto {
  type: TransactionType;
  description: string;
  value: number;
  paymentMethod?: string;
  status: TransactionStatus;
  dueDate?: string;
  paidAt?: string;
  category?: string;
  observations?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
  orderCode?: string;
  documentNumber?: string;
  supplierName?: string;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  description?: string;
  value?: number;
  paymentMethod?: string;
  status?: TransactionStatus;
  dueDate?: string;
  paidAt?: string;
  category?: string;
  observations?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
  orderCode?: string;
  documentNumber?: string;
  supplierName?: string;
}

export interface TransactionQueryDto {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: string;
  clientId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'value';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionResponseDto {
  id: string;
  type: TransactionType;
  description: string;
  value: number;
  paymentMethod?: string;
  status: TransactionStatus;
  dueDate?: string;
  paidAt?: string;
  category?: string;
  observations?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
  orderCode?: string;
  documentNumber?: string;
  supplierName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FinancialSummaryDto {
  totalRevenue: number;
  totalExpense: number;
  currentBalance: number;
  pendingReceivables: number;
  pendingPayables: number;
  projectedBalance: number;
  period: string;
}

export interface DREItemDto {
  category: string;
  value: number;
  percentage: number;
}

export interface DREResponseDto {
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  operationalCosts: DREItemDto[];
  totalOperationalCosts: number;
  grossMargin: number;
  expenses: DREItemDto[];
  totalExpenses: number;
  netProfit: number;
  netProfitMarginPercentage: number;
}
