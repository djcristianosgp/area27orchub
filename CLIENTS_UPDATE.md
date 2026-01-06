# 🎉 Atualização: Sistema Expandido de Clientes

## Resumo das Alterações

A página de cadastro de clientes foi completamente refatorada para suportar um modelo de dados muito mais robusto e completo. O sistema agora permite gerenciar clientes com todas as informações essenciais para negócios modernos.

---

## ✨ Novas Funcionalidades

### 1. **Dados Básicos Expandidos**
- ✅ Nome/Razão Social (obrigatório)
- ✅ Apelido/Nome Fantasia
- ✅ CPF/CNPJ (único no sistema)
- ✅ Status (Ativo, Inativo, Bloqueado)

### 2. **Endereço Completo**
- ✅ Logradouro
- ✅ Número
- ✅ Bairro
- ✅ Cidade
- ✅ CEP
- ✅ Estado

### 3. **Múltiplos Emails**
- ✅ Adicionar/remover emails ilimitados
- ✅ Marcar email como principal
- ✅ Validação de formato de email

### 4. **Múltiplos Telefones**
- ✅ Adicionar/remover telefones ilimitados
- ✅ Marcar se tem WhatsApp
- ✅ Marcar telefone como principal
- ✅ Exibição de ícone WhatsApp (📱) na tabela

### 5. **Redes Sociais**
- ✅ Suporte para: Instagram, Facebook, LinkedIn, TikTok, Twitter, YouTube, Outro
- ✅ Guardar URL de perfil
- ✅ Adicionar/remover redes ilimitadas

### 6. **Observações**
- ✅ Campo texto livre para anotações sobre o cliente

---

## 📊 Tabela de Listagem Melhorada

A tabela principal agora exibe:

| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome principal + Apelido (se houver) |
| **CPF/CNPJ** | Documento do cliente |
| **Email Principal** | Email marcado como principal |
| **Telefone** | Telefone principal + ícone 📱 se tem WhatsApp |
| **Status** | Badge com cor: ✅ Ativo, ⏸️ Inativo, 🚫 Bloqueado |
| **Cadastro** | Data de criação formatada |
| **Ações** | Botões editar (✏️) e deletar (🗑️) |

---

## 🔧 Estrutura do Modal

O modal de criação/edição possui **6 seções** bem organizadas:

### 1️⃣ **Dados Básicos** (📋)
```
Nome/Razão Social (obrigatório)
Apelido/Nome Fantasia
CPF/CNPJ
Status (dropdown)
```

### 2️⃣ **Endereço** (🏠)
```
Logradouro
Número | Bairro | CEP
Cidade | Estado
```

### 3️⃣ **Emails** (✉️)
```
+ Email (botão para adicionar)
[email@example.com] [Principal ☑] [✕]
[outro@email.com]   [Principal ☐] [✕]
```

### 4️⃣ **Telefones** (📱)
```
+ Telefone (botão para adicionar)
[(11) 99999-9999] [WhatsApp ☑] [Principal ☑] [✕]
[(11) 98888-8888] [WhatsApp ☐] [Principal ☐] [✕]
```

### 5️⃣ **Redes Sociais** (🌐)
```
+ Rede Social (botão para adicionar)
[Instagram ▼] [https://instagram.com/...] [✕]
[LinkedIn   ▼] [https://linkedin.com/...]  [✕]
```

### 6️⃣ **Observações** (📝)
```
[Textarea - Anotações sobre o cliente...]
```

---

## 🗄️ Alterações no Backend

### Banco de Dados (Prisma Schema)

**Novo modelo `ClientEmail`:**
```prisma
model ClientEmail {
  id        String   @id @default(cuid())
  clientId  String
  email     String
  primary   Boolean  @default(false)
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  @@unique([clientId, email])
  @@index([clientId])
}
```

**Novo modelo `ClientPhone`:**
```prisma
model ClientPhone {
  id          String   @id @default(cuid())
  clientId    String
  phone       String
  hasWhatsapp Boolean  @default(false)
  primary     Boolean  @default(false)
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  @@index([clientId])
}
```

**Novo modelo `ClientSocialMedia`:**
```prisma
model ClientSocialMedia {
  id       String   @id @default(cuid())
  clientId String
  platform String
  url      String
  client   Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  @@index([clientId])
}
```

**Modelo `Client` atualizado:**
```prisma
model Client {
  id              String   @id @default(cuid())
  name            String
  nickname        String?
  cpfCnpj         String?  @unique
  status          String   @default("ACTIVE")
  street          String?
  number          String?
  neighborhood    String?
  city            String?
  zipCode         String?
  state           String?
  observations    String?
  
  // Relacionamentos
  emails          ClientEmail[]
  phones          ClientPhone[]
  socialMedia     ClientSocialMedia[]
  invoices        Invoice[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Migration SQL

Arquivo: `prisma/migrations/20260106160000_expand_client_fields/migration.sql`

Cria todas as tabelas e relacionamentos necessários.

### DTOs do Backend

**CreateClientDto e UpdateClientDto** agora incluem:
```typescript
{
  name: string;                    // obrigatório
  nickname?: string;
  cpfCnpj?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  emails?: {
    email: string;
    primary?: boolean;
  }[];
  phones?: {
    phone: string;
    hasWhatsapp?: boolean;
    primary?: boolean;
  }[];
  socialMedia?: {
    platform: string;
    url: string;
  }[];
  observations?: string;
}
```

### Service Layer (`ClientsService`)

- ✅ `create()`: Cria cliente com relacionamentos aninhados
- ✅ `findAll()`: Retorna clientes com emails, phones e socialMedia
- ✅ `findOne()`: Retorna cliente completo com invoices
- ✅ `update()`: Atualiza cliente e gerencia cascade de emails, phones, socialMedia
- ✅ `delete()`: Delete cascade automático via Prisma

---

## 📱 Alterações no Frontend

### Tipos TypeScript

[frontend/src/types/index.ts](frontend/src/types/index.ts) - Interfaces criadas:

```typescript
export interface ClientEmail {
  id?: string;
  email: string;
  primary?: boolean;
}

export interface ClientPhone {
  id?: string;
  phone: string;
  hasWhatsapp?: boolean;
  primary?: boolean;
}

export interface ClientSocialMedia {
  id?: string;
  platform: string;
  url: string;
}

export interface Client {
  id: string;
  name: string;
  nickname?: string;
  cpfCnpj?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  emails: ClientEmail[];
  phones: ClientPhone[];
  socialMedia: ClientSocialMedia[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Página [frontend/src/pages/admin/ClientsPage.tsx](frontend/src/pages/admin/ClientsPage.tsx)

**Funcionalidades:**

- ✅ Estado (formData) com 15+ campos
- ✅ Validação obrigatória: nome, pelo menos 1 email, pelo menos 1 telefone
- ✅ Handlers para CRUD: `handleNew()`, `handleEdit()`, `handleSave()`, `handleDelete()`
- ✅ Handlers para arrays dinâmicos: `handleAddEmail()`, `handleRemoveEmail()`, etc.
- ✅ Tabela com display inteligente de dados relacionados
- ✅ Modal com 6 seções scrollável

---

## 🚀 Como Usar

### 1. Executar Migrations (Backend)

```bash
cd backend
npx prisma migrate dev
```

Isso vai:
- Criar as 3 novas tabelas (client_emails, client_phones, client_social_media)
- Adicionar 8 novos campos à tabela clients
- Criar índices e constraints

### 2. Iniciar o Backend

```bash
cd backend
npm run start:dev
```

### 3. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

### 4. Acessar Página de Clientes

1. Fazer login em `http://localhost:5173/login`
2. Navegar para "👥 Gerenciar Clientes" no menu
3. Clicar em "+ Novo Cliente"
4. Preencher os campos e clicar "Criar Cliente"

---

## ✅ Validações Aplicadas

- ✅ **Nome obrigatório**
- ✅ **Pelo menos 1 email** (com validação de formato)
- ✅ **Pelo menos 1 telefone**
- ✅ **CPF/CNPJ único** no banco de dados
- ✅ **Dropdown de status** previne valores inválidos
- ✅ **Redes sociais** com plataformas pré-definidas

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **POST** | `/clients` | Criar novo cliente |
| **GET** | `/clients` | Listar todos os clientes |
| **GET** | `/clients/:id` | Obter cliente específico |
| **PATCH** | `/clients/:id` | Atualizar cliente |
| **DELETE** | `/clients/:id` | Deletar cliente |

---

## 🎨 Design & UX

- ✅ **Emojis** em cada seção do modal para melhor visualização
- ✅ **Cores por status** na tabela (verde, amarelo, vermelho)
- ✅ **Indicador WhatsApp** (📱) quando telefone tem WhatsApp
- ✅ **Botões de ação** com cores intuitivas (azul para editar, vermelho para deletar)
- ✅ **Scroll interno** no modal para suportar muitos campos
- ✅ **Feedback visual** de erro/sucesso
- ✅ **Responsivo** em mobile

---

## 🔗 Relacionamentos com Orçamentos

Os clientes agora podem ser facilmente vinculados a múltiplos orçamentos. O campo `invoices` permite consultar todos os orçamentos de um cliente:

```typescript
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    invoices: true,  // Todos os orçamentos do cliente
    emails: true,
    phones: true,
    socialMedia: true,
  }
});
```

---

## 📚 Próximos Passos

- [ ] Adicionar validação de CPF/CNPJ (formato correto)
- [ ] Adicionar campo de foto/avatar do cliente
- [ ] Adicionar histórico de modificações (auditoria)
- [ ] Adicionar filtros avançados na tabela
- [ ] Adicionar exportação para CSV/Excel
- [ ] Integração com WhatsApp API (envio de mensagens)

---

## 🐛 Troubleshooting

### Erro: "Column does not exist"
**Solução:** Executar `npx prisma migrate dev` para aplicar migrações

### Erro: "Client with cpfCnpj already exists"
**Solução:** CPF/CNPJ já cadastrado no sistema

### Modal não mostra campos
**Solução:** Verificar console do navegador para erros de TypeScript

### API retorna 400 Bad Request
**Solução:** Validar que o JSON enviado corresponde aos DTOs esperados

---

## 📝 Exemplos de Payload

### Criar Cliente

```json
{
  "name": "João Silva",
  "nickname": "João SP",
  "cpfCnpj": "123.456.789-00",
  "status": "ACTIVE",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Vila Mariana",
  "city": "São Paulo",
  "zipCode": "04014-020",
  "state": "SP",
  "emails": [
    { "email": "joao@example.com", "primary": true },
    { "email": "joao.silva@work.com", "primary": false }
  ],
  "phones": [
    { "phone": "(11) 99999-9999", "hasWhatsapp": true, "primary": true },
    { "phone": "(11) 98888-8888", "hasWhatsapp": false, "primary": false }
  ],
  "socialMedia": [
    { "platform": "Instagram", "url": "https://instagram.com/joaosilva" },
    { "platform": "LinkedIn", "url": "https://linkedin.com/in/joaosilva" }
  ],
  "observations": "Cliente preferencial, desconto de 10%"
}
```

### Atualizar Cliente

```json
{
  "nickname": "João SP - Novo",
  "status": "INACTIVE",
  "emails": [
    { "email": "joao.novo@example.com", "primary": true }
  ]
}
```

---

**Implementado com ❤️ em 2025**
