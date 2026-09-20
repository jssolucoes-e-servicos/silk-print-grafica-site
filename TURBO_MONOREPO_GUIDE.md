# Guia de Separação em 3 Projetos - Silk Print Gráfica

Este projeto foi arquitetado e organizado para operação de **alta volumetria**, dividindo responsabilidades entre 3 aplicações independentes e 1 pacote compartilhado:

```text
├── apps/
│   ├── store/              # PROJETO 1: E-commerce / Loja Virtual (silkprint.com.br)
│   │   ├── package.json
│   │   ├── README.md
│   │   └── src/
│   │
│   ├── erp/                # PROJETO 2: ERP Gráfico & Gestão da Fábrica (erp.silkprint.com.br)
│   │   ├── package.json
│   │   ├── README.md
│   │   └── src/
│   │
│   └── api/                # PROJETO 3: Backend API REST & Storage (api.silkprint.com.br)
│       ├── package.json
│       ├── README.md
│       └── src/
│
└── packages/
    └── types/              # PACOTE COMPARTILHADO: Modelos e tipos TypeScript (@silkprint/types)
        ├── package.json
        └── src/
```

---

## 🏗️ Como Operar os 3 Projetos

### Opção A: No mesmo repositório (Monorepo Turborepo / pnpm)
Você pode manter os 3 no mesmo repositório Git, aproveitando o compartilhamento imediato de interfaces (`@silkprint/types`), mas fazendo builds e deploys separados:
- Deploy do `apps/store` na **Vercel** ou **Cloudflare Pages**;
- Deploy do `apps/erp` em subdomínio fechado na **Cloudflare** ou **EasyPanel**;
- Deploy do `apps/api` em um container **Cloud Run**, **Docker** ou **VPS**.

### Opção B: Em 3 Repositórios Git Distintos no GitHub
Se preferir repositórios totalmente desacoplados:
1. **Repositório 1**: `silk-print-storefront` ➔ Copie a pasta `apps/store` e o pacote de tipos;
2. **Repositório 2**: `silk-print-erp` ➔ Copie a pasta `apps/erp` e o pacote de tipos;
3. **Repositório 3**: `silk-print-api` ➔ Copie a pasta `apps/api` e o pacote de tipos.

---

## ⚡ Ambientes e Portas Recomendadas

| Aplicação | Domínio em Produção | Porta Local | Tecnologias Principais |
| :--- | :--- | :--- | :--- |
| **Loja Virtual** | `https://silkprint.com.br` | `3000` / `5173` | **Next.js 15+ (App Router)**, Tailwind CSS v4, SEO/SSR, Mercado Pago SDK |
| **ERP Fábrica** | `https://erp.silkprint.com.br` | `5174` | **React 19 + Vite (SPA)**, Tailwind CSS v4, Kanban PCP, TanStack Query |
| **Backend API** | `https://api.silkprint.com.br` | `4000` | **NestJS (Express Engine)**, PostgreSQL, MinIO S3, BullMQ, Swagger OpenAPI |

---

## 🎯 Vantagens da Separação para Alta Volumetria

1. **Streaming de Arquivos Pesados**: O upload de artes gráficas em alta resolução (PDF de 100MB+) vai direto para a API e MinIO, sem sobrecarregar a loja.
2. **Isolamento de Picos de Acesso**: Campanhas e promoções na loja não tornam o Kanban da fábrica lento.
3. **Segurança Reforçada**: Regras de custos e almoxarifado não existem no código-fonte da loja virtual pública.
