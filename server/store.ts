import fs from 'fs';
import path from 'path';
import {
  Client,
  Order,
  Quote,
  Transaction,
  CatalogProduct,
  FinishingItem,
  AccessProfile,
  UserEmployee,
} from '../src/types';
import {
  INITIAL_ACCESS_PROFILES,
} from '../src/lib/permissionsEngine';
import { CATALOG_PRODUCTS as INITIAL_PRODUCTS } from '../src/data/mockData';
import { isPostgresReady, executeSqlQuery } from './db';
import { hashPassword, MASTER_ADMIN_SEED } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'silkprint_store.json');

export interface AppStoreData {
  clients: Client[];
  orders: Order[];
  quotes: Quote[];
  transactions: Transaction[];
  products: CatalogProduct[];
  finishings: FinishingItem[];
  employees: (UserEmployee & { passwordHash?: string; salt?: string; isMaster?: boolean })[];
  accessProfiles: AccessProfile[];
  isRealDataOnly: boolean;
  lastUpdated: string;
}

const defaultMasterAdmin: UserEmployee & { passwordHash?: string; salt?: string; isMaster?: boolean } = {
  id: MASTER_ADMIN_SEED.id,
  name: MASTER_ADMIN_SEED.name,
  email: MASTER_ADMIN_SEED.email,
  whatsapp: MASTER_ADMIN_SEED.whatsapp,
  avatar: MASTER_ADMIN_SEED.avatar,
  jobTitle: MASTER_ADMIN_SEED.jobTitle,
  department: MASTER_ADMIN_SEED.department,
  status: MASTER_ADMIN_SEED.status,
  isMaster: true,
  profileIds: MASTER_ADMIN_SEED.profileIds,
  customPermissions: MASTER_ADMIN_SEED.customPermissions,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  ...hashPassword(MASTER_ADMIN_SEED.defaultPassword),
};

let store: AppStoreData = {
  clients: [],
  orders: [],
  quotes: [],
  transactions: [],
  products: [],
  finishings: [],
  employees: [defaultMasterAdmin],
  accessProfiles: [...INITIAL_ACCESS_PROFILES],
  isRealDataOnly: true,
  lastUpdated: new Date().toISOString(),
};

// Ensure data directory and load store
function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      
      let loadedEmployees = parsed.employees || [];
      if (loadedEmployees.length === 0 || !loadedEmployees.some((e: any) => e.email === MASTER_ADMIN_SEED.email)) {
        loadedEmployees = [defaultMasterAdmin, ...loadedEmployees];
      } else {
        // Ensure master admin has valid hash
        const adminIdx = loadedEmployees.findIndex((e: any) => e.email === MASTER_ADMIN_SEED.email);
        if (adminIdx >= 0 && (!loadedEmployees[adminIdx].passwordHash || !loadedEmployees[adminIdx].salt)) {
          const { hash, salt } = hashPassword(MASTER_ADMIN_SEED.defaultPassword);
          loadedEmployees[adminIdx].passwordHash = hash;
          loadedEmployees[adminIdx].salt = salt;
          loadedEmployees[adminIdx].isMaster = true;
        }
      }

      let loadedProducts = parsed.products || [];
      if (loadedProducts.length === 0) {
        loadedProducts = [...INITIAL_PRODUCTS];
      }

      store = {
        clients: parsed.clients || [],
        orders: parsed.orders || [],
        quotes: parsed.quotes || [],
        transactions: parsed.transactions || [],
        products: loadedProducts,
        finishings: parsed.finishings || [],
        employees: loadedEmployees,
        accessProfiles: (parsed.accessProfiles && parsed.accessProfiles.length > 0) ? parsed.accessProfiles : [...INITIAL_ACCESS_PROFILES],
        isRealDataOnly: true,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
      console.log(`[Store] Dados carregados do arquivo local (${store.clients.length} clientes, ${store.orders.length} pedidos, ${store.products.length} produtos).`);
    } else {
      saveStoreToFile();
      console.log('[Store] Arquivo local de persistência criado em:', STORE_FILE);
    }
  } catch (err: any) {
    console.error('[Store] Erro ao inicializar store em disco:', err.message);
  }
}

function saveStoreToFile() {
  try {
    store.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('[Store] Erro ao gravar store em disco:', err.message);
  }
}

initStore();

export const dataStore = {
  getStoreData(): AppStoreData {
    return { ...store };
  },

  getStatus() {
    return {
      isRealDataOnly: store.isRealDataOnly,
      clientsCount: store.clients.length,
      ordersCount: store.orders.length,
      quotesCount: store.quotes.length,
      transactionsCount: store.transactions.length,
      productsCount: store.products.length,
      finishingsCount: store.finishings.length,
      employeesCount: store.employees.length,
      profilesCount: store.accessProfiles.length,
      lastUpdated: store.lastUpdated,
      postgresConnected: isPostgresReady(),
    };
  },

  // Clear demo data to start pure production real data
  clearDemoData() {
    store = {
      clients: [],
      orders: [],
      quotes: [],
      transactions: [],
      products: [],
      finishings: [],
      employees: store.employees.length > 0 ? [store.employees[0]] : [defaultMasterAdmin],
      accessProfiles: store.accessProfiles.length > 0 ? store.accessProfiles : [...INITIAL_ACCESS_PROFILES],
      isRealDataOnly: true,
      lastUpdated: new Date().toISOString(),
    };
    saveStoreToFile();
    return { success: true, message: 'Dados de demonstração limpos com sucesso. O sistema agora opera 100% com dados reais.' };
  },

  // ================= CLIENTS =================
  async getClients(): Promise<Client[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM clients ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgClients: Client[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            whatsapp: r.whatsapp,
            email: r.email || undefined,
            cpfCnpj: r.cpf_cnpj || undefined,
            cep: r.cep || undefined,
            endereco: r.endereco || undefined,
            numero: r.numero || undefined,
            bairro: r.bairro || undefined,
            cidade: r.cidade || undefined,
            estado: r.estado || undefined,
            observacoes: r.observacoes || undefined,
            ordersCount: parseInt(r.orders_count || '0', 10),
            totalSpent: parseFloat(r.total_spent || '0'),
            createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          store.clients = pgClients;
          saveStoreToFile();
          return pgClients;
        }
      } catch (err) {
        console.error('[Store Clients PG Error]:', err);
      }
    }
    return store.clients;
  },

  async saveClient(client: Client): Promise<Client> {
    const existingIndex = store.clients.findIndex((c) => c.id === client.id);
    if (existingIndex >= 0) {
      store.clients[existingIndex] = client;
    } else {
      store.clients.unshift(client);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO clients (id, name, whatsapp, email, cpf_cnpj, cep, endereco, numero, bairro, cidade, estado, observacoes, orders_count, total_spent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO UPDATE SET 
             name = EXCLUDED.name,
             whatsapp = EXCLUDED.whatsapp,
             email = EXCLUDED.email,
             cpf_cnpj = EXCLUDED.cpf_cnpj,
             cep = EXCLUDED.cep,
             endereco = EXCLUDED.endereco,
             numero = EXCLUDED.numero,
             bairro = EXCLUDED.bairro,
             cidade = EXCLUDED.cidade,
             estado = EXCLUDED.estado,
             observacoes = EXCLUDED.observacoes,
             orders_count = EXCLUDED.orders_count,
             total_spent = EXCLUDED.total_spent,
             updated_at = NOW()`,
          [
            client.id,
            client.name,
            client.whatsapp,
            client.email || null,
            client.cpfCnpj || null,
            client.cep || null,
            client.endereco || null,
            client.numero || null,
            client.bairro || null,
            client.cidade || null,
            client.estado || null,
            client.observacoes || null,
            client.ordersCount || 0,
            client.totalSpent || 0,
            client.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveClient PG Error]:', err);
      }
    }

    return client;
  },

  async deleteClient(id: string): Promise<boolean> {
    store.clients = store.clients.filter((c) => c.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM clients WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteClient PG Error]:', err);
      }
    }
    return true;
  },

  // ================= ORDERS =================
  async getOrders(): Promise<Order[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM orders ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgOrders: Order[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            code: r.code,
            clientId: r.client_id || undefined,
            clientName: r.client_name,
            clientWhatsapp: r.client_whatsapp,
            clientCpf: r.client_cpf || undefined,
            clientEmail: r.client_email || undefined,
            cep: r.cep || undefined,
            endereco: r.endereco || undefined,
            numero: r.numero || undefined,
            bairro: r.bairro || undefined,
            cidade: r.cidade || undefined,
            estado: r.estado || undefined,
            description: r.description,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
            itemsCount: parseInt(r.items_count || '1', 10),
            total: parseFloat(r.total || '0'),
            paidAmount: parseFloat(r.paid_amount || '0'),
            status: r.status,
            paymentStatus: r.payment_status,
            paymentMethod: r.payment_method || undefined,
            pixKey: r.pix_key || undefined,
            trackingCode: r.tracking_code || undefined,
            shippingCarrier: r.shipping_carrier || undefined,
            deliveryDate: r.delivery_date || undefined,
            notes: r.notes || undefined,
            isOnlineOrder: r.is_online_order || false,
            messages: typeof r.messages === 'string' ? JSON.parse(r.messages) : (r.messages || []),
            createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          store.orders = pgOrders;
          saveStoreToFile();
          return pgOrders;
        }
      } catch (err) {
        console.error('[Store Orders PG Error]:', err);
      }
    }
    return store.orders;
  },

  async saveOrder(order: Order): Promise<Order> {
    const existingIndex = store.orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      store.orders[existingIndex] = order;
    } else {
      store.orders.unshift(order);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO orders (id, code, client_id, client_name, client_whatsapp, client_cpf, client_email, cep, endereco, numero, bairro, cidade, estado, description, items, items_count, total, paid_amount, status, payment_status, payment_method, pix_key, tracking_code, shipping_carrier, delivery_date, notes, is_online_order, messages, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
           ON CONFLICT (id) DO UPDATE SET
             code = EXCLUDED.code,
             client_name = EXCLUDED.client_name,
             client_whatsapp = EXCLUDED.client_whatsapp,
             description = EXCLUDED.description,
             items = EXCLUDED.items,
             items_count = EXCLUDED.items_count,
             total = EXCLUDED.total,
             paid_amount = EXCLUDED.paid_amount,
             status = EXCLUDED.status,
             payment_status = EXCLUDED.payment_status,
             payment_method = EXCLUDED.payment_method,
             pix_key = EXCLUDED.pix_key,
             tracking_code = EXCLUDED.tracking_code,
             shipping_carrier = EXCLUDED.shipping_carrier,
             delivery_date = EXCLUDED.delivery_date,
             notes = EXCLUDED.notes,
             messages = EXCLUDED.messages,
             updated_at = NOW()`,
          [
            order.id,
            order.code,
            order.clientId || null,
            order.clientName,
            order.clientWhatsapp,
            order.clientCpf || null,
            order.clientEmail || null,
            order.cep || null,
            order.endereco || null,
            order.numero || null,
            order.bairro || null,
            order.cidade || null,
            order.estado || null,
            order.description,
            JSON.stringify(order.items || []),
            order.itemsCount || 1,
            order.total,
            order.paidAmount || 0,
            order.status,
            order.paymentStatus,
            order.paymentMethod || null,
            order.pixKey || null,
            order.trackingCode || null,
            order.shippingCarrier || null,
            order.deliveryDate || null,
            order.notes || null,
            order.isOnlineOrder || false,
            JSON.stringify(order.messages || []),
            order.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveOrder PG Error]:', err);
      }
    }
    return order;
  },

  async deleteOrder(id: string): Promise<boolean> {
    store.orders = store.orders.filter((o) => o.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM orders WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteOrder PG Error]:', err);
      }
    }
    return true;
  },

  // ================= QUOTES =================
  async getQuotes(): Promise<Quote[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM quotes ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgQuotes: Quote[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            number: r.number || r.code || `#ORC-${r.id}`,
            code: r.code || r.number,
            clientId: r.client_id || '',
            clientName: r.client_name,
            clientWhatsapp: r.client_whatsapp,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
            subtotal: parseFloat(r.subtotal || '0'),
            discount: parseFloat(r.discount || '0'),
            total: parseFloat(r.total || '0'),
            status: r.status || 'enviado',
            validityDate: r.validity_date || r.valid_until || new Date().toISOString().split('T')[0],
            validUntil: r.valid_until || r.validity_date,
            observations: r.observations || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          store.quotes = pgQuotes;
          saveStoreToFile();
          return pgQuotes;
        }
      } catch (err) {
        console.error('[Store Quotes PG Error]:', err);
      }
    }
    return store.quotes;
  },

  async saveQuote(quote: Quote): Promise<Quote> {
    const existingIndex = store.quotes.findIndex((q) => q.id === quote.id);
    if (existingIndex >= 0) {
      store.quotes[existingIndex] = quote;
    } else {
      store.quotes.unshift(quote);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO quotes (id, code, number, client_id, client_name, client_whatsapp, items, observations, valid_until, validity_date, subtotal, discount, total, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO UPDATE SET
             client_name = EXCLUDED.client_name,
             client_whatsapp = EXCLUDED.client_whatsapp,
             items = EXCLUDED.items,
             observations = EXCLUDED.observations,
             subtotal = EXCLUDED.subtotal,
             discount = EXCLUDED.discount,
             total = EXCLUDED.total,
             status = EXCLUDED.status,
             updated_at = NOW()`,
          [
            quote.id,
            quote.code || quote.number,
            quote.number || quote.code,
            quote.clientId || null,
            quote.clientName,
            quote.clientWhatsapp,
            JSON.stringify(quote.items || []),
            quote.observations || null,
            quote.validUntil || quote.validityDate || null,
            quote.validityDate || quote.validUntil || null,
            quote.subtotal || 0,
            quote.discount || 0,
            quote.total,
            quote.status || 'enviado',
            quote.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveQuote PG Error]:', err);
      }
    }
    return quote;
  },

  async deleteQuote(id: string): Promise<boolean> {
    store.quotes = store.quotes.filter((q) => q.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM quotes WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteQuote PG Error]:', err);
      }
    }
    return true;
  },

  // ================= PRODUCTS =================
  async getProducts(): Promise<CatalogProduct[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM products ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgProducts: CatalogProduct[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            price: parseFloat(r.price || '0'),
            basePrice: r.base_price ? parseFloat(r.base_price) : undefined,
            cost: r.cost ? parseFloat(r.cost) : undefined,
            unit: r.unit || 'un',
            minQty: parseInt(r.min_qty || '1', 10),
            image: r.image || '',
            description: r.description || undefined,
            isInternal: r.is_internal || false,
            isM2: r.is_m2 || false,
            baseM2Price: r.base_m2_price ? parseFloat(r.base_m2_price) : undefined,
            productionTime: r.production_time || undefined,
            paperType: r.paper_type || undefined,
            paperWeight: r.paper_weight || undefined,
            printType: r.print_type || undefined,
            compatibleFinishings: typeof r.compatible_finishings === 'string' ? JSON.parse(r.compatible_finishings) : (r.compatible_finishings || []),
            priceTiers: typeof r.price_tiers === 'string' ? JSON.parse(r.price_tiers) : (r.price_tiers || []),
          }));
          store.products = pgProducts;
          saveStoreToFile();
          return pgProducts;
        }
      } catch (err) {
        console.error('[Store Products PG Error]:', err);
      }
    }
    return store.products;
  },

  async saveProduct(product: CatalogProduct): Promise<CatalogProduct> {
    const existingIndex = store.products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      store.products[existingIndex] = product;
    } else {
      store.products.unshift(product);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO products (id, name, category, price, base_price, cost, unit, min_qty, image, description, is_internal, is_m2, base_m2_price, production_time, paper_type, paper_weight, print_type, compatible_finishings, price_tiers)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             price = EXCLUDED.price,
             base_price = EXCLUDED.base_price,
             cost = EXCLUDED.cost,
             unit = EXCLUDED.unit,
             min_qty = EXCLUDED.min_qty,
             image = EXCLUDED.image,
             description = EXCLUDED.description,
             is_internal = EXCLUDED.is_internal,
             is_m2 = EXCLUDED.is_m2,
             base_m2_price = EXCLUDED.base_m2_price,
             production_time = EXCLUDED.production_time,
             paper_type = EXCLUDED.paper_type,
             paper_weight = EXCLUDED.paper_weight,
             print_type = EXCLUDED.print_type,
             compatible_finishings = EXCLUDED.compatible_finishings,
             price_tiers = EXCLUDED.price_tiers,
             updated_at = NOW()`,
          [
            product.id,
            product.name,
            product.category,
            product.price,
            product.basePrice || null,
            product.cost || null,
            product.unit || 'un',
            product.minQty || 1,
            product.image || null,
            product.description || null,
            product.isInternal || false,
            product.isM2 || false,
            product.baseM2Price || null,
            product.productionTime || null,
            product.paperType || null,
            product.paperWeight || null,
            product.printType || null,
            JSON.stringify(product.compatibleFinishings || []),
            JSON.stringify((product as any).priceTiers || []),
          ]
        );
      } catch (err) {
        console.error('[Store saveProduct PG Error]:', err);
      }
    }
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    store.products = store.products.filter((p) => p.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM products WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteProduct PG Error]:', err);
      }
    }
    return true;
  },

  // ================= FINISHINGS =================
  async getFinishings(): Promise<FinishingItem[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM finishings ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgFinishings: FinishingItem[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            categories: r.categories ? (typeof r.categories === 'string' ? JSON.parse(r.categories) : r.categories) : undefined,
            linkGroup: r.link_group || undefined,
            linkGroups: r.link_groups ? (typeof r.link_groups === 'string' ? JSON.parse(r.link_groups) : r.link_groups) : undefined,
            price: parseFloat(r.price || '0'),
            cost: r.cost ? parseFloat(r.cost) : undefined,
            unit: r.unit || 'un',
            pricingType: r.pricing_type || 'unidade',
            active: r.is_active !== false,
            description: r.description || undefined,
            extraDays: r.extra_days || 0,
          }));
          store.finishings = pgFinishings;
          saveStoreToFile();
          return pgFinishings;
        }
      } catch (err) {
        console.error('[Store Finishings PG Error]:', err);
      }
    }
    return store.finishings;
  },

  async saveFinishing(finishing: FinishingItem): Promise<FinishingItem> {
    const existingIndex = store.finishings.findIndex((f) => f.id === finishing.id);
    if (existingIndex >= 0) {
      store.finishings[existingIndex] = finishing;
    } else {
      store.finishings.unshift(finishing);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO finishings (id, name, category, price, cost, unit, pricing_type, is_active, description, extra_days)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             price = EXCLUDED.price,
             cost = EXCLUDED.cost,
             unit = EXCLUDED.unit,
             pricing_type = EXCLUDED.pricing_type,
             is_active = EXCLUDED.is_active,
             description = EXCLUDED.description,
             extra_days = EXCLUDED.extra_days`,
          [
            finishing.id,
            finishing.name,
            finishing.category,
            finishing.price,
            finishing.cost || null,
            finishing.unit || 'un',
            finishing.pricingType,
            finishing.active !== false,
            finishing.description || null,
            finishing.extraDays || 0,
          ]
        );
      } catch (err) {
        console.error('[Store saveFinishing PG Error]:', err);
      }
    }
    return finishing;
  },

  async deleteFinishing(id: string): Promise<boolean> {
    store.finishings = store.finishings.filter((f) => f.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM finishings WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteFinishing PG Error]:', err);
      }
    }
    return true;
  },

  // ================= TRANSACTIONS =================
  async getTransactions(): Promise<Transaction[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM transactions ORDER BY created_at DESC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgTxs: Transaction[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            type: r.type,
            description: r.description,
            value: parseFloat(r.value || '0'),
            paymentMethod: r.payment_method || 'PIX',
            status: r.status || 'pago',
            dueDate: r.due_date || undefined,
            category: r.category || 'Geral',
            observations: r.observations || undefined,
            clientName: r.client_name || undefined,
            clientId: r.client_id || undefined,
            orderId: r.order_id || undefined,
            orderCode: r.order_code || undefined,
            paidAt: r.paid_at || undefined,
            documentNumber: r.document_number || undefined,
            supplierName: r.supplier_name || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          store.transactions = pgTxs;
          saveStoreToFile();
          return pgTxs;
        }
      } catch (err) {
        console.error('[Store Transactions PG Error]:', err);
      }
    }
    return store.transactions;
  },

  async saveTransaction(tx: Transaction): Promise<Transaction> {
    const existingIndex = store.transactions.findIndex((t) => t.id === tx.id);
    if (existingIndex >= 0) {
      store.transactions[existingIndex] = tx;
    } else {
      store.transactions.unshift(tx);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO transactions (id, type, description, value, payment_method, status, due_date, category, observations, client_name, client_id, order_id, order_code, paid_at, document_number, supplier_name, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type,
             description = EXCLUDED.description,
             value = EXCLUDED.value,
             payment_method = EXCLUDED.payment_method,
             status = EXCLUDED.status,
             due_date = EXCLUDED.due_date,
             category = EXCLUDED.category,
             observations = EXCLUDED.observations,
             client_name = EXCLUDED.client_name,
             paid_at = EXCLUDED.paid_at`,
          [
            tx.id,
            tx.type,
            tx.description,
            tx.value,
            tx.paymentMethod,
            tx.status,
            tx.dueDate || null,
            tx.category,
            tx.observations || null,
            tx.clientName || null,
            tx.clientId || null,
            tx.orderId || null,
            tx.orderCode || null,
            tx.paidAt || null,
            tx.documentNumber || null,
            tx.supplierName || null,
            tx.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveTransaction PG Error]:', err);
      }
    }
    return tx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    store.transactions = store.transactions.filter((t) => t.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM transactions WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteTransaction PG Error]:', err);
      }
    }
    return true;
  },

  // ================= EMPLOYEES & PROFILES =================
  async getEmployees(): Promise<UserEmployee[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM employees ORDER BY created_at ASC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgEmployees: UserEmployee[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            whatsapp: r.whatsapp,
            avatar: r.avatar || undefined,
            jobTitle: r.job_title,
            department: r.department,
            status: r.status,
            profileIds: typeof r.profile_ids === 'string' ? JSON.parse(r.profile_ids) : (r.profile_ids || []),
            customPermissions: typeof r.custom_permissions === 'string' ? JSON.parse(r.custom_permissions) : (r.custom_permissions || []),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            lastLogin: r.last_login || undefined,
          }));
          store.employees = pgEmployees;
          saveStoreToFile();
          return pgEmployees;
        }
      } catch (err) {
        console.error('[Store Employees PG Error]:', err);
      }
    }
    return store.employees;
  },

  async saveEmployee(emp: UserEmployee): Promise<UserEmployee> {
    const existingIndex = store.employees.findIndex((e) => e.id === emp.id);
    if (existingIndex >= 0) {
      store.employees[existingIndex] = emp;
    } else {
      store.employees.push(emp);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO employees (id, name, email, password_hash, salt, whatsapp, avatar, job_title, department, status, is_master, profile_ids, custom_permissions, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             password_hash = COALESCE(EXCLUDED.password_hash, employees.password_hash),
             salt = COALESCE(EXCLUDED.salt, employees.salt),
             whatsapp = EXCLUDED.whatsapp,
             avatar = EXCLUDED.avatar,
             job_title = EXCLUDED.job_title,
             department = EXCLUDED.department,
             status = EXCLUDED.status,
             is_master = EXCLUDED.is_master,
             profile_ids = EXCLUDED.profile_ids,
             custom_permissions = EXCLUDED.custom_permissions`,
          [
            emp.id,
            emp.name,
            emp.email,
            (emp as any).passwordHash || null,
            (emp as any).salt || null,
            emp.whatsapp,
            emp.avatar || null,
            emp.jobTitle,
            emp.department,
            emp.status,
            (emp as any).isMaster || false,
            JSON.stringify(emp.profileIds || []),
            JSON.stringify(emp.customPermissions || []),
            emp.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveEmployee PG Error]:', err);
      }
    }
    return emp;
  },

  async findEmployeeByEmail(email: string): Promise<(UserEmployee & { passwordHash?: string; salt?: string; isMaster?: boolean }) | null> {
    const normalized = email.toLowerCase().trim();
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM employees WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
        if (queryRes.rows && queryRes.rows.length > 0) {
          const r = queryRes.rows[0];
          return {
            id: r.id,
            name: r.name,
            email: r.email,
            passwordHash: r.password_hash,
            salt: r.salt,
            whatsapp: r.whatsapp,
            avatar: r.avatar || undefined,
            jobTitle: r.job_title,
            department: r.department,
            status: r.status || 'Ativo',
            isMaster: r.is_master || false,
            profileIds: typeof r.profile_ids === 'string' ? JSON.parse(r.profile_ids) : (r.profile_ids || []),
            customPermissions: typeof r.custom_permissions === 'string' ? JSON.parse(r.custom_permissions) : (r.custom_permissions || []),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
          };
        }
      } catch (err) {
        console.error('[Store findEmployeeByEmail PG Error]:', err);
      }
    }

    const localFound = store.employees.find((e) => e.email.toLowerCase().trim() === normalized);
    return localFound || null;
  },

  async findEmployeeById(id: string): Promise<(UserEmployee & { passwordHash?: string; salt?: string; isMaster?: boolean }) | null> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM employees WHERE id = $1 LIMIT 1', [id]);
        if (queryRes.rows && queryRes.rows.length > 0) {
          const r = queryRes.rows[0];
          return {
            id: r.id,
            name: r.name,
            email: r.email,
            passwordHash: r.password_hash,
            salt: r.salt,
            whatsapp: r.whatsapp,
            avatar: r.avatar || undefined,
            jobTitle: r.job_title,
            department: r.department,
            status: r.status || 'Ativo',
            isMaster: r.is_master || false,
            profileIds: typeof r.profile_ids === 'string' ? JSON.parse(r.profile_ids) : (r.profile_ids || []),
            customPermissions: typeof r.custom_permissions === 'string' ? JSON.parse(r.custom_permissions) : (r.custom_permissions || []),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
          };
        }
      } catch (err) {
        console.error('[Store findEmployeeById PG Error]:', err);
      }
    }

    const localFound = store.employees.find((e) => e.id === id);
    return localFound || null;
  },

  async ensureMasterAdminSeeded(): Promise<void> {
    // Check if master admin exists
    const master = await this.findEmployeeByEmail(MASTER_ADMIN_SEED.email);
    if (!master) {
      console.log('👑 [Store] Criando usuário Administrador Master inicial...');
      const { hash, salt } = hashPassword(MASTER_ADMIN_SEED.defaultPassword);
      const masterUser: any = {
        id: MASTER_ADMIN_SEED.id,
        name: MASTER_ADMIN_SEED.name,
        email: MASTER_ADMIN_SEED.email,
        passwordHash: hash,
        salt: salt,
        whatsapp: MASTER_ADMIN_SEED.whatsapp,
        avatar: MASTER_ADMIN_SEED.avatar,
        jobTitle: MASTER_ADMIN_SEED.jobTitle,
        department: MASTER_ADMIN_SEED.department,
        status: MASTER_ADMIN_SEED.status,
        isMaster: true,
        profileIds: MASTER_ADMIN_SEED.profileIds,
        customPermissions: MASTER_ADMIN_SEED.customPermissions,
        createdAt: new Date().toISOString(),
      };
      await this.saveEmployee(masterUser);
    }

    // Ensure profiles exist
    const profiles = await this.getAccessProfiles();
    if (profiles.length === 0) {
      for (const p of INITIAL_ACCESS_PROFILES) {
        await this.saveAccessProfile(p);
      }
    }
  },

  async cleanProductionDatabase(): Promise<{ success: boolean; message: string }> {
    store.clients = [];
    store.orders = [];
    store.quotes = [];
    store.transactions = [];
    store.products = [];
    store.finishings = [];
    store.isRealDataOnly = true;

    // Keep only the master admin
    const { hash, salt } = hashPassword(MASTER_ADMIN_SEED.defaultPassword);
    store.employees = [
      {
        id: MASTER_ADMIN_SEED.id,
        name: MASTER_ADMIN_SEED.name,
        email: MASTER_ADMIN_SEED.email,
        passwordHash: hash,
        salt: salt,
        whatsapp: MASTER_ADMIN_SEED.whatsapp,
        avatar: MASTER_ADMIN_SEED.avatar,
        jobTitle: MASTER_ADMIN_SEED.jobTitle,
        department: MASTER_ADMIN_SEED.department,
        status: MASTER_ADMIN_SEED.status,
        isMaster: true,
        profileIds: MASTER_ADMIN_SEED.profileIds,
        customPermissions: MASTER_ADMIN_SEED.customPermissions,
        createdAt: new Date().toISOString(),
      },
    ];
    store.accessProfiles = [...INITIAL_ACCESS_PROFILES];

    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('TRUNCATE TABLE quotes, orders, transactions, clients, products, finishings CASCADE');
        // Re-seed master admin & profiles in PG
        await this.ensureMasterAdminSeeded();
        return {
          success: true,
          message: 'Banco de dados limpo com sucesso! Apenas o usuário Admin Master e perfis de acesso foram mantidos.',
        };
      } catch (err: any) {
        console.error('[CleanProduction PG Error]:', err);
        return {
          success: false,
          message: `Erro ao limpar tabelas do PostgreSQL: ${err.message}`,
        };
      }
    }

    return {
      success: true,
      message: 'Banco de dados local limpo com sucesso para início em produção!',
    };
  },

  async deleteEmployee(id: string): Promise<boolean> {
    store.employees = store.employees.filter((e) => e.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM employees WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteEmployee PG Error]:', err);
      }
    }
    return true;
  },

  async getAccessProfiles(): Promise<AccessProfile[]> {
    if (isPostgresReady()) {
      try {
        const queryRes = await executeSqlQuery('SELECT * FROM access_profiles ORDER BY created_at ASC');
        if (queryRes.rows && queryRes.rows.length > 0) {
          const pgProfiles: AccessProfile[] = queryRes.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            description: r.description || '',
            color: r.color || '#3b82f6',
            icon: r.icon || 'Shield',
            isSystemDefault: r.is_system_default || false,
            allowedPermissions: typeof r.allowed_permissions === 'string' ? JSON.parse(r.allowed_permissions) : (r.allowed_permissions || []),
            allowedScreens: typeof r.allowed_screens === 'string' ? JSON.parse(r.allowed_screens) : (r.allowed_screens || []),
            allowedRoutines: typeof r.allowed_routines === 'string' ? JSON.parse(r.allowed_routines) : (r.allowed_routines || []),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          }));
          store.accessProfiles = pgProfiles;
          saveStoreToFile();
          return pgProfiles;
        }
      } catch (err) {
        console.error('[Store AccessProfiles PG Error]:', err);
      }
    }
    return store.accessProfiles;
  },

  async saveAccessProfile(prof: AccessProfile): Promise<AccessProfile> {
    const existingIndex = store.accessProfiles.findIndex((p) => p.id === prof.id);
    if (existingIndex >= 0) {
      store.accessProfiles[existingIndex] = prof;
    } else {
      store.accessProfiles.push(prof);
    }
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery(
          `INSERT INTO access_profiles (id, name, code, description, color, icon, is_system_default, allowed_permissions, allowed_screens, allowed_routines, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             code = EXCLUDED.code,
             description = EXCLUDED.description,
             color = EXCLUDED.color,
             icon = EXCLUDED.icon,
             allowed_permissions = EXCLUDED.allowed_permissions,
             allowed_screens = EXCLUDED.allowed_screens,
             allowed_routines = EXCLUDED.allowed_routines,
             updated_at = NOW()`,
          [
            prof.id,
            prof.name,
            prof.code,
            prof.description,
            prof.color,
            prof.icon,
            prof.isSystemDefault || false,
            JSON.stringify(prof.allowedPermissions || []),
            JSON.stringify(prof.allowedScreens || []),
            JSON.stringify(prof.allowedRoutines || []),
            prof.createdAt || new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error('[Store saveAccessProfile PG Error]:', err);
      }
    }
    return prof;
  },

  async deleteAccessProfile(id: string): Promise<boolean> {
    store.accessProfiles = store.accessProfiles.filter((p) => p.id !== id);
    saveStoreToFile();

    if (isPostgresReady()) {
      try {
        await executeSqlQuery('DELETE FROM access_profiles WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Store deleteAccessProfile PG Error]:', err);
      }
    }
    return true;
  },

  // Bulk sync all data from store to PostgreSQL
  async syncAllToPostgres(): Promise<{ success: boolean; message: string; counts: any }> {
    if (!isPostgresReady()) {
      return {
        success: false,
        message: 'PostgreSQL não está conectado. Configure os parâmetros antes de sincronizar.',
        counts: {},
      };
    }

    let clientsSynced = 0;
    let productsSynced = 0;
    let ordersSynced = 0;
    let quotesSynced = 0;
    let finishingsSynced = 0;
    let transactionsSynced = 0;
    let employeesSynced = 0;
    let profilesSynced = 0;

    for (const c of store.clients) {
      await this.saveClient(c);
      clientsSynced++;
    }
    for (const p of store.products) {
      await this.saveProduct(p);
      productsSynced++;
    }
    for (const f of store.finishings) {
      await this.saveFinishing(f);
      finishingsSynced++;
    }
    for (const o of store.orders) {
      await this.saveOrder(o);
      ordersSynced++;
    }
    for (const q of store.quotes) {
      await this.saveQuote(q);
      quotesSynced++;
    }
    for (const t of store.transactions) {
      await this.saveTransaction(t);
      transactionsSynced++;
    }
    for (const prof of store.accessProfiles) {
      await this.saveAccessProfile(prof);
      profilesSynced++;
    }
    for (const emp of store.employees) {
      await this.saveEmployee(emp);
      employeesSynced++;
    }

    return {
      success: true,
      message: 'Todos os registros foram sincronizados com sucesso no PostgreSQL!',
      counts: {
        clientsSynced,
        productsSynced,
        finishingsSynced,
        ordersSynced,
        quotesSynced,
        transactionsSynced,
        profilesSynced,
        employeesSynced,
      },
    };
  },
};
