-- Migration 0_init: Criação de tabelas do ERP SilkPrint
-- Suporte completo a PostgreSQL e Prisma ORM

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis de Acesso (RBAC)
CREATE TABLE IF NOT EXISTS access_profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(32),
    icon VARCHAR(64),
    is_system_default BOOLEAN DEFAULT false,
    allowed_permissions JSONB DEFAULT '[]'::jsonb,
    allowed_screens JSONB DEFAULT '[]'::jsonb,
    allowed_routines JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Colaboradores / Usuários do Sistema
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    salt VARCHAR(64),
    whatsapp VARCHAR(64) NOT NULL,
    avatar TEXT,
    job_title VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'Ativo',
    is_master BOOLEAN DEFAULT false,
    profile_ids JSONB DEFAULT '[]'::jsonb,
    custom_permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 3. Tabela de Clientes
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
    total_spent NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Produtos do Catálogo
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    base_price NUMERIC(12, 2),
    cost NUMERIC(12, 2),
    unit VARCHAR(32) DEFAULT 'un',
    min_qty INT DEFAULT 1,
    image TEXT,
    description TEXT,
    is_internal BOOLEAN DEFAULT false,
    is_m2 BOOLEAN DEFAULT false,
    base_m2_price NUMERIC(12, 2),
    production_time VARCHAR(64),
    paper_type VARCHAR(128),
    paper_weight VARCHAR(64),
    print_type VARCHAR(128),
    compatible_finishings JSONB DEFAULT '[]'::jsonb,
    price_tiers JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Acabamentos
CREATE TABLE IF NOT EXISTS finishings (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    cost NUMERIC(12, 2),
    unit VARCHAR(32) DEFAULT 'un',
    pricing_type VARCHAR(32) DEFAULT 'unidade',
    extra_days INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64),
    number VARCHAR(64),
    client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_whatsapp VARCHAR(64) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    observations TEXT,
    valid_until VARCHAR(64),
    validity_date VARCHAR(64),
    subtotal NUMERIC(12, 2) DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'enviado',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Pedidos de Produção
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
    items JSONB DEFAULT '[]'::jsonb,
    items_count INT DEFAULT 1,
    total NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(64) DEFAULT 'em_aberto',
    payment_status VARCHAR(32) DEFAULT 'pendente',
    payment_method VARCHAR(64),
    pix_key VARCHAR(128),
    tracking_code VARCHAR(128),
    shipping_carrier VARCHAR(128),
    delivery_date VARCHAR(64),
    notes TEXT,
    is_online_order BOOLEAN DEFAULT false,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    description VARCHAR(255) NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
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

-- 9. Tabela de Arquivos MinIO S3
CREATE TABLE IF NOT EXISTS minio_files (
    id VARCHAR(64) PRIMARY KEY,
    bucket VARCHAR(128) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(128),
    url TEXT,
    category VARCHAR(64) DEFAULT 'geral',
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
    uploaded_by VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela de Logs de Eventos n8n Webhooks
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

-- 11. Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(128) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para alta performance
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_access_profiles_code ON access_profiles(code);
