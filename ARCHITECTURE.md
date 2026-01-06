# Arquitetura do Projeto OrçHub

## 🏗️ Visão Geral

O projeto segue uma arquitetura **3-camadas (3-Tier)** com separação de responsabilidades:

```
┌─────────────────────────────────────────┐
│      Frontend (React + TypeScript)       │
│   UI Components, Pages, Zustand Store    │
└─────────────────────────────────────────┘
             ↓ Axios HTTP Calls ↑
┌─────────────────────────────────────────┐
│     Backend (NestJS + TypeScript)        │
│  Controllers → Services → Repositories   │
└─────────────────────────────────────────┘
         ↓ Prisma ORM Calls ↑
┌─────────────────────────────────────────┐
│      PostgreSQL Database                  │
│   Users, Clients, Products, Invoices...   │
└─────────────────────────────────────────┘
```

---

## 📦 Backend Architecture

### Estrutura de Módulos

```
backend/src/
├── modules/
│   ├── auth/                          # Autenticação e Autorização
│   │   ├── dtos/
│   │   │   └── auth.dto.ts           # Data Transfer Objects
│   │   ├── auth.controller.ts        # HTTP endpoints
│   │   ├── auth.service.ts           # Business logic
│   │   ├── auth.module.ts            # Module configuration
│   │   ├── jwt.strategy.ts           # JWT Passport Strategy
│   │   └── jwt-auth.guard.ts         # Auth Guard
│   │
│   ├── clients/                       # Gestão de Clientes
│   │   ├── dtos/
│   │   │   └── client.dto.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   └── clients.module.ts
│   │
│   ├── products/                      # Gestão de Produtos
│   │   ├── dtos/
│   │   │   └── product.dto.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   │
│   ├── services/                      # Gestão de Serviços
│   │   ├── dtos/
│   │   │   └── service.dto.ts
│   │   ├── services.controller.ts
│   │   ├── services.service.ts
│   │   └── services.module.ts
│   │
│   ├── invoices/                      # Gestão de Orçamentos
│   │   ├── dtos/
│   │   │   └── invoice.dto.ts
│   │   ├── invoices.controller.ts
│   │   ├── invoices.service.ts
│   │   └── invoices.module.ts
│   │
│   └── coupons/                       # Gestão de Cupons
│       ├── dtos/
│       │   └── coupon.dto.ts
│       ├── coupons.controller.ts
│       ├── coupons.service.ts
│       └── coupons.module.ts
│
├── database/
│   └── prisma.service.ts             # Prisma Client Service
│
├── common/                            # Utilities e Helpers
│   ├── decorators/                   # Custom decorators
│   ├── filters/                      # Exception filters
│   ├── interceptors/                 # HTTP interceptors
│   └── pipes/                        # Validation pipes
│
├── app.module.ts                     # Root Module
└── main.ts                           # Application Entry Point
```

### Fluxo de Requisição

```
1. HTTP Request
        ↓
2. Controller (Recebe e valida input)
        ↓
3. DTO Validation (class-validator)
        ↓
4. Service (Aplica regras de negócio)
        ↓
5. Prisma ORM (Interage com DB)
        ↓
6. Database Query
        ↓
7. Resposta formatada
        ↓
8. HTTP Response
```

### Padrão de Módulo

Cada módulo segue este padrão:

```typescript
// DTO - Define estrutura de dados
export class CreateClientDto {
  @IsString()
  name: string;
  
  @IsEmail()
  email: string;
}

// Service - Lógica de negócio
@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }
}

// Controller - HTTP endpoints
@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}
  
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }
}

// Module - Agrupa controller, service, provider
@Module({
  controllers: [ClientsController],
  providers: [ClientsService, PrismaService],
})
export class ClientsModule {}
```

### Fluxo de Autenticação

```
1. Usuário faz login com email/senha
        ↓
2. AuthService valida credenciais
        ↓
3. Gera JWT token (válido 24h)
        ↓
4. Cliente armazena token localmente
        ↓
5. Cada requisição inclui: Authorization: Bearer {token}
        ↓
6. JwtStrategy valida o token
        ↓
7. JwtAuthGuard permite acesso ao recurso
```

---

## 🎨 Frontend Architecture

### Estrutura de Pastas

```
frontend/src/
├── components/
│   ├── ProtectedRoute.tsx            # Route guard component
│   ├── Navbar.tsx                    # Navigation bar
│   ├── Form/                         # Form components
│   ├── Card/                         # Card components
│   └── Modal/                        # Modal components
│
├── pages/
│   ├── LoginPage.tsx                 # Login/Register
│   ├── DashboardPage.tsx             # Admin dashboard
│   ├── ClientsPage.tsx               # Manage clients
│   ├── ProductsPage.tsx              # Manage products
│   ├── InvoicesPage.tsx              # Manage invoices
│   ├── CouponsPublicPage.tsx         # Public coupons list
│   ├── MarketplacePage.tsx           # Public marketplace
│   └── PublicInvoicePage.tsx         # Public invoice view
│
├── store/
│   ├── authStore.ts                  # Auth state (Zustand)
│   ├── clientStore.ts                # Clients state
│   ├── productStore.ts               # Products state
│   ├── invoiceStore.ts               # Invoices state
│   └── couponStore.ts                # Coupons state
│
├── services/
│   └── api.ts                        # Axios API client
│
├── types/
│   └── index.ts                      # TypeScript interfaces
│
├── utils/
│   ├── formatters.ts                 # Format utilities
│   ├── validators.ts                 # Form validators
│   └── helpers.ts                    # Helper functions
│
├── App.tsx                           # Root component
├── main.tsx                          # Entry point
└── index.css                         # Global styles
```

### Fluxo de Estado (Zustand)

```
User interacts with UI
        ↓
Component calls store action
        ↓
Store action calls API service
        ↓
API service sends HTTP request
        ↓
Backend processes request
        ↓
API response received
        ↓
Store updates state
        ↓
React re-renders component
        ↓
User sees updated UI
```

### Exemplo de Store

```typescript
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, password);
      set({
        token: response.data.access_token,
        user: response.data.user,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
  },
}));
```

### Estrutura de Componente

```typescript
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import api from '@services/api';

export const ClientsPage: React.FC = () => {
  // Hooks
  const { user, token } = useAuthStore();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    loadClients();
  }, []);

  // Methods
  const loadClients = async () => {
    try {
      const response = await api.getClients();
      setClients(response.data);
    } finally {
      setLoading(false);
    }
  };

  // Render
  return <div>{/* JSX aqui */}</div>;
};
```

---

## 🗄️ Database Schema

### Relacionamentos Principais

```
User
 └── (1) ← → (∞) Invoice (através de Cliente)

Client
 └── (1) ← → (∞) Invoice

Invoice
 ├── (1) ← → (∞) InvoiceGroup
 └── (∞) ← → (∞) InvoiceItem

InvoiceGroup
 └── (1) ← → (∞) InvoiceItem

Product
 └── (1) ← → (∞) ProductVariation
 └── (∞) ← → (∞) InvoiceItem

Service
 └── (1) ← → (∞) ServiceVariation
 └── (∞) ← → (∞) InvoiceItem

Coupon
 └── (standalone - sem FK)
```

### Principais Queries

```typescript
// Obter orçamento com todos os dados
const invoice = await prisma.invoice.findUnique({
  where: { id: 'inv-001' },
  include: {
    client: true,
    groups: {
      include: {
        items: {
          include: {
            product: { include: { variations: true } },
            service: { include: { variations: true } },
          },
        },
      },
    },
  },
});

// Obter produtos com preço mínimo
const products = await prisma.product.findMany({
  where: {
    category: 'Eletrônicos',
  },
  include: {
    variations: {
      orderBy: { price: 'asc' },
      take: 1,
    },
  },
});

// Obter cupons não expirados e ativos
const activeCoupons = await prisma.coupon.findMany({
  where: {
    active: true,
    validUntil: { gte: new Date() },
  },
  orderBy: { validUntil: 'asc' },
});
```

---

## 🔐 Security Architecture

### Authentication Flow

```
Client                                Server
  ↓                                      ↓
  └─── POST /auth/login ─────────────→  
       (email, password)                
                                        Check in DB
                                        Hash password
                                        Generate JWT
                               ←──── JWT Token + User Data
  Store token in localStorage
  
  └─── GET /clients ──────────────────→
       Authorization: Bearer {JWT}
                                        JwtStrategy validates
                                        Extract user from token
                               ←──── User data or error
```

### Protected Resources

```
Public Routes:
 - /auth/login
 - /auth/register
 - /coupons
 - /invoices/public/:publicUrl

Protected Routes (require JWT):
 - /clients (CRUD)
 - /products (CRUD)
 - /services (CRUD)
 - /invoices (CRUD)
```

---

## 🚀 Performance Considerations

### Backend
- **Índices no DB**: Criados para `email`, `clientId`, `platform`
- **Lazy loading**: Dados relacionados carregados sob demanda
- **Caching**: Implementável com Redis
- **Pagination**: Implementável para grandes listas

### Frontend
- **Code splitting**: Lazy load pages com React.lazy()
- **Memoization**: React.memo() para componentes caros
- **Image optimization**: Lazy load imagens
- **State management**: Zustand é leve e eficiente

---

## 🧪 Testing Strategy

### Backend Tests
```typescript
describe('ClientsService', () => {
  it('should create a client', async () => {
    const result = await service.create(createClientDto);
    expect(result).toHaveProperty('id');
  });
});
```

### Frontend Tests
```typescript
describe('LoginPage', () => {
  it('should login successfully', async () => {
    render(<LoginPage />);
    fireEvent.change(input, { target: { value: 'email@test.com' } });
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });
});
```

---

## 📈 Escalabilidade

### Para suportar crescimento:

1. **Database**: Migrate para managed service (AWS RDS, Digital Ocean)
2. **Cache**: Add Redis para sessões e dados frequentes
3. **Storage**: Upload de imagens em S3/Cloudinary
4. **API Gateway**: Kong ou AWS API Gateway
5. **Load Balancing**: Nginx/HAProxy
6. **Microservices**: Separar auth, invoices, coupons em serviços
7. **Message Queue**: RabbitMQ/Kafka para processos async

---

**Última atualização**: 5 de janeiro de 2026
