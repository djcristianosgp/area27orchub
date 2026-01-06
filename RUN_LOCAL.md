# 🚀 Como Executar o Are27OrchHub Localmente

## Opção 1: Usando Docker Compose (Recomendado para Produção)

```bash
cd are27orchub
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend na porta 3000  
- Frontend na porta 3001

Acesse em: http://localhost:3001

## Opção 2: Desenvolvimento Local (Recomendado para Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+ rodando localmente

### 1. Iniciar PostgreSQL

```bash
# Se tiver PostgreSQL instalado
pg_ctl start -D "C:\ProgramData\PostgreSQL\data"

# Ou via Docker apenas do Postgres
docker run --name orchub-postgres -e POSTGRES_USER=orchub_user -e POSTGRES_PASSWORD=orchub_password -e POSTGRES_DB=orchub_db -p 5432:5432 -d postgres:15-alpine
```

### 2. Configurar Backend

```bash
cd backend

# Copiar .env
cp .env.local .env

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate deploy

# Iniciar em modo desenvolvimento
npm run start:dev
```

Backend estará disponível em: http://localhost:3000

### 3. Configurar Frontend (em outro terminal)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

Frontend estará disponível em: http://localhost:5173

---

## 🧪 Testando a API

### 1. Registrar um novo usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste User"
  }'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

Copie o `access_token` da resposta.

### 3. Criar um cliente

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_access_token>" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "11999999999",
    "observations": "Cliente importante"
  }'
```

---

## 📊 Usando Prisma Studio

Para visualizar e gerenciar dados no banco:

```bash
cd backend
npx prisma studio
```

Abrirá em: http://localhost:5555

---

## 🆘 Troubleshooting

### PostgreSQL não conecta

1. Verificar se está rodando: `pg_isready -U orchub_user`
2. Verificar conexão string em `.env`
3. Se usar Docker: `docker ps | grep postgres`

### Build do frontend falha

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build do backend falha

```bash
cd backend
npm install
npx prisma generate
npm run build
```

---

## 📝 Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + Prisma + PostgreSQL
- **Auth**: JWT com 24h expiration
- **Database**: PostgreSQL 15

