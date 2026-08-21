# FinanPro - Gestão Financeira Multi-Tenant SaaS

FinanPro é uma aplicação web de gestão financeira construída em arquitetura SaaS Multi-Tenant. O sistema conta com controle de acesso isolado por empresa/inquilino (tenant), gerenciamento de assinaturas com limites operacionais (Plano FREE vs. Plano PRO) e sincronização reativa na interface.

---

## Tecnologias Utilizadas

- **Backend:** ASP.NET Core Web API (.NET)
- **ORM:** Entity Framework Core (SQL Server)
- **Autenticação:** JWT (JSON Web Tokens) com suporte a Claims do Tenant
- **Frontend:** React.js, TypeScript, Tailwind CSS
- **Integrações:** Webhook para atualização automática de planos de assinatura

---

## Destaques de Arquitetura e Recursos

- **Isolamento Dinâmico de Dados (Multi-Tenancy):** Implementação de `HasQueryFilter` no Entity Framework Core injetado via `ITenantProvider`, garantindo que requisições só retornem dados do `TenantId` contido no token JWT.
- **Controle Operacional por Plano (Free vs. PRO):** 
  - **Plano FREE:** Limite estrito de até 5 transações por conta.
  - **Plano PRO:** Acesso ilimitado a movimentações e relatórios.
- **Atualização em Tempo Real na UI:** Emissão de eventos customizados no DOM (`window.dispatchEvent`) para atualizar o status da assinatura no cabeçalho sem necessidade de recarregar a página.
- **Segurança e Validação:** Roteamento protegido no frontend e políticas de autorização baseadas em perfil (`[Authorize]`) na API.

---

## Estrutura do Repositório

```text
Projeto-SaaS-FinanPro/
├── backend/            # API ASP.NET Core, regras de negócio e EF Core
├── frontend/           # Aplicação React, componentes Tailwind e telas
└── .gitignore          # Regras de exclusão globais do projeto
```
## Como Executar o Projeto Localmente

### Pré-requisitos
- .NET SDK (6.0 ou superior)
- Node.js (v18 ou superior)
- SQL Server

### 1. Configurar o Backend

```bash
# Acesse a pasta do backend
cd backend

# Restaure as dependências
dotnet restore

# Atualize a ConnectionString no appsettings.json e aplique as migrations
dotnet ef database update

# Execute a API
dotnet run
```
Configurar o Frontend

```
# Acesse a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute a aplicação em modo de desenvolvimento
npm run dev
```

## Autor
Desenvolvido por Pablo Lara como projeto de portfólio para engenharia de software e arquitetura de sistemas Web SaaS.
