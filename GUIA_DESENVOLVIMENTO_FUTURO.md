# 🔧 GUIA DE DESENVOLVIMENTO - ADIÇÕES FUTURAS

Este documento fornece guia para desenvolver novas funcionalidades no OrchHub.

---

## 📋 Principais Áreas para Expansão

### 1. Integração com Pagamentos 💳

**Opção 1: Stripe**
```typescript
// backend/src/modules/payments/payment.service.ts
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createPaymentIntent(amount: number, invoiceId: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      metadata: { invoiceId }
    });
    return intent;
  }
}
```

**Opção 2: PagSeguro**
```typescript
// backend/src/modules/payments/pagseguro.service.ts
import axios from 'axios';

@Injectable()
export class PagSeguroService {
  async createCheckout(items: any[]) {
    const response = await axios.post(
      'https://api.pagseguro.com/v1/checkout',
      { items },
      { headers: { Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN}` } }
    );
    return response.data;
  }
}
```

### 2. Notificações por Email 📧

```typescript
// backend/src/modules/notifications/email.service.ts
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  async sendInvoiceApprovalEmail(client: Client, invoice: Invoice) {
    await this.mailer.sendMail({
      to: client.email,
      subject: 'Orçamento Aprovado!',
      html: this.getApprovalTemplate(invoice)
    });
  }

  private getApprovalTemplate(invoice: Invoice): string {
    return `
      <h1>Orçamento Aprovado</h1>
      <p>Seu orçamento #${invoice.id} foi aprovado com sucesso!</p>
      <p>Total: R$ ${invoice.total.toFixed(2)}</p>
    `;
  }
}
```

### 3. Relatórios e Analytics 📊

```typescript
// backend/src/modules/reports/report.service.ts
@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getInvoiceStats(startDate: Date, endDate: Date) {
    const stats = await this.prisma.invoice.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: { total: true },
      _count: true,
      _avg: { total: true }
    });
    
    return stats;
  }

  async generatePDF(invoiceId: string) {
    // Usar library como pdfkit ou puppeteer
  }
}
```

Frontend com gráficos:
```tsx
// frontend/src/pages/admin/ReportsPage.tsx
import { LineChart, BarChart } from 'recharts';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/stats').then(r => setStats(r.data));
  }, []);

  return (
    <div>
      <LineChart data={stats?.monthly} />
      <BarChart data={stats?.byProduct} />
    </div>
  );
};
```

### 4. Integração com APIs de Afiliados 🔗

**Amazon Product Advertising API:**
```typescript
// backend/src/modules/affiliates/amazon.service.ts
import * as AWS from 'aws-sdk';

@Injectable()
export class AmazonService {
  private paapi = new AWS.ProductAdvertisingAPI({
    // configuração
  });

  async searchProduct(query: string) {
    const result = await this.paapi.searchItems({
      SearchIndex: 'All',
      Keywords: query
    });
    return result;
  }
}
```

### 5. Sistema de Controle de Acesso (RBAC) 👥

```typescript
// backend/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// backend/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

// Uso:
@Post('/admin/users')
@Roles('admin')
createUser(@Body() dto: CreateUserDto) {
  // apenas admin
}
```

### 6. Webhooks para Atualizações em Tempo Real 🔔

```typescript
// backend/src/modules/webhooks/webhook.service.ts
@Injectable()
export class WebhookService {
  async triggerWebhook(event: string, data: any) {
    // Buscar URLs registradas
    const webhooks = await this.prisma.webhook.findMany({
      where: { event, active: true }
    });

    for (const webhook of webhooks) {
      try {
        await axios.post(webhook.url, {
          event,
          data,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Webhook failed: ${webhook.url}`);
        // Retry logic
      }
    }
  }
}

// Usar em eventos:
async createInvoice(dto: CreateInvoiceDto) {
  const invoice = await this.prisma.invoice.create({ data: dto });
  await this.webhookService.triggerWebhook('invoice.created', invoice);
  return invoice;
}
```

### 7. Sincronização com Shopify 🛍️

```typescript
// backend/src/modules/shopify/shopify.service.ts
@Injectable()
export class ShopifyService {
  private shopify = new shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET
  });

  async syncProducts() {
    const localProducts = await this.prisma.product.findMany();
    
    for (const product of localProducts) {
      await this.shopify.graphql(`
        mutation {
          productCreate(input: {
            title: "${product.name}"
            bodyHtml: "${product.description}"
          }) {
            product { id }
          }
        }
      `);
    }
  }
}
```

### 8. Cache com Redis ⚡

```typescript
// backend/src/modules/cache/cache.service.ts
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private redis = new Redis(process.env.REDIS_URL);

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}

// Usar em controllers:
@Get('/products')
async getProducts() {
  const cached = await this.cacheService.get('products:all');
  if (cached) return cached;

  const products = await this.productsService.findAll();
  await this.cacheService.set('products:all', products, 3600);
  return products;
}
```

### 9. Autenticação OAuth2 (Google/GitHub) 🔐

```typescript
// backend/src/modules/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuthUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName
    });
    done(null, user);
  }
}
```

### 10. Testes Automatizados 🧪

```typescript
// backend/test/invoices.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from '../src/modules/invoices/invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoicesService]
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should create an invoice', async () => {
    const dto = { clientId: 1, items: [] };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

Frontend:
```tsx
// frontend/test/pages/InvoicesPage.test.tsx
import { render, screen } from '@testing-library/react';
import { InvoicesPageNew } from '@pages/admin/InvoicesPageNew';

describe('InvoicesPageNew', () => {
  it('renders invoice list', () => {
    render(<InvoicesPageNew />);
    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
  });
});
```

---

## 🛠️ Estrutura para Novas Features

### Passo 1: Criar Module (Backend)

```bash
# Criar estrutura
mkdir -p backend/src/modules/my-feature/{controllers,services,dto}

# Files
backend/src/modules/my-feature/my-feature.module.ts
backend/src/modules/my-feature/my-feature.service.ts
backend/src/modules/my-feature/my-feature.controller.ts
backend/src/modules/my-feature/dto/create-my-feature.dto.ts
backend/src/modules/my-feature/dto/update-my-feature.dto.ts
```

### Passo 2: Criar Prisma Model

```prisma
// prisma/schema.prisma
model MyFeature {
  id        Int     @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
# Gerar migration
npx prisma migrate dev --name add_my_feature
```

### Passo 3: Criar Frontend Page

```bash
# Criar página
mkdir -p frontend/src/pages/admin/MyFeaturePage
touch frontend/src/pages/admin/MyFeaturePage.tsx

# Importar em index.ts
echo "export * from './MyFeaturePage';" >> frontend/src/pages/admin/index.ts
```

### Passo 4: Adicionar Rota

```tsx
// frontend/src/App.tsx
import { MyFeaturePage } from '@pages/admin/MyFeaturePage';

// Adicionar em rotas...
<Route path="/admin/my-feature" element={<MyFeaturePage />} />
```

---

## 📚 Recomendações

### Dependências Úteis

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "stripe": "^13.0.0",
    "nodemailer": "^6.9.0",
    "redis": "^4.6.0",
    "axios": "^1.4.0",
    "recharts": "^2.10.0"
  }
}
```

### Bibliotecas Frontend

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0",
    "react-query": "^3.39.0",
    "react-hook-form": "^7.47.0"
  }
}
```

### Best Practices

- ✅ Sempre usar TypeScript
- ✅ Criar testes para novas features
- ✅ Documentar no README
- ✅ Usar DTOs para validação
- ✅ Seguir padrão de projeto
- ✅ Adicionar tipos ao Prisma
- ✅ Validar no frontend e backend
- ✅ Tratamento de erros consistente

---

## 🔄 Workflow de Desenvolvimento

1. **Criar branch**
   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Desenvolver feature**
   - Criar backend (service + controller)
   - Criar frontend (page + components)
   - Adicionar testes

3. **Commitar**
   ```bash
   git add .
   git commit -m "feat: adicionar minha feature"
   ```

4. **Testar localmente**
   ```bash
   docker-compose up -d --build
   # Testar em http://localhost:3001
   ```

5. **Fazer PR**
   - Descrever mudanças
   - Lincar issues
   - Aguardar review

---

## 💡 Exemplos de Features Populares

### Feature: Múltiplos Usuários por Empresa

```typescript
// Adicionar ao Prisma
model User {
  id        Int @id @default(autoincrement())
  companyId Int
  company   Company @relation(fields: [companyId], references: [id])
}

model Company {
  id    Int @id @default(autoincrement())
  users User[]
}
```

### Feature: Produtos em Destaque

```typescript
// Backend
@Patch('/products/:id/highlight')
async highlightProduct(@Param('id') id: string) {
  return this.productsService.update(id, { featured: true });
}

// Frontend
<Button onClick={() => api.patch(`/products/${id}/highlight`)}>
  Destacar Produto
</Button>
```

### Feature: Exportar para Excel

```typescript
// Backend
import * as ExcelJS from 'exceljs';

async exportInvoices() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orçamentos');
  
  const invoices = await this.prisma.invoice.findMany();
  worksheet.addRows(invoices);
  
  await workbook.xlsx.writeFile('invoices.xlsx');
  return 'invoices.xlsx';
}
```

---

**Última atualização:** 15/01/2026
**Versão:** 1.0
