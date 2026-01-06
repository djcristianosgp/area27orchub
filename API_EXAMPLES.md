# Exemplos de Payloads da API

## 1. Autenticação

### Registrar
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@orchub.com",
    "name": "Administrador",
    "password": "senha123456"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGlkZW50LWlkIiwiZW1haWwiOiJhZG1pbkBvcmNodWIuY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDQzNTM2MDAsImV4cCI6MTcwNDQzOTk5OX0.xyz...",
  "user": {
    "id": "cliidj12345",
    "email": "admin@orchub.com",
    "name": "Administrador",
    "role": "ADMIN"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@orchub.com",
    "password": "senha123456"
  }'
```

---

## 2. Clientes

### Criar Cliente
```bash
curl -X POST http://localhost:3000/clients \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa ABC LTDA",
    "email": "contato@abcltda.com",
    "phone": "(11) 98765-4321",
    "observations": "Cliente corporativo, prazo 30 dias"
  }'
```

**Resposta:**
```json
{
  "id": "client-001",
  "name": "Empresa ABC LTDA",
  "email": "contato@abcltda.com",
  "phone": "(11) 98765-4321",
  "observations": "Cliente corporativo, prazo 30 dias",
  "createdAt": "2024-01-05T10:00:00Z",
  "updatedAt": "2024-01-05T10:00:00Z"
}
```

### Listar Clientes
```bash
curl -X GET http://localhost:3000/clients \
  -H "Authorization: Bearer TOKEN"
```

### Atualizar Cliente
```bash
curl -X PATCH http://localhost:3000/clients/client-001 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(11) 99999-9999"
  }'
```

---

## 3. Produtos

### Criar Produto com Variações
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Gamer",
    "description": "Notebook de alta performance para games e design",
    "category": "Eletrônicos",
    "brand": "ASUS",
    "group": "Computadores",
    "image": "https://images.example.com/notebook-gamer.jpg",
    "variations": [
      {
        "name": "RTX 3070 - 16GB RAM - 512GB SSD",
        "price": 5999.99,
        "affiliateLink": "https://amazon.com.br/asin/B001",
        "observation": "Modelo mais vendido"
      },
      {
        "name": "RTX 4080 - 32GB RAM - 1TB SSD",
        "price": 8999.99,
        "affiliateLink": "https://mercadolivre.com.br/item/ITEM001"
      },
      {
        "name": "RTX 4090 - 48GB RAM - 2TB SSD",
        "price": 12999.99,
        "affiliateLink": "https://aliexpress.com/item/ITEM001"
      }
    ]
  }'
```

**Resposta:**
```json
{
  "id": "prod-001",
  "name": "Notebook Gamer",
  "description": "Notebook de alta performance para games e design",
  "category": "Eletrônicos",
  "brand": "ASUS",
  "group": "Computadores",
  "image": "https://images.example.com/notebook-gamer.jpg",
  "variations": [
    {
      "id": "var-001",
      "name": "RTX 3070 - 16GB RAM - 512GB SSD",
      "price": 5999.99,
      "affiliateLink": "https://amazon.com.br/asin/B001",
      "observation": "Modelo mais vendido"
    },
    {
      "id": "var-002",
      "name": "RTX 4080 - 32GB RAM - 1TB SSD",
      "price": 8999.99,
      "affiliateLink": "https://mercadolivre.com.br/item/ITEM001"
    },
    {
      "id": "var-003",
      "name": "RTX 4090 - 48GB RAM - 2TB SSD",
      "price": 12999.99,
      "affiliateLink": "https://aliexpress.com/item/ITEM001"
    }
  ],
  "createdAt": "2024-01-05T10:00:00Z",
  "updatedAt": "2024-01-05T10:00:00Z"
}
```

### Listar Produtos com Filtros
```bash
curl -X GET "http://localhost:3000/products?category=Eletrônicos&brand=ASUS&group=Computadores" \
  -H "Authorization: Bearer TOKEN"
```

### Obter Preço Mínimo do Produto
```bash
curl -X GET http://localhost:3000/products/prod-001/min-price \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "productId": "prod-001",
  "minPrice": 5999.99
}
```

---

## 4. Serviços

### Criar Serviço com Variações
```bash
curl -X POST http://localhost:3000/services \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consultoria de TI",
    "description": "Serviços de consultoria em tecnologia da informação",
    "variations": [
      {
        "name": "Consultoria Básica - 4 horas",
        "price": 500.00,
        "observation": "Diagnóstico inicial e recomendações"
      },
      {
        "name": "Consultoria Premium - 8 horas",
        "price": 900.00,
        "observation": "Análise detalhada e plano de ação"
      },
      {
        "name": "Consultoria Executiva - 16 horas",
        "price": 1600.00,
        "observation": "Implementação de estratégia"
      }
    ]
  }'
```

---

## 5. Orçamentos

### Criar Orçamento
```bash
curl -X POST http://localhost:3000/invoices \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-001",
    "groups": [
      {
        "name": "Equipamentos",
        "type": "PRODUCT",
        "items": [
          {
            "quantity": 2,
            "unitPrice": 5999.99,
            "productId": "prod-001",
            "productVariationId": "var-001"
          },
          {
            "quantity": 1,
            "unitPrice": 8999.99,
            "productId": "prod-001",
            "productVariationId": "var-002"
          }
        ]
      },
      {
        "name": "Serviços",
        "type": "SERVICE",
        "items": [
          {
            "quantity": 1,
            "unitPrice": 900.00,
            "serviceId": "svc-001",
            "serviceVariationId": "svcvar-001"
          }
        ]
      }
    ]
  }'
```

**Resposta:**
```json
{
  "id": "inv-001",
  "clientId": "client-001",
  "status": "DRAFT",
  "totalAmount": 22899.97,
  "publicUrl": "550e8400-e29b-41d4-a716-446655440000",
  "responseStatus": null,
  "responseDate": null,
  "groups": [
    {
      "id": "grp-001",
      "name": "Equipamentos",
      "type": "PRODUCT",
      "items": [
        {
          "id": "item-001",
          "quantity": 2,
          "unitPrice": 5999.99,
          "totalPrice": 11999.98,
          "productId": "prod-001",
          "productVariationId": "var-001"
        },
        {
          "id": "item-002",
          "quantity": 1,
          "unitPrice": 8999.99,
          "totalPrice": 8999.99,
          "productId": "prod-001",
          "productVariationId": "var-002"
        }
      ]
    },
    {
      "id": "grp-002",
      "name": "Serviços",
      "type": "SERVICE",
      "items": [
        {
          "id": "item-003",
          "quantity": 1,
          "unitPrice": 900.00,
          "totalPrice": 900.00,
          "serviceId": "svc-001",
          "serviceVariationId": "svcvar-001"
        }
      ]
    }
  ],
  "createdAt": "2024-01-05T10:00:00Z",
  "updatedAt": "2024-01-05T10:00:00Z"
}
```

### Atualizar Status para SENT
```bash
curl -X PATCH http://localhost:3000/invoices/inv-001 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SENT"
  }'
```

### Clonar Orçamento
```bash
curl -X POST http://localhost:3000/invoices/inv-001/clone \
  -H "Authorization: Bearer TOKEN"
```

### Visualizar Orçamento Público (sem autenticação)
```bash
curl -X GET http://localhost:3000/invoices/public/550e8400-e29b-41d4-a716-446655440000
```

### Aprovar Orçamento (Cliente)
```bash
curl -X POST http://localhost:3000/invoices/public/550e8400-e29b-41d4-a716-446655440000/approve
```

**Resposta:**
```json
{
  "id": "inv-001",
  "clientId": "client-001",
  "status": "APPROVED",
  "totalAmount": 22899.97,
  "publicUrl": "550e8400-e29b-41d4-a716-446655440000",
  "responseStatus": "APPROVED",
  "responseDate": "2024-01-05T15:30:00Z"
}
```

### Recusar Orçamento (Cliente)
```bash
curl -X POST http://localhost:3000/invoices/public/550e8400-e29b-41d4-a716-446655440000/refuse
```

---

## 6. Cupons

### Criar Cupom
```bash
curl -X POST http://localhost:3000/coupons \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Desconto Especial - Eletrônicos",
    "description": "20% de desconto em toda linha de eletrônicos. Válido só neste mês!",
    "platform": "Amazon",
    "code": "ORCHUB20",
    "affiliateLink": "https://amazon.com.br/deals/orchub20",
    "validUntil": "2024-02-05T23:59:59Z",
    "active": true
  }'
```

**Resposta:**
```json
{
  "id": "coup-001",
  "title": "Desconto Especial - Eletrônicos",
  "description": "20% de desconto em toda linha de eletrônicos. Válido só neste mês!",
  "platform": "Amazon",
  "code": "ORCHUB20",
  "affiliateLink": "https://amazon.com.br/deals/orchub20",
  "validUntil": "2024-02-05T23:59:59Z",
  "active": true,
  "createdAt": "2024-01-05T10:00:00Z",
  "updatedAt": "2024-01-05T10:00:00Z"
}
```

### Listar Cupons Ativos (Público)
```bash
curl -X GET "http://localhost:3000/coupons?active=true"
```

### Listar Cupons por Plataforma (Público)
```bash
curl -X GET http://localhost:3000/coupons/platform/Amazon
```

### Atualizar Cupom
```bash
curl -X PATCH http://localhost:3000/coupons/coup-001 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Desconto Especial - Eletrônicos (Estendido)",
    "validUntil": "2024-03-05T23:59:59Z"
  }'
```

### Deletar Cupom
```bash
curl -X DELETE http://localhost:3000/coupons/coup-001 \
  -H "Authorization: Bearer TOKEN"
```

---

## Variáveis de Ambiente Necessárias

```bash
# Copiar TOKEN da resposta de login/register
export TOKEN="seu_access_token_aqui"

# Usar em todas as requisições autenticadas
curl -X GET http://localhost:3000/clients \
  -H "Authorization: Bearer $TOKEN"
```

---

## Fluxo Completo de Exemplo

1. **Registrar/Login** → Obter token
2. **Criar Cliente** → Obter client-id
3. **Criar Produtos** → Obter product-ids
4. **Criar Serviços** → Obter service-ids
5. **Criar Orçamento** → Obter invoice-id e publicUrl
6. **Enviar para Cliente** → Compartilhar publicUrl
7. **Cliente Visualiza** → Acessa /public/:publicUrl
8. **Cliente Aprova/Recusa** → Endpoint /approve ou /refuse

---

**Última atualização**: 5 de janeiro de 2026
