# Silk Print Gráfica - ERP & Gestão da Fábrica (`apps/erp`)

Sistema de Gestão Empresarial (ERP) e Planejamento e Controle de Produção (PCP) desenvolvido especificamente para a indústria gráfica da Silk Print.

## 🎯 Módulos do ERP
1. **Esteira Kanban de O.S. (PCP)**:
   - Fases de produção: Pendente Pagamento ➔ Aprovado ➔ Pré-Impressão / CTP ➔ Impressão Offset & Digital ➔ Acabamento & Corte ➔ Embalagem ➔ Pronto para Retirada ➔ Entregue.
   - Atualização em tempo real de status, anotações de máquina e histórico de operador.
2. **Orçamentos & Propostas Comerciais**:
   - Elaboração ágil de cotações com múltiplos itens gráficos, descontos e prazos de entrega.
   - Conversão de orçamentos aprovados diretamente em Ordem de Serviço na esteira.
3. **Engenharia de Precificação & Markups**:
   - Definição de custos fixos, custos variáveis e margem de contribuição por categoria de produto.
   - Simulador dinâmico de preço de venda e ponto de equilíbrio (breakeven).
4. **Tabela de Acabamentos Gráficos**:
   - Gestão de custos, margens e tempo de máquina para laminação, verniz UV localizado, corte e vinco, hot stamping, dobra e refile.
5. **Almoxarifado & Matéria-Prima**:
   - Controle de estoque de papel (resmas), tintas offset/plotter (latas/kg), chapas CTP e embalagens.
   - Alertas visuais automáticos de reposição de estoque mínimo.
6. **Logística & Despacho Postal**:
   - Emissão de Declaração de Conteúdo Postal oficial no padrão Correios/transportadoras.
   - Cadastro e gestão de balcões de retirada parceiros em capitais e cidades estratégicas.
7. **DRE & Controle Financeiro**:
   - Demonstrativo do Resultado do Exercício com faturamento bruto, custos de produção (CPV), despesas operacionais e lucro líquido.

---

## ⚙️ Variáveis de Ambiente (`.env`)

```env
# URL da API Central
VITE_API_BASE_URL=https://api.silkprint.com.br/api

# Domínio do ERP
VITE_ERP_DOMAIN=erp.silkprint.com.br
```

---

## 🚀 Como Rodar Localmente

```bash
cd apps/erp
npm install
npm run dev
```
O ERP abrirá por padrão em `http://localhost:5174`.

---

## 🔒 Segurança em Produção
Recomenda-se hospedar o ERP em um subdomínio restrito (`erp.silkprint.com.br`), protegido por:
- **Cloudflare Zero Trust / Access** ou VPN corporativa da gráfica;
- Autenticação por cargos com permissões diferenciadas (Operador de Máquina, Orçamentista, Expedição, Gerente Geral).
