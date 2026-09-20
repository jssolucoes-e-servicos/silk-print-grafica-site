# Silk Print Gráfica - Loja Virtual & E-commerce (`apps/store`)

Frontend de alta conversão para os clientes finais da Silk Print Gráfica. Totalmente otimizado para velocidade, SEO, Core Web Vitals e responsividade mobile-first.

## 🎯 Escopo Funcional
- **Catálogo de Produtos Gráficos**: Cartões de visita, panfletos, banners, adesivos, pastas, blocos, etc.
- **Configurador Técnico em Tempo Real**:
  - Seleção de formato, papel (gramatura e acabamento), cores (4x0, 4x4, 1x0), enobrecimentos e tiragem.
  - Cálculo instantâneo de preço por escala e prazo de produção.
- **Upload Direto de Arte**: Envio de arquivos PDF/CDR/AI/PSD para o MinIO da gráfica com barra de progresso.
- **Carrinho & Checkout Transparente**:
  - Consulta de balcões de retirada parceiros (frete grátis ou econômico) e envio pelos Correios (Sedex/PAC).
  - Pagamento instantâneo via Pix com QR Code Copia e Cola dinâmico e Cartão de Crédito.
  - Rastreamento público de pedidos por número e e-mail.
- **Downloads de Gabaritos**: Arquivos modelo em PDF, CDR, AI e PSD com sangria e margens de segurança.

---

## ⚙️ Variáveis de Ambiente (`.env`)

```env
# URL da API Backend
VITE_API_BASE_URL=https://api.silkprint.com.br/api

# Chave Pública do Mercado Pago (para Tokenização de Cartão no Frontend)
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua_public_key_aqui
```

---

## 🚀 Como Rodar Localmente

```bash
cd apps/store
npm install
npm run dev
```
O e-commerce abrirá em `http://localhost:5173`.

---

## 🌐 Deploy em CDN Edge (Cloudflare Pages / Vercel / Netlify)

A loja é um SPA estático superleve. Você pode conectá-la diretamente ao GitHub na Vercel ou Cloudflare Pages:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `apps/store`
