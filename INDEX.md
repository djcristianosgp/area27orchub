# 📖 Índice de Documentação - OrçHub

Bem-vindo ao OrçHub! Use este índice para encontrar rapidamente o que você precisa.

---

## 🚀 COMEÇANDO

### 👤 Novo no Projeto?
1. Comece aqui: [QUICKSTART.md](QUICKSTART.md) (5 minutos)
2. Leia: [README.md](README.md) (visão geral completa)
3. Explore: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (estrutura de pastas)

### 🎯 Quer Entender a Arquitetura?
- [ARCHITECTURE.md](ARCHITECTURE.md) - Design detalhado do sistema

### 🔧 Problemas com Banco de Dados?
- [PRISMA_GUIDE.md](PRISMA_GUIDE.md) - Tudo sobre Prisma ORM

### 📊 Teste as APIs
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemplos de todas as rotas

---

## 📚 DOCUMENTAÇÃO COMPLETA

| Documento | Conteúdo | Para Quem |
|-----------|----------|----------|
| **README.md** | Visão geral, setup, endpoints, modelo de dados | Todos |
| **QUICKSTART.md** | Setup em 5 min, primeiro teste, troubleshooting | Iniciantes |
| **API_EXAMPLES.md** | Exemplos curl de cada endpoint | Desenvolvedores |
| **ARCHITECTURE.md** | Design 3-tier, fluxos, padrões | Tech leads |
| **PRISMA_GUIDE.md** | ORM, migrations, seed data | DB devs |
| **ROADMAP.md** | Features futuras, prioridades | Product managers |
| **PROJECT_STRUCTURE.md** | Estrutura de pastas, estatísticas | Desenvolvedores |
| **PROJECT_SUMMARY.md** | Resumo executivo do projeto | Gerentes |

---

## 🎯 ENCONTRE RÁPIDO

### Por Funcionalidade

#### Autenticação
- [Como fazer login](API_EXAMPLES.md#autenticação)
- [Como registrar](API_EXAMPLES.md#registrar)
- [JWT explanation](ARCHITECTURE.md#autenticação)

#### Clientes
- [CRUD de Clientes](API_EXAMPLES.md#clientes)
- [Criar Cliente](API_EXAMPLES.md#criar-cliente)
- [Listar Clientes](API_EXAMPLES.md#listar-clientes)

#### Produtos
- [CRUD de Produtos](API_EXAMPLES.md#produtos)
- [Criar Produto com Variações](API_EXAMPLES.md#criar-produto-com-variações)
- [Filtrar Produtos](API_EXAMPLES.md#listar-produtos-com-filtros)

#### Serviços
- [CRUD de Serviços](API_EXAMPLES.md#serviços)
- [Criar Serviço](API_EXAMPLES.md#criar-serviço-com-variações)

#### Orçamentos
- [Criar Orçamento](API_EXAMPLES.md#criar-orçamento)
- [Clonar Orçamento](API_EXAMPLES.md#clonar-orçamento)
- [Orçamento Público](API_EXAMPLES.md#visualizar-orçamento-público-sem-autenticação)
- [Aprovar Orçamento](API_EXAMPLES.md#aprovar-orçamento-cliente)

#### Cupons
- [Criar Cupom](API_EXAMPLES.md#criar-cupom)
- [Listar Cupons](API_EXAMPLES.md#listar-cupons-ativos-público)

### Por Tecnologia

#### Backend (NestJS)
- [Estrutura](PROJECT_STRUCTURE.md#backend)
- [Fluxo de requisição](ARCHITECTURE.md#fluxo-de-requisição)
- [Padrões](ARCHITECTURE.md#padrões-utilizados)
- [Como adicionar módulo](PROJECT_STRUCTURE.md#adicionar-novo-módulo)

#### Frontend (React)
- [Estrutura](PROJECT_STRUCTURE.md#frontend)
- [Zustand Store](ARCHITECTURE.md#exemplo-de-store)
- [Componentes](PROJECT_STRUCTURE.md#frontend)
- [Como adicionar página](PROJECT_STRUCTURE.md#adicionar-nova-página-frontend)

#### Database (PostgreSQL + Prisma)
- [Schema](README.md#modelo-de-dados)
- [Relacionamentos](ARCHITECTURE.md#relacionamentos-principais)
- [Migrations](PRISMA_GUIDE.md#fazer-changes-no-schema)
- [Visualizar dados](PRISMA_GUIDE.md#visualizar-dados-no-prisma-studio)

#### DevOps
- [Docker Compose](QUICKSTART.md#opção-b-docker-compose)
- [Variáveis de ambiente](README.md#variáveis-de-ambiente)
- [Deploy](README.md#deploy)

### Por Problema

#### "Connection refused ao banco"
- Solução: [QUICKSTART.md - Troubleshooting](QUICKSTART.md#troubleshooting)

#### "Cannot find module"
- Solução: [QUICKSTART.md - Troubleshooting](QUICKSTART.md#troubleshooting)

#### "Port já em uso"
- Solução: [QUICKSTART.md - Troubleshooting](QUICKSTART.md#troubleshooting)

#### "Erro no Prisma"
- Solução: [QUICKSTART.md - Troubleshooting](QUICKSTART.md#troubleshooting)

---

## 📋 CHECKLIST DE SETUP

- [ ] Ler [QUICKSTART.md](QUICKSTART.md)
- [ ] Clonar/abrir projeto
- [ ] Instalar Node.js 18+
- [ ] Instalar PostgreSQL (ou usar Docker)
- [ ] `npm install` em `backend/`
- [ ] `npm install` em `frontend/`
- [ ] Criar `.env` em `backend/`
- [ ] `npx prisma migrate dev` em `backend/`
- [ ] `npm run start:dev` em `backend/`
- [ ] `npm run dev` em `frontend/`
- [ ] Acessar http://localhost:3001

---

## 🔍 GUIA DE NAVEGAÇÃO

### Se você quer...

**Começar a programar**
→ [QUICKSTART.md](QUICKSTART.md)

**Testar as APIs**
→ [API_EXAMPLES.md](API_EXAMPLES.md)

**Entender o código**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

**Resolver um erro**
→ [QUICKSTART.md#troubleshooting](QUICKSTART.md#troubleshooting)

**Expandir o projeto**
→ [ROADMAP.md](ROADMAP.md)

**Migrar banco de dados**
→ [PRISMA_GUIDE.md](PRISMA_GUIDE.md)

**Ver todas as rotas**
→ [README.md#documentação-de-endpoints](README.md#documentação-de-endpoints)

**Entender a estrutura**
→ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 📊 ESTATÍSTICAS

- **Documentação**: 2,000+ linhas
- **Backend**: 1,100+ linhas de código
- **Frontend**: 1,000+ linhas de código
- **Endpoints**: 37 rotas REST
- **Tabelas DB**: 8 tabelas
- **Módulos**: 6 módulos NestJS
- **Componentes**: 4 componentes React

---

## 🎯 STACK VISUAL

```
┌─────────────────────────────────┐
│   Frontend (React + Tailwind)    │
│        http://3001               │
└──────────────┬──────────────────┘
               │ Axios
┌──────────────▼──────────────────┐
│  Backend (NestJS + Prisma)       │
│        http://3000               │
└──────────────┬──────────────────┘
               │ SQL
┌──────────────▼──────────────────┐
│  PostgreSQL Database             │
│        localhost:5432            │
└─────────────────────────────────┘
```

---

## 📚 GUIA DE LEITURA RECOMENDADO

### Primeira Vez
1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 2 min (resumo executivo)
2. [QUICKSTART.md](QUICKSTART.md) - 10 min (setup)
3. [README.md](README.md) - 20 min (visão completa)

### Desenvolvedor Backend
1. [ARCHITECTURE.md](ARCHITECTURE.md#backend-architecture) - Estrutura
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md#backend) - Pastas
3. [PRISMA_GUIDE.md](PRISMA_GUIDE.md) - Database

### Desenvolvedor Frontend
1. [ARCHITECTURE.md](ARCHITECTURE.md#frontend-architecture) - Estrutura
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md#frontend) - Pastas
3. [API_EXAMPLES.md](API_EXAMPLES.md) - Endpoints

### DevOps/Admin
1. [README.md](README.md#setup-com-docker-compose) - Docker
2. [PRISMA_GUIDE.md](PRISMA_GUIDE.md#deploy-em-produção) - Deploy
3. [ROADMAP.md](ROADMAP.md#fase-6-escalabilidade-e-cloud) - Escalabilidade

---

## 🔐 SEGURANÇA

Informações importantes:
- [Authentication](ARCHITECTURE.md#autenticação)
- [Security Architecture](ARCHITECTURE.md#security-architecture)
- [Protected Routes](ARCHITECTURE.md#protected-resources)

---

## 💡 DICAS

1. **Para testar rápido**: Use Postman/Insomnia com exemplos de [API_EXAMPLES.md](API_EXAMPLES.md)
2. **Para ver dados**: `npx prisma studio` no backend
3. **Para debug**: Use `npm run start:debug` no backend
4. **Para componentes**: Adicione em `src/components/` no frontend

---

## 🆘 PRECISA DE AJUDA?

1. Procure em [QUICKSTART.md#troubleshooting](QUICKSTART.md#troubleshooting)
2. Consulte [API_EXAMPLES.md](API_EXAMPLES.md) para exemplos
3. Leia [ARCHITECTURE.md](ARCHITECTURE.md) para entender design
4. Veja [PRISMA_GUIDE.md](PRISMA_GUIDE.md) para database

---

## 📞 CONTATO & SUPORTE

Projeto desenvolvido por um desenvolvedor fullstack sênior.

Para sugestões de melhoria, consulte [ROADMAP.md](ROADMAP.md).

---

## ✅ TUDO PRONTO!

Você tem todas as documentações necessárias para:
- ✅ Começar imediatamente
- ✅ Entender o código
- ✅ Adicionar novas funcionalidades
- ✅ Deploy em produção

**Bom desenvolvimento!** 🚀

---

**Última atualização**: 5 de janeiro de 2026
**Versão**: 1.0.0
