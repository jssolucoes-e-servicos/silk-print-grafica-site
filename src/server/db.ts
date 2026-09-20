import dotenv from 'dotenv';
dotenv.config({ override: true });
import pg from 'pg';
const { Pool } = pg;

// Lazy PostgreSQL connection pool
let pool: pg.Pool | null = null;
let isInitialized = false;

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('SUA_SENHA') || connectionString.includes('SENHA_AQUI') || connectionString.includes('senha@')) {
    return null;
  }

  if (connectionString.includes(':5435')) {
    connectionString = connectionString.replace(':5435', ':5436');
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected client error:', err);
    });

    return pool;
  } catch (err) {
    console.error('[PostgreSQL] Failed to create Pool:', err);
    return null;
  }
}

/**
 * Initializes database tables if they do not exist
 */
export async function initPostgresTables(): Promise<boolean> {
  const p = getDbPool();
  if (!p) {
    console.log('[PostgreSQL] DATABASE_URL not configured. Running in JSON/memory mode with VPS fallback.');
    return false;
  }

  if (isInitialized) return true;

  const client = await p.connect();
  try {
    console.log('[PostgreSQL] Initializing tables on VPS...');
    await client.query(`
      -- Categorias
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        icon VARCHAR(100),
        count VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Subcategorias
      CREATE TABLE IF NOT EXISTS subcategories (
        id VARCHAR(64) PRIMARY KEY,
        category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Produtos
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        category_slug VARCHAR(255) NOT NULL,
        short_description TEXT,
        description TEXT,
        base_price NUMERIC(10,2) NOT NULL,
        image TEXT,
        badge VARCHAR(100),
        popular BOOLEAN DEFAULT false,
        production_time_hours INT DEFAULT 24,
        formats JSONB DEFAULT '[]',
        default_format VARCHAR(100),
        papers JSONB DEFAULT '[]',
        color_modes JSONB DEFAULT '[]',
        finishes JSONB DEFAULT '[]',
        quantities JSONB DEFAULT '[]',
        bleed_specs JSONB DEFAULT '{}',
        gabaritos JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Balcões de Retirada
      CREATE TABLE IF NOT EXISTS pickup_points (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        neighborhood VARCHAR(100),
        address VARCHAR(255) NOT NULL,
        cep VARCHAR(20) NOT NULL,
        opening_hours VARCHAR(150),
        price NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Cupons de Desconto
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL,
        free_shipping BOOLEAN DEFAULT false,
        description TEXT,
        min_spend NUMERIC(10,2) DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Clientes
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        document VARCHAR(50) NOT NULL,
        company_name VARCHAR(255),
        state_registration VARCHAR(50),
        total_orders INT DEFAULT 0,
        total_spent NUMERIC(12,2) DEFAULT 0,
        last_order_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Fornecedores (Papel, Tintas, Chapas CTP, Embalagens, etc.)
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        trade_name VARCHAR(255),
        cnpj VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        category VARCHAR(50) DEFAULT 'papel',
        notes TEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Usuários Colaboradores
      CREATE TABLE IF NOT EXISTS collaborators (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'vendedor',
        phone VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Pedidos
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) NOT NULL,
        customer JSONB NOT NULL,
        shipping JSONB NOT NULL,
        items JSONB NOT NULL,
        payment JSONB NOT NULL,
        coupon_applied VARCHAR(50),
        timeline JSONB NOT NULL,
        payment_id VARCHAR(100),
        mercado_pago_status VARCHAR(50),
        qr_code_pix TEXT,
        qr_code_pix_base64 TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Leads de Orçamentos
      CREATE TABLE IF NOT EXISTS quote_leads (
        id VARCHAR(64) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        source VARCHAR(100),
        channel VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        description TEXT,
        admin_email_notified VARCHAR(255),
        admin_phone_notified VARCHAR(50),
        n8n_status VARCHAR(50),
        email_status VARCHAR(50),
        details JSONB
      );
    `);

    isInitialized = true;
    console.log('[PostgreSQL] Tables verified/created successfully!');
    return true;
  } catch (error) {
    console.error('[PostgreSQL] Error initializing tables:', error);
    return false;
  } finally {
    client.release();
  }
}
