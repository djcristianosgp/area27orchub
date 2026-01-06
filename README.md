# OrçHub - Sistema de Orçamentos Virtuais, Cupons e Produtos Afiliados

Um sistema web fullstack moderno para geração de orçamentos virtuais, compartilhamento de cupons de desconto e produtos com links de afiliados.

## 🚀 Stack Tecnológico

### Backend
- **Framework**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)
- **API**: REST com validações (class-validator)

### Frontend
- **Framework**: React 18 + TypeScript
- **Estado Global**: Zustand
- **Roteamento**: React Router v6
- **Estilo**: Tailwind CSS
- **Build**: Vite
- **HTTP Client**: Axios

## 📋 Funcionalidades Principais

### 1. Orçamentos Virtuais
- ✅ Cadastro de Clientes
- ✅ Cadastro de Produtos com Variações
- ✅ Cadastro de Serviços com Variações
- ✅ Criação e Edição de Orçamentos
- ✅ Grupos de Produtos e Serviços
- ✅ Clone de Orçamentos
- ✅ Link Público para Visualização
- ✅ Aprovação/Recusa via Link Público
- ✅ Cálculo Automático de Totais

### 2. Cupons de Desconto
- ✅ Página Pública de Cupons
- ✅ Filtro por Plataforma
- ✅ Código do Cupom
- ✅ Link Afiliado
- ✅ Data de Validade
- ✅ Status Ativo/Inativo

### 3. Marketplace de Produtos
- ✅ Página Pública com Layout Atrativo
- ✅ Filtros: Categoria, Marca, Grupo
- ✅ Visualização de Preço Mínimo
- ✅ Links de Afiliados
- ✅ SEO Friendly

## 📁 Estrutura do Projeto

```
are27orchub/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── dtos/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   ├── clients/
│   │   │   ├── products/
│   │   │   ├── services/
│   │   │   ├── invoices/
│   │   │   └── coupons/
│   │   ├── common/
│   │   ├── database/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## 🛠️ Setup Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### Instalação

#### 1. Backend

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Instalar dependências
npm install

# Configurar banco de dados
npx prisma migrate dev

# Iniciar em desenvolvimento
npm run start:dev
```

#### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

A aplicação estará disponível em:
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

## 🐳 Setup com Docker Compose

```bash
# Criar e iniciar containers
docker-compose up -d

# Executar migrations no banco
docker-compose exec backend npx prisma migrate dev

# Parar containers
docker-compose down
```

## 📚 Documentação de Endpoints

### Autenticação

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "João Silva",
  "password": "senha123"
}

Response: 201 Created
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "role": "ADMIN"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}

Response: 200 OK
{
  "access_token": "...",
  "user": {...}
}
```

### Clientes

#### Criar Cliente
```http
POST /clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Empresa XYZ",
  "email": "contato@xyz.com",
  "phone": "(11) 9999-9999",
  "observations": "Cliente VIP"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Empresa XYZ",
  "email": "contato@xyz.com",
  "phone": "(11) 9999-9999",
  "observations": "Cliente VIP",
  "createdAt": "2024-01-05T10:00:00Z",
  "updatedAt": "2024-01-05T10:00:00Z"
}
```

#### Listar Clientes
```http
GET /clients
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Empresa XYZ",
    ...
  }
]
```

#### Obter Cliente
```http
GET /clients/:id
Authorization: Bearer {token}
```

#### Atualizar Cliente
```http
PATCH /clients/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Empresa XYZ Ltda",
  "email": "novo@xyz.com"
}
```

#### Deletar Cliente
```http
DELETE /clients/:id
Authorization: Bearer {token}
```

### Produtos

#### Criar Produto
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Notebook Dell",
  "description": "Notebook de alta performance",
  "category": "Eletrônicos",
  "brand": "Dell",
  "group": "Computadores",
  "image": "https://...",
  "variations": [
    {
      "name": "Core i5 8GB SSD 256GB",
      "price": 2500.00,
      "affiliateLink": "https://amazon.com/...",
      "observation": "Melhor custo-benefício"
    },
    {
      "name": "Core i7 16GB SSD 512GB",
      "price": 3500.00,
      "affiliateLink": "https://amazon.com/..."
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Notebook Dell",
  "variations": [...]
}
```

#### Listar Produtos
```http
GET /products?category=Eletrônicos&brand=Dell&group=Computadores
Authorization: Bearer {token}
```

#### Obter Preço Mínimo
```http
GET /products/:id/min-price
Authorization: Bearer {token}

Response: 200 OK
{
  "productId": "uuid",
  "minPrice": 2500.00
}
```

### Serviços

#### Criar Serviço
```http
POST /services
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Consultoria Empresarial",
  "description": "Serviço de consultoria estratégica",
  "variations": [
    {
      "name": "Pacote Básico - 4 horas",
      "price": 500.00,
      "observation": "Inclui diagnóstico inicial"
    },
    {
      "name": "Pacote Premium - 8 horas",
      "price": 900.00
    }
  ]
}
```

### Orçamentos

#### Criar Orçamento
```http
POST /invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "uuid-do-cliente",
  "groups": [
    {
      "name": "Equipamentos de TI",
      "type": "PRODUCT",
      "items": [
        {
          "quantity": 2,
          "unitPrice": 2500.00,
          "productId": "uuid",
          "productVariationId": "uuid"
        }
      ]
    },
    {
      "name": "Serviços",
      "type": "SERVICE",
      "items": [
        {
          "quantity": 1,
          "unitPrice": 500.00,
          "serviceId": "uuid",
          "serviceVariationId": "uuid"
        }
      ]
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "clientId": "uuid",
  "status": "DRAFT",
  "totalAmount": 5500.00,
  "publicUrl": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "groups": [...]
}
```

#### Listar Orçamentos
```http
GET /invoices?clientId=uuid
Authorization: Bearer {token}
```

#### Clonar Orçamento
```http
POST /invoices/:id/clone
Authorization: Bearer {token}

Response: 201 Created
{
  "id": "novo-uuid",
  "clientId": "uuid",
  "status": "DRAFT",
  ...
}
```

#### Atualizar Status
```http
PATCH /invoices/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "SENT"
}
```

#### Visualizar Orçamento Público
```http
GET /invoices/public/:publicUrl
```

#### Aprovar Orçamento
```http
POST /invoices/public/:publicUrl/approve
```

#### Recusar Orçamento
```http
POST /invoices/public/:publicUrl/refuse
```

### Cupons

#### Criar Cupom
```http
POST /coupons
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Desconto 20% em Eletrônicos",
  "description": "Válido para toda linha de eletrônicos",
  "platform": "Amazon",
  "code": "ORCHUB20",
  "affiliateLink": "https://amazon.com/...",
  "validUntil": "2024-12-31T23:59:59Z",
  "active": true
}
```

#### Listar Cupons Ativos
```http
GET /coupons?active=true
```

#### Listar Cupons por Plataforma
```http
GET /coupons/platform/Amazon
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) para autenticação. 

**Como usar:**
1. Registre ou faça login para obter o `access_token`
2. Inclua o token em todas as requisições autenticadas:
   ```http
   Authorization: Bearer {access_token}
   ```

O token expira em 24h (configurável via `.env`).

## 🎨 Interface Pública

- **Página de Cupons**: `/coupons` - Exibe todos os cupons ativos com filtro por plataforma
- **Orçamento Público**: `/invoices/:publicUrl` - Cliente pode visualizar e aprovar/recusar

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/orchub_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h
NODE_ENV=development
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Deploy

### Produção com Docker

```bash
# Build das imagens
docker-compose build

# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 📖 Modelo de Dados

### User (Usuários)
- id: UUID
- email: String (unique)
- password: String (hash bcrypt)
- name: String
- role: Enum (ADMIN, USER, VIEWER)

### Client (Clientes)
- id: UUID
- name: String
- email: String
- phone: String
- observations: String (opcional)

### Product (Produtos)
- id: UUID
- name: String
- description: String (opcional)
- category: String
- brand: String
- group: String
- image: String (opcional)

### ProductVariation (Variações de Produto)
- id: UUID
- name: String
- price: Decimal
- affiliateLink: String (opcional)
- observation: String (opcional)
- productId: UUID (FK)

### Service (Serviços)
- id: UUID
- name: String
- description: String (opcional)

### ServiceVariation (Variações de Serviço)
- id: UUID
- name: String
- price: Decimal
- observation: String (opcional)
- serviceId: UUID (FK)

### Invoice (Orçamentos)
- id: UUID
- clientId: UUID (FK)
- status: Enum (DRAFT, SENT, APPROVED, REFUSED)
- totalAmount: Decimal
- publicUrl: String (unique)
- responseStatus: String (APPROVED, REFUSED)
- responseDate: DateTime (opcional)

### InvoiceGroup (Grupos de Orçamento)
- id: UUID
- name: String
- type: Enum (PRODUCT, SERVICE)
- invoiceId: UUID (FK)

### InvoiceItem (Itens de Orçamento)
- id: UUID
- quantity: Int
- unitPrice: Decimal
- totalPrice: Decimal
- invoiceId: UUID (FK)
- invoiceGroupId: UUID (FK)
- productId: UUID (FK, opcional)
- serviceId: UUID (FK, opcional)

### Coupon (Cupons)
- id: UUID
- title: String
- description: String (opcional)
- platform: String
- code: String (unique)
- affiliateLink: String
- validUntil: DateTime
- active: Boolean

## 📄 Licença

MIT

## 👨‍💼 Autor

Desenvolvido por um desenvolvedor fullstack sênior.

---

**Última atualização**: 5 de janeiro de 2026
