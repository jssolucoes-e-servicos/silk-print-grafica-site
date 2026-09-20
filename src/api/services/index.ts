// ============================================================================
// Unified API Services Export
// ============================================================================

import { authService } from './auth.service';
import { usersService } from './users.service';
import { profilesService } from './profiles.service';
import { clientsService } from './clients.service';
import { productsService } from './products.service';
import { finishingsService } from './finishings.service';
import { quotesService } from './quotes.service';
import { ordersService } from './orders.service';
import { financialService } from './financial.service';
import { storageService } from './storage.service';
import { integrationsService } from './integrations.service';
import { aiService } from './ai.service';

export * from './auth.service';
export * from './users.service';
export * from './profiles.service';
export * from './clients.service';
export * from './products.service';
export * from './finishings.service';
export * from './quotes.service';
export * from './orders.service';
export * from './financial.service';
export * from './storage.service';
export * from './integrations.service';
export * from './ai.service';

/**
 * Objeto central com todos os serviços da API agrupados
 * Exemplo de uso:
 *  const clientes = await api.clients.getAll();
 *  const pedido = await api.orders.create(novoPedido);
 */
export const api = {
  auth: authService,
  users: usersService,
  profiles: profilesService,
  clients: clientsService,
  products: productsService,
  finishings: finishingsService,
  quotes: quotesService,
  orders: ordersService,
  financial: financialService,
  storage: storageService,
  integrations: integrationsService,
  ai: aiService,
};
