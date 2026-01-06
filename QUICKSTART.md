# 🚀 Guia de Início Rápido - OrçHub

## ⚡ Setup em 5 minutos

### 1. Clone ou abra o projeto
```bash
cd are27orchub
```

### 2. Configure o Backend

```bash
cd backend

# Copie o arquivo de ambiente
cp .env.example .env

# Edite o .env com suas configurações:
# DATABASE_URL=postgresql://user:password@localhost:5432/orchub_db
# JWT_SECRET=seu_jwt_secret_muito_seguro

# Instale dependências
npm install

# Se usar Docker, apenas run o compose na raiz do projeto
```

### 3. Configure o Banco de Dados

**Opção A: PostgreSQL Local**
```bash
# Inicie o PostgreSQL (no seu SO)
# Depois na pasta backend:

npx prisma migrate dev --name init
```

**Opção B: Docker Compose**
```bash
# Na raiz do projeto:
docker-compose up -d

# Então:
docker-compose exec backend npx prisma migrate dev --name init
```

### 4. Inicie o Backend

```bash
# Backend em desenvolvimento (hot reload)
npm run start:dev

# Backend em produção
npm run build
npm run start:prod
```

O backend estará em: **http://localhost:3000**

### 5. Configure o Frontend

```bash
cd ../frontend

# Instale dependências
npm install

# Inicie em desenvolvimento
npm run dev
```

O frontend estará em: **http://localhost:3001**

---

## ✅ Verificar se está tudo funcionando

1. **Backend**: Acesse http://localhost:3000/auth/login (deve retornar 404 com método não permitido, ok!)

2. **Frontend**: Acesse http://localhost:3001 (deve abrir a página de cupons públicos)

3. **Database**: 
   ```bash
   # Se usar Docker:
   docker-compose exec postgres psql -U orchub_user -d orchub_db -c "SELECT * FROM users;"
   ```

---

## 📝 Primeiro Teste - Fluxo Completo

### 1. Registrar um admin
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "name": "Admin",
    "password": "password123"
  }'
```

Copie o `access_token` da resposta.

### 2. Criar um cliente
```bash
curl -X POST http://localhost:3000/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "cliente@test.com",
    "phone": "(11) 98765-4321"
  }'
```

### 3. Criar um cupom (público)
```bash
curl -X POST http://localhost:3000/coupons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cupom Teste",
    "platform": "Amazon",
    "code": "TESTE123",
    "affiliateLink": "https://amazon.com",
    "validUntil": "2025-12-31T23:59:59Z",
    "active": true
  }'
```

### 4. Ver cupons públicos (sem autenticação)
```bash
curl http://localhost:3000/coupons
```

---

## 🎯 Stack Visual

```
┌─────────────────────────────────────────────────┐
│               Frontend (React)                   │
│          http://localhost:3001                  │
│  - Páginas públicas (cupons, marketplace)       │
│  - Admin (clientes, produtos, serviços, orcam)  │
└─────────────────────────────────────────────────┘
                       ↓ Axios
┌─────────────────────────────────────────────────┐
│            Backend (NestJS)                      │
│         http://localhost:3000                   │
│  REST API com JWT Authentication                │
└─────────────────────────────────────────────────┘
                       ↓ Prisma ORM
┌─────────────────────────────────────────────────┐
│           PostgreSQL Database                    │
│        localhost:5432 (Docker ou Local)         │
└─────────────────────────────────────────────────┘
```

---

## 📂 Estrutura Básica

```
src/
├── modules/                  # Funcionalidades principais
│   ├── auth/                # Autenticação JWT
│   ├── clients/             # Clientes
│   ├── products/            # Produtos
│   ├── services/            # Serviços
│   ├── invoices/            # Orçamentos
│   └── coupons/             # Cupons
├── database/                # Conexão Prisma
├── common/                  # Utilities comuns
├── app.module.ts           # Módulo raiz
└── main.ts                 # Ponto de entrada
```

---

## 🔧 Comandos Úteis

### Backend
```bash
# Gerar nova migration
npx prisma migrate dev --name nome_da_migracao

# Visualizar banco em UI
npx prisma studio

# Resetar banco (DELETE ALL DATA!)
npx prisma migrate reset

# Type-check
npm run type-check
```

### Frontend
```bash
# Build para produção
npm run build

# Preview build local
npm run preview

# Type check
npm run type-check
```

### Docker
```bash
# Parar tudo
docker-compose down

# Resetar volumes
docker-compose down -v

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Executar comando no container
docker-compose exec backend npm run build
```

---

## 🐛 Troubleshooting

### "Connection refused" ao conectar no BD
- Verifique se PostgreSQL está rodando
- Confira a DATABASE_URL no .env
- Se usar Docker: `docker-compose ps` (postgres deve estar UP)

### "Cannot find module" no backend
- Delete `node_modules` e `package-lock.json`
- Run `npm install` novamente

### Port 3000 já em uso
```bash
# Mudar porta no backend .env
PORT=3001

# Ou matar processo:
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Erro no Prisma
```bash
npm install @prisma/client
npx prisma generate
npx prisma migrate dev
```

---

## 📚 Próximos Passos

1. **Leia o README.md** - Documentação completa
2. **Veja API_EXAMPLES.md** - Exemplos de todas as rotas
3. **Explore o código** - Bem estruturado e comentado
4. **Personalize** - Adicione suas funcionalidades

---

## 🎨 UI/UX

- Interface moderna com Tailwind CSS
- Tema claro/responsivo
- Componentes reutilizáveis
- Acessível e intuitiva

---

## ⚙️ Configurações Importantes

### JWT
- Expira em 24h (configurável)
- Enviado no header: `Authorization: Bearer TOKEN`
- Gerado com bcrypt + senha segura

### Banco de Dados
- Relacionamentos bem definidos
- Cascata de delete configurada
- Índices para performance

### API
- Validação em todas as requisições
- Tratamento de erros consistente
- Paginação (quando necessário)

---

## 📞 Suporte

Consulte a documentação em:
- **README.md** - Guia completo
- **API_EXAMPLES.md** - Exemplos de requisições

---

**Sucesso! 🎉 Seu sistema está pronto para decolar!**
