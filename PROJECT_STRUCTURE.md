# 📁 Estrutura Completa do Projeto

```
are27orchub/
│
├── 📄 README.md                      # Documentação principal
├── 📄 QUICKSTART.md                  # Guia de início rápido
├── 📄 API_EXAMPLES.md                # Exemplos de requisições
├── 📄 ARCHITECTURE.md                # Arquitetura do projeto
├── 📄 PRISMA_GUIDE.md                # Guia do Prisma
├── 📄 ROADMAP.md                     # Roadmap futuro
├── 📄 .gitignore                     # Git ignore rules
├── 📄 docker-compose.yml             # Docker Compose config
│
├── 📁 backend/                       # Backend (NestJS)
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── auth.dto.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   │
│   │   │   ├── 📁 clients/
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── client.dto.ts
│   │   │   │   ├── clients.controller.ts
│   │   │   │   ├── clients.service.ts
│   │   │   │   └── clients.module.ts
│   │   │   │
│   │   │   ├── 📁 products/
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── product.dto.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   └── products.module.ts
│   │   │   │
│   │   │   ├── 📁 services/
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── service.dto.ts
│   │   │   │   ├── services.controller.ts
│   │   │   │   ├── services.service.ts
│   │   │   │   └── services.module.ts
│   │   │   │
│   │   │   ├── 📁 invoices/
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── invoice.dto.ts
│   │   │   │   ├── invoices.controller.ts
│   │   │   │   ├── invoices.service.ts
│   │   │   │   └── invoices.module.ts
│   │   │   │
│   │   │   └── 📁 coupons/
│   │   │       ├── 📁 dtos/
│   │   │       │   └── coupon.dto.ts
│   │   │       ├── coupons.controller.ts
│   │   │       ├── coupons.service.ts
│   │   │       └── coupons.module.ts
│   │   │
│   │   ├── 📁 database/
│   │   │   └── prisma.service.ts
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── 📁 decorators/
│   │   │   ├── 📁 filters/
│   │   │   ├── 📁 interceptors/
│   │   │   └── 📁 pipes/
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── 📁 prisma/
│   │   ├── schema.prisma
│   │   └── 📁 migrations/
│   │
│   ├── 📁 test/
│   │   └── jest-e2e.json
│   │
│   ├── 📄 Dockerfile
│   ├── 📄 .env.example
│   ├── 📄 .env.local
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📄 tsconfig.json
│   └── 📄 .dockerignore
│
├── 📁 frontend/                      # Frontend (React)
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── (componentes futuros)
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CouponsPublicPage.tsx
│   │   │   ├── PublicInvoicePage.tsx
│   │   │   └── (pages futuras)
│   │   │
│   │   ├── 📁 store/
│   │   │   ├── authStore.ts
│   │   │   └── (stores futuros)
│   │   │
│   │   ├── 📁 services/
│   │   │   └── api.ts
│   │   │
│   │   ├── 📁 types/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── 📄 Dockerfile
│   ├── 📄 index.html
│   ├── 📄 vite.config.ts
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   └── 📄 .dockerignore
│
└── 📄 .github/
    └── copilot-instructions.md       # Instruções do Copilot
```

---

## 📊 Estatísticas do Projeto

### Backend
```
Lines of Code (LOC):
├── Controllers:    ~300 LOC (6 controllers)
├── Services:       ~400 LOC (6 services)
├── DTOs:           ~250 LOC (6 DTO files)
├── Modules:        ~150 LOC (6 modules)
└── Total Backend:  ~1,100 LOC
```

### Frontend
```
Lines of Code (LOC):
├── Components:     ~100 LOC
├── Pages:          ~400 LOC (3 pages)
├── Store:          ~150 LOC (authStore)
├── Services:       ~200 LOC (api.ts)
├── Types:          ~150 LOC
└── Total Frontend: ~1,000 LOC
```

### Database
```
Tables: 8
├── users
├── clients
├── products
├── product_variations
├── services
├── service_variations
├── invoices
├── invoice_groups
├── invoice_items
└── coupons

Relationships: 15+ (FK constraints)
```

---

## 🔌 Endpoints da API

### Auth (2)
- POST /auth/register
- POST /auth/login

### Clients (5)
- POST /clients
- GET /clients
- GET /clients/:id
- PATCH /clients/:id
- DELETE /clients/:id

### Products (6)
- POST /products
- GET /products
- GET /products/:id
- PATCH /products/:id
- DELETE /products/:id
- GET /products/:id/min-price

### Services (5)
- POST /services
- GET /services
- GET /services/:id
- PATCH /services/:id
- DELETE /services/:id

### Invoices (8)
- POST /invoices
- GET /invoices
- GET /invoices/:id
- PATCH /invoices/:id
- POST /invoices/:id/clone
- DELETE /invoices/:id
- GET /invoices/public/:publicUrl (public)
- POST /invoices/public/:publicUrl/approve (public)
- POST /invoices/public/:publicUrl/refuse (public)

### Coupons (6)
- POST /coupons
- GET /coupons
- GET /coupons/:id
- GET /coupons/platform/:platform
- PATCH /coupons/:id
- DELETE /coupons/:id

**Total: 37 endpoints**

---

## 🔑 Arquivos Principais

### Backend
| Arquivo | Responsabilidade |
|---------|------------------|
| `main.ts` | Entry point, validação global |
| `app.module.ts` | Módulo raiz, importações |
| `auth.service.ts` | Lógica de autenticação |
| `prisma.service.ts` | Conexão com banco |
| DTOs | Validação de entrada |
| Controllers | Receber e responder HTTP |
| Services | Lógica de negócio |

### Frontend
| Arquivo | Responsabilidade |
|---------|------------------|
| `main.tsx` | Entry point React |
| `App.tsx` | Routing e layout |
| `api.ts` | Client HTTP |
| `authStore.ts` | Estado de autenticação |
| Pages | Telas da aplicação |
| Components | Componentes reutilizáveis |
| Types | Interfaces TypeScript |

---

## 🎯 Fluxos Principais

### Fluxo de Login
```
1. Usuário acessa /login
2. Preenche email e senha
3. Clica "Entrar"
4. LoginPage chama authStore.login()
5. authStore faz POST /auth/login
6. API valida credenciais
7. JWT token retornado
8. Token armazenado no localStorage
9. Redirect para /dashboard
```

### Fluxo de Criar Orçamento
```
1. Admin vai para criar orçamento
2. Seleciona cliente
3. Adiciona grupos (produtos/serviços)
4. Adiciona itens aos grupos
5. Sistema calcula total automático
6. Clica "Salvar"
7. InvoicesService cria no DB
8. Gera publicUrl único
9. Admin compartilha URL com cliente
10. Cliente recebe link no email
11. Cliente acessa e aprova/recusa
```

### Fluxo de Visualizar Cupom
```
1. Usuário público acessa /coupons
2. CouponsPublicPage carrega lista
3. API retorna cupons ativos
4. Exibe com filtros por plataforma
5. Usuário clica botão "Comprar"
6. Redireciona para link afiliado
```

---

## 🚀 Como Expandir o Projeto

### Adicionar Novo Módulo

```typescript
// 1. Criar pasta: src/modules/novo-modulo/

// 2. Criar estrutura:
src/modules/novo-modulo/
├── dtos/
│   └── novo.dto.ts
├── novo.controller.ts
├── novo.service.ts
└── novo.module.ts

// 3. No novo.module.ts:
@Module({
  controllers: [NovoController],
  providers: [NovoService, PrismaService],
})
export class NovoModule {}

// 4. No app.module.ts:
import { NovoModule } from './modules/novo/novo.module';

@Module({
  imports: [
    // ... outros
    NovoModule,
  ],
})
export class AppModule {}
```

### Adicionar Nova Página Frontend

```typescript
// 1. Criar: src/pages/NovaPage.tsx

// 2. Criar store: src/store/novaStore.ts

// 3. No App.tsx:
<Route path="/nova" element={<ProtectedRoute><NovaPage /></ProtectedRoute>} />

// 4. Chamar store na página
const { data } = useNovaStore();
```

---

## 📚 Referência Rápida

### Variáveis de Ambiente
```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/orchub_db
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h
NODE_ENV=development
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

### Comandos Mais Usados
```bash
# Backend
npm run start:dev        # Desenvolvimento
npm run build            # Build
npm run test             # Testes

# Frontend
npm run dev              # Desenvolvimento
npm run build            # Build
npm run type-check       # Type check

# Banco
npx prisma migrate dev   # Nova migration
npx prisma studio       # Visualizar BD
```

---

**Última atualização**: 5 de janeiro de 2026
