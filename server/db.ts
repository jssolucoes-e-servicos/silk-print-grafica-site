import { Pool, PoolConfig } from 'pg';
import { PostgresConfig } from '../src/types';
import { refreshPrismaClient, getPrisma } from './prisma';

let pgPool: Pool | null = null;
let currentConfig: PostgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'silkprint_db',
  ssl: process.env.POSTGRES_SSL === 'true',
  connectionString: process.env.DATABASE_URL || '',
  status: 'disconnected',
};

// Check if initial env has connection details
if (process.env.DATABASE_URL || (process.env.POSTGRES_HOST && process.env.POSTGRES_USER)) {
  initPool(currentConfig).catch((err) => {
    console.log('[PostgreSQL] Initial connection attempt deferred:', err.message);
  });
}

export function getPostgresConfig(): PostgresConfig {
  return { ...currentConfig };
}

export function setPostgresConfig(newConfig: Partial<PostgresConfig>) {
  currentConfig = { ...currentConfig, ...newConfig };
  refreshPrismaClient(currentConfig).catch(() => {});
}

/**
 * Initialize or update PG connection pool
 */
export async function initPool(config: Partial<PostgresConfig>): Promise<Pool> {
  if (pgPool) {
    try {
      await pgPool.end();
    } catch {
      // ignore
    }
    pgPool = null;
  }

  const merged = { ...currentConfig, ...config };
  currentConfig = merged;

  const poolOptions: PoolConfig = {};

  if (merged.connectionString && merged.connectionString.trim()) {
    poolOptions.connectionString = merged.connectionString.trim();
  } else {
    poolOptions.host = merged.host || 'localhost';
    poolOptions.port = merged.port || 5432;
    poolOptions.user = merged.user || 'postgres';
    poolOptions.password = merged.password || '';
    poolOptions.database = merged.database || 'silkprint_db';
  }

  if (merged.ssl) {
    poolOptions.ssl = { rejectUnauthorized: false };
  }

  poolOptions.connectionTimeoutMillis = 8000;
  poolOptions.idleTimeoutMillis = 30000;
  poolOptions.max = 10;

  pgPool = new Pool(poolOptions);
  return pgPool;
}

/**
 * Test PostgreSQL Connection & Retrieve Real Server Details
 */
export async function testPostgresConnection(config?: Partial<PostgresConfig>): Promise<{
  success: boolean;
  message: string;
  serverVersion?: string;
  tablesCount?: number;
  tables?: Array<{ tableName: string; rowCount: number; columnsCount: number }>;
  latencyMs?: number;
  totalRecords?: Record<string, number>;
}> {
  const startTime = Date.now();
  let poolToUse = pgPool;

  try {
    if (config) {
      poolToUse = await initPool(config);
    } else if (!poolToUse) {
      poolToUse = await initPool(currentConfig);
    }

    const client = await poolToUse.connect();

    try {
      const versionRes = await client.query('SELECT version() as version, NOW() as current_time');
      const serverVersion = versionRes.rows[0]?.version || 'PostgreSQL';

      // Query real tables in public schema
      const tablesRes = await client.query(`
        SELECT 
          table_name as "tableName",
          (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as "columnsCount"
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name ASC;
      `);

      const tables: Array<{ tableName: string; rowCount: number; columnsCount: number }> = [];
      const totalRecords: Record<string, number> = {};

      for (const row of tablesRes.rows) {
        try {
          const countRes = await client.query(`SELECT count(*) as count FROM "${row.tableName}"`);
          const count = parseInt(countRes.rows[0]?.count || '0', 10);
          tables.push({
            tableName: row.tableName,
            rowCount: count,
            columnsCount: parseInt(row.columnsCount || '0', 10),
          });
          totalRecords[row.tableName] = count;
        } catch {
          tables.push({
            tableName: row.tableName,
            rowCount: 0,
            columnsCount: parseInt(row.columnsCount || '0', 10),
          });
        }
      }

      const latencyMs = Date.now() - startTime;
      currentConfig.status = 'connected';
      currentConfig.lastChecked = new Date().toISOString();
      currentConfig.serverVersion = serverVersion;
      currentConfig.tablesCount = tables.length;
      currentConfig.totalRecords = totalRecords;

      return {
        success: true,
        message: `Conectado com sucesso ao PostgreSQL! (${latencyMs}ms)`,
        serverVersion,
        tablesCount: tables.length,
        tables,
        totalRecords,
        latencyMs,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    currentConfig.status = 'error';
    console.error('[PostgreSQL] Connection Error:', err);

    let errorMsg = err.message || 'Falha ao conectar no PostgreSQL';
    if (err.code === 'ECONNREFUSED') {
      errorMsg = `Conexão recusada em ${currentConfig.host}:${currentConfig.port}. Verifique se o PostgreSQL está rodando.`;
    } else if (err.code === '28P01') {
      errorMsg = 'Autenticação falhou: Usuário ou senha incorretos para o PostgreSQL.';
    } else if (err.code === '3D000') {
      errorMsg = `Banco de dados "${currentConfig.database}" não existe no servidor PostgreSQL.`;
    } else if (err.code === 'ENOTFOUND') {
      errorMsg = `Host não encontrado: "${currentConfig.host}".`;
    }

    return {
      success: false,
      message: errorMsg,
      latencyMs,
    };
  }
}

/**
 * Automatically create tables in PostgreSQL
 */
export async function runPostgresMigrations(): Promise<{
  success: boolean;
  createdTables: string[];
  message: string;
}> {
  if (!pgPool) {
    await initPool(currentConfig);
  }

  const client = await pgPool!.connect();

  try {
    await client.query('BEGIN');

    // 1. Clients Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(64) NOT NULL,
        email VARCHAR(255),
        cpf_cnpj VARCHAR(64),
        cep VARCHAR(32),
        endereco VARCHAR(255),
        numero VARCHAR(32),
        bairro VARCHAR(128),
        cidade VARCHAR(128),
        estado VARCHAR(32),
        observacoes TEXT,
        orders_count INT DEFAULT 0,
        total_spent NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Products Table (Catalog and Custom)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        base_price NUMERIC(12,2),
        cost NUMERIC(12,2),
        unit VARCHAR(32) DEFAULT 'un',
        min_qty INT DEFAULT 1,
        image TEXT,
        description TEXT,
        is_internal BOOLEAN DEFAULT false,
        is_m2 BOOLEAN DEFAULT false,
        base_m2_price NUMERIC(12,2),
        production_time VARCHAR(64),
        paper_type VARCHAR(128),
        paper_weight VARCHAR(64),
        print_type VARCHAR(128),
        compatible_finishings JSONB DEFAULT '[]',
        price_tiers JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Finishings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS finishings (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        cost NUMERIC(12,2),
        unit VARCHAR(32) DEFAULT 'un',
        pricing_type VARCHAR(32) DEFAULT 'unidade',
        extra_days INT DEFAULT 0,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Quotes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64),
        number VARCHAR(64),
        client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
        client_name VARCHAR(255) NOT NULL,
        client_whatsapp VARCHAR(64) NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        observations TEXT,
        valid_until VARCHAR(64),
        validity_date VARCHAR(64),
        subtotal NUMERIC(12,2) DEFAULT 0,
        discount NUMERIC(12,2) DEFAULT 0,
        total NUMERIC(12,2) NOT NULL,
        status VARCHAR(32) DEFAULT 'enviado',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) NOT NULL,
        client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
        client_name VARCHAR(255) NOT NULL,
        client_whatsapp VARCHAR(64) NOT NULL,
        client_cpf VARCHAR(64),
        client_email VARCHAR(255),
        cep VARCHAR(32),
        endereco VARCHAR(255),
        numero VARCHAR(32),
        bairro VARCHAR(128),
        cidade VARCHAR(128),
        estado VARCHAR(32),
        description TEXT NOT NULL,
        items JSONB DEFAULT '[]',
        items_count INT DEFAULT 1,
        total NUMERIC(12,2) NOT NULL,
        paid_amount NUMERIC(12,2) DEFAULT 0,
        status VARCHAR(64) DEFAULT 'em_aberto',
        payment_status VARCHAR(32) DEFAULT 'pendente',
        payment_method VARCHAR(64),
        pix_key VARCHAR(128),
        tracking_code VARCHAR(128),
        shipping_carrier VARCHAR(128),
        delivery_date VARCHAR(64),
        notes TEXT,
        is_online_order BOOLEAN DEFAULT false,
        messages JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Transactions Table (Financeiro)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        description VARCHAR(255) NOT NULL,
        value NUMERIC(12,2) NOT NULL,
        payment_method VARCHAR(64),
        status VARCHAR(32) DEFAULT 'pago',
        due_date VARCHAR(64),
        category VARCHAR(128),
        observations TEXT,
        client_name VARCHAR(255),
        client_id VARCHAR(64),
        order_id VARCHAR(64),
        order_code VARCHAR(64),
        paid_at VARCHAR(64),
        document_number VARCHAR(128),
        supplier_name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Access Profiles & Employees
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_profiles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(64) NOT NULL,
        description TEXT,
        color VARCHAR(32),
        icon VARCHAR(64),
        is_system_default BOOLEAN DEFAULT false,
        allowed_permissions JSONB DEFAULT '[]',
        allowed_screens JSONB DEFAULT '[]',
        allowed_routines JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(64) NOT NULL,
        avatar TEXT,
        job_title VARCHAR(128) NOT NULL,
        department VARCHAR(128) NOT NULL,
        status VARCHAR(32) DEFAULT 'Ativo',
        profile_ids JSONB DEFAULT '[]',
        custom_permissions JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `);

    // 8. MinIO Uploaded Files Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS minio_files (
        id VARCHAR(64) PRIMARY KEY,
        bucket VARCHAR(128) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(128),
        url TEXT,
        category VARCHAR(64) DEFAULT 'geral',
        order_id VARCHAR(64),
        client_id VARCHAR(64),
        uploaded_by VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. n8n Automation Event Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS n8n_event_logs (
        id VARCHAR(64) PRIMARY KEY,
        event_type VARCHAR(64) NOT NULL,
        target_url TEXT NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(32) NOT NULL,
        http_status INT,
        response TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. System Integrations Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(128) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');

    const createdTables = [
      'clients',
      'products',
      'finishings',
      'quotes',
      'orders',
      'transactions',
      'access_profiles',
      'employees',
      'minio_files',
      'n8n_event_logs',
      'system_settings',
    ];

    return {
      success: true,
      createdTables,
      message: `Migração executada com sucesso! ${createdTables.length} tabelas prontas no PostgreSQL.`,
    };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Migration failed:', err);
    return {
      success: false,
      createdTables: [],
      message: `Erro na migração do PostgreSQL: ${err.message}`,
    };
  } finally {
    client.release();
  }
}

/**
 * Execute custom SQL query (SELECT / INSERT / UPDATE)
 */
export async function executeSqlQuery(sql: string, params: any[] = []) {
  if (!pgPool) {
    await initPool(currentConfig);
  }
  const client = await pgPool!.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } finally {
    client.release();
  }
}

/**
 * Helper to check if PostgreSQL is currently connected and usable
 */
export function isPostgresReady(): boolean {
  return currentConfig.status === 'connected' && pgPool !== null;
}
