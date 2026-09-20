// ============================================================================
// DTOs & Contracts: Clients (Clientes)
// NestJS Controller: @Controller('clients') ou @Controller('clientes')
// ============================================================================

export interface CreateClientDto {
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
}

export interface UpdateClientDto {
  name?: string;
  whatsapp?: string;
  email?: string;
  cpfCnpj?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
}

export interface ClientQueryDto {
  search?: string;
  cidade?: string;
  estado?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'totalSpent' | 'ordersCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ClientResponseDto {
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
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientStatsDto {
  totalClients: number;
  activeClientsThisMonth: number;
  totalRevenue: number;
  topClients: {
    id: string;
    name: string;
    ordersCount: number;
    totalSpent: number;
  }[];
}
