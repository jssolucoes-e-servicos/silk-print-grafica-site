# Silk Print Gráfica - Backend API & Microserviços (`apps/api`)

API REST centralizada de alta volumetria para a Silk Print Gráfica. Responsável pelo processamento transacional, banco de dados relacional PostgreSQL, streaming de arquivos pesados de impressão para o MinIO (S3), liquidação de pagamentos Pix/Cartão via Mercado Pago e automações via n8n e Evolution API (WhatsApp).

## 🚀 Tecnologias
- **Runtime**: Node.js 20+ com TypeScript (ESM)
- **Framework Web**: Express 4 / CORS habilitado para Loja e ERP
- **Banco de Dados**: PostgreSQL com pool de conexões otimizado (`pg`)
- **Storage de Alta Volumetria**: MinIO / AWS S3 (Bucket de artes e gabaritos)
- **Pagamentos**: Mercado Pago SDK v2 (Pix dinâmico com QR Code em base64 e Webhooks)
- **Mensageria & Automação**: Evolution API (WhatsApp) e Webhooks n8n

---

## ⚙️ Variáveis de Ambiente (`.env`)

```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://silkprint.com.br,https://erp.silkprint.com.br,http://localhost:3000,http://localhost:5173

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://postgres:senha@qgymrf.easypanel.host:5435/silkprint?schema=public

# MinIO / S3 Storage
MINIO_ENDPOINT=minio-server.jssolucoeseservicos.com.br
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=seu_access_key
MINIO_SECRET_KEY=sua_secret_key
MINIO_BUCKET_NAME=silkprint-documents

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua_public_key

# Evolution API / WhatsApp
EVOLUTION_API_URL=https://api.evolution.exemplo.com
EVOLUTION_API_KEY=sua_chave_evolution
EVOLUTION_INSTANCE=smartChurches

# n8n Webhook
N8N_QUOTE_WEBHOOK_URL=https://main-n8n.qgymrf.easypanel.host/webhook/evolution-webhook-proxy
```

---

## 📦 Como Rodar Localmente

```bash
cd apps/api
npm install
npm run dev
```
A API iniciará por padrão em `http://localhost:4000`.

---

## 🐳 Deploy com Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
```
