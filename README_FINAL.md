# 🏢 OrchHub - Orçamentos Virtuais

Plataforma web fullstack para **geração de orçamentos virtuais**, **compartilhamento de cupons de desconto** e **marketplace de produtos com links de afiliados**.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-blue)]()

---

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose instalados
- Git (opcional)

### Instalação (2 minutos)

```bash
# 1. Clone ou copie o projeto
git clone <seu-repo>
cd orchub

# 2. Inicie os containers
docker-compose up -d --build

# 3. Aguarde 10-15 segundos e acesse
```

### URLs
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Database**: localhost:5463

### Login Padrão
```
Email: master@area27.com
Senha: Master@123
```

---

## ✨ Funcionalidades

### 📊 Orçamentos Virtuais
- ✅ Criar e gerenciar orçamentos
- ✅ Adicionar múltiplos itens (produtos/serviços)
- ✅ Cálculo automático de total
- ✅ Gerar link público para compartilhamento
- ✅ Cliente aprova/recusa via link
- ✅ Clone de orçamentos
- ✅ Status tracking completo

### 🎟️ Cupons de Desconto
- ✅ Cadastro de cupons
- ✅ Filtros por plataforma
- ✅ Data de validade
- ✅ Página pública
- ✅ Links de afiliado

### 🛒 Marketplace
- ✅ Grid responsivo de produtos
- ✅ Filtros avançados
- ✅ Menor preço visível
- ✅ Botão comprar com link de afiliado
- ✅ Acesso sem autenticação

### 👥 Gerenciamento
- ✅ CRUD de clientes
- ✅ CRUD de produtos com variações
- ✅ CRUD de serviços
- ✅ CRUD de categorias, marcas, grupos
- ✅ Gestão de cupons

---

## 🏗️ Arquitetura

```
OrchHub
├── Frontend (React 18)
│   └── UI moderna com Tailwind CSS
├── Backend (NestJS)
│   └── API REST com JWT
└── Database (PostgreSQL 15)
    └── Porta 5463
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- NestJS 10
- Prisma ORM
- PostgreSQL 15
- JWT Authentication

**DevOps:**
- Docker Compose
- Node.js 18-slim
- PostgreSQL 15-alpine

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Início em 5 minutos |
| [GUIA_TESTES.md](GUIA_TESTES.md) | Testes passo-a-passo |
| [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md) | Deploy em servidor |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Estrutura técnica |
| [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) | Status completo |

---

## 🎯 URLs Principais

### Público
```
GET  http://localhost:3001                    Home
GET  http://localhost:3001/products           Marketplace
GET  http://localhost:3001/coupons            Cupons
GET  http://localhost:3001/login              Login
```

### Admin (requer autenticação)
```
GET  http://localhost:3001/admin/invoices     Orçamentos
GET  http://localhost:3001/admin/clients      Clientes
GET  http://localhost:3001/admin/products     Produtos
GET  http://localhost:3001/admin/services     Serviços
GET  http://localhost:3001/admin/coupons      Cupons
GET  http://localhost:3001/admin/categories   Categorias
GET  http://localhost:3001/admin/brands       Marcas
GET  http://localhost:3001/admin/groups       Grupos
```

---

## 🐳 Comandos Docker

```bash
# Iniciar
docker-compose up -d --build

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Backend logs
docker-compose logs backend -f

# Frontend logs
docker-compose logs frontend -f

# Database logs
docker-compose logs postgres -f
```

---

## 📊 Estrutura de Pastas

```
orchub/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # Componentes UI
│   │   ├── pages/           # Páginas
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── Dockerfile
│
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── auth/            # Autenticação
│   │   └── common/          # Utilitários
│   ├── prisma/              # Database schema
│   └── Dockerfile
│
├── docker-compose.yml
└── docs/                    # Documentação
```

---

## 🔐 Autenticação

Sistema usa **JWT (JSON Web Tokens)**.

### Flow
1. Usuário faz login com email/senha
2. Backend valida e retorna JWT
3. Frontend armazena token no localStorage
4. Requisições posteriores usam Authorization header

```javascript
// Exemplo de requisição autenticada
const response = await fetch('/api/invoices', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Todos os componentes responsivos
- ✅ Breakpoints Tailwind
- ✅ Sidebar colapsável mobile

---

## 🧪 Testes

Consulte [GUIA_TESTES.md](GUIA_TESTES.md) para:
- Teste de acesso público
- Teste de login
- Teste de CRUD completo
- Teste de orçamentos
- Teste de cupons
- Teste de marketplace

---

## 🚀 Deploy em Produção

### Pré-requisitos
- VPS com Docker instalado
- Domínio configurado
- SSL (Let's Encrypt)

### Steps
1. Copiar arquivos para servidor
2. Configurar `.env.production`
3. Gerar certificado SSL
4. Executar `docker-compose up` com docker-compose.prod.yml
5. Configurar Nginx reverse proxy

Ver [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md) para detalhes.

---

## 📈 Performance

- **Frontend**: 343KB JavaScript, build otimizado
- **Backend**: <100ms response time típico
- **Database**: PostgreSQL 15 otimizado
- **Healthchecks**: Automáticos a cada 30s

---

## 🔒 Segurança

- ✅ JWT authentication
- ✅ Senhas com bcrypt (salt 10)
- ✅ CORS configurado
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

---

## 🐛 Troubleshooting

### Frontend não inicia
```bash
docker-compose logs frontend -f
# Aguarde até ver "Local: http://localhost:3001"
```

### Backend erro
```bash
docker-compose logs backend -f
# Verifique se database está saudável
docker-compose logs postgres
```

### Database indisponível
```bash
# Recrie volumes
docker-compose down -v
docker-compose up -d
```

---

## 📞 Suporte

- **Documentação**: Ver pasta `/docs`
- **Logs**: `docker-compose logs -f`
- **Issues**: Abra issue no GitHub

---

## 📝 Changelog

### v1.0.0 (15/01/2026)
- ✅ Sistema completo operacional
- ✅ Todos os requisitos implementados
- ✅ Docker pronto para produção
- ✅ Documentação completa

---

## 📄 License

MIT License - Ver arquivo LICENSE

---

## 👨‍💻 Desenvolvido por

**Area 27** - Soluções Web

---

## 🎯 Status

✅ **PRONTO PARA PRODUÇÃO**

Todas as funcionalidades testadas e validadas.

---

**Última atualização:** 15 de Janeiro de 2026
