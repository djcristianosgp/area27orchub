# 🐳 Docker Deployment Guide

## Status: ✅ RUNNING

Toda a aplicação está rodando em Docker, pronta para produção/VPS!

## Containers Ativos

```
✅ are27orchub-postgres-1    (port 5432) - Database
✅ are27orchub-backend-1     (port 3000) - API NestJS
✅ are27orchub-frontend-1    (port 3001) - React Frontend
```

## URLs de Acesso

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Database:** localhost:5432

## Comandos Úteis

### Iniciar todos os containers
```bash
docker-compose up -d --build
```

### Parar todos os containers
```bash
docker-compose down
```

### Ver status dos containers
```bash
docker-compose ps
```

### Ver logs do backend
```bash
docker logs are27orchub-backend-1 -f
```

### Ver logs do frontend
```bash
docker logs are27orchub-frontend-1 -f
```

### Ver logs do banco de dados
```bash
docker logs are27orchub-postgres-1 -f
```

### Limpar volumes (limpar banco de dados)
```bash
docker-compose down -v
```

### Rebuild completo
```bash
docker-compose down
docker-compose up -d --build
```

## Arquivos Configurados

- **backend/Dockerfile** - Build backend (com OpenSSL para Prisma)
- **frontend/Dockerfile** - Build frontend (Vite production build)
- **docker-compose.yml** - Orquestração de containers
- **backend/entrypoint.sh** - Script de inicialização do backend

## Variáveis de Ambiente

### Backend (.env)
- `DATABASE_URL=postgresql://orchub_user:orchub_pass@postgres:5432/orchub_db`
- `JWT_SECRET=your-secret-key`
- `JWT_EXPIRATION=7d`
- `NODE_ENV=production`

### Frontend
- API URL automaticamente configurada para `http://localhost:3000` (dev)
- Em produção, ajustar em `frontend/src/services/api.ts`

## Migrations de Banco de Dados

Quando subir pela primeira vez ou após mudanças no schema:

```bash
# Dentro do container backend
docker exec are27orchub-backend-1 npx prisma migrate deploy

# Ou ao iniciar
docker-compose up -d --build
```

O entrypoint.sh já faz isso automaticamente!

## Deploy para VPS

1. **Clone o repositório** na VPS
2. **Configure variáveis de ambiente** em `.env`
3. **Execute:**
   ```bash
   docker-compose up -d --build
   ```

4. **Acesse:**
   - Frontend: `https://seu-dominio.com`
   - API: `https://seu-dominio.com/api` (com reverse proxy)

## Troubleshooting

### Problema: "libssl.so.1.1: No such file or directory"
✅ **Resolvido** - OpenSSL adicionado ao Dockerfile

### Problema: Backend não inicia
```bash
docker logs are27orchub-backend-1
```

### Problema: Banco não conecta
Verifique se PostgreSQL está saudável:
```bash
docker-compose ps
```

Deve aparecer `(healthy)` para o postgres

### Problema: Frontend não carrega a API
Verifique o URL da API em `frontend/src/services/api.ts`

## Performance Otimizações

- ✅ Multi-stage build no frontend (apenas dist/)
- ✅ Node Alpine para menor tamanho
- ✅ npm ci ao invés de npm install
- ✅ Cache de layers Docker

## Próximos Passos

1. **SSL/HTTPS** - Usar nginx + Let's Encrypt
2. **Backup** - Configurar backup automático do banco
3. **Monitoring** - Adicionar healthcheck endpoints
4. **CI/CD** - GitHub Actions para auto-deploy

---

**Criado em:** 05/01/2026
**Status:** Pronto para produção ✅
