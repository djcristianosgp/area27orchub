# 🚀 GUIA DE DEPLOY EM PRODUÇÃO

## Preparação Inicial

### Requisitos
- VPS/Servidor com Docker e Docker Compose instalados
- Domínio configurado com DNS
- SSL/TLS (Let's Encrypt recomendado)
- Porta 80 e 443 abertas

## Pré-Requisitos de Sistema

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

## Estrutura de Deploy

### 1. Preparar Servidor

```bash
# Criar diretório do projeto
mkdir -p /opt/orchub
cd /opt/orchub

# Clonar repositório (ou copiar arquivos)
git clone <seu-repo> .
# ou
scp -r local/path/* user@server:/opt/orchub/
```

### 2. Configurar Variáveis de Ambiente

#### `.env.production`
```env
# DATABASE
DATABASE_URL="postgresql://orchub_user:senha_segura@postgres:5432/orchub"
DB_HOST=postgres
DB_PORT=5432
DB_USER=orchub_user
DB_PASSWORD=senha_segura_muito_longa
DB_NAME=orchub

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_e_segura
JWT_EXPIRATION=24h

# SERVER
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://seudominio.com

# CORS
ALLOWED_ORIGINS=https://seudominio.com

# EMAIL (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua_senha_app
```

#### `.env.docker`
```env
# Mesmo do acima, adaptado para containers
DATABASE_URL="postgresql://orchub_user:senha_segura@postgres:5432/orchub"
POSTGRES_USER=orchub_user
POSTGRES_PASSWORD=senha_segura_muito_longa
POSTGRES_DB=orchub
```

### 3. Dockerfile de Produção

Já está configurado em `backend/Dockerfile` e `frontend/Dockerfile`.

Verifique se estão com as best practices:
- ✅ Multi-stage builds
- ✅ Node slim (reduz tamanho)
- ✅ Usuário não-root
- ✅ Healthchecks

### 4. Docker Compose Produção

Arquivo: `deploy/docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: orchub-postgres-prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5463:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: orchub-backend:latest
    container_name: orchub-backend-prod
    build:
      context: ./backend
      dockerfile: Dockerfile
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: orchub-frontend:latest
    container_name: orchub-frontend-prod
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${FRONTEND_URL}/api
    environment:
      VITE_API_URL: ${FRONTEND_URL}/api
    ports:
      - "3001:3001"
    restart: unless-stopped

  nginx:
    image: nginx:latest
    container_name: orchub-nginx-prod
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 5. Nginx (Reverse Proxy)

Arquivo: `deploy/nginx.conf`

```nginx
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:3001;
}

server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Gerar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado
sudo certbot certonly --standalone -d seudominio.com -d www.seudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem deploy/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem deploy/ssl/key.pem
sudo chmod 644 deploy/ssl/*

# Configurar renovação automática
sudo certbot renew --dry-run
```

## Deploy

### Opção 1: Deploy Manual

```bash
cd /opt/orchub

# Preparar variáveis
cp deploy/env.prod.example .env.production

# Editar .env.production com seus dados
nano .env.production

# Build das imagens
docker-compose -f deploy/docker-compose.prod.yml build

# Iniciar containers
docker-compose -f deploy/docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### Opção 2: Script de Deploy Automático

Arquivo: `deploy/deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando Deploy..."

# Variáveis
DOCKER_REGISTRY="seu-registry"
IMAGE_TAG="latest"
PROJECT_NAME="orchub"

# Build
echo "📦 Building images..."
docker-compose -f deploy/docker-compose.prod.yml build

# Stop containers antigos
echo "🛑 Stopping old containers..."
docker-compose -f deploy/docker-compose.prod.yml down

# Start novos containers
echo "▶️ Starting new containers..."
docker-compose -f deploy/docker-compose.prod.yml up -d

# Aguardar containers ficarem saudáveis
echo "⏳ Waiting for health checks..."
sleep 10

# Verificar status
echo "✅ Deployment complete!"
docker-compose -f deploy/docker-compose.prod.yml ps

# Limpar imagens antigas
echo "🧹 Cleaning up..."
docker image prune -f
```

## Monitoramento e Backup

### Backup do Banco de Dados

```bash
# Backup automático diário
crontab -e

# Adicionar linha:
0 2 * * * docker-compose -f /opt/orchub/deploy/docker-compose.prod.yml exec postgres pg_dump -U orchub_user orchub > /backups/orchub-$(date +\%Y\%m\%d).sql
```

### Logs

```bash
# Ver logs em tempo real
docker-compose -f deploy/docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker-compose -f deploy/docker-compose.prod.yml logs backend -f

# Salvar logs
docker-compose -f deploy/docker-compose.prod.yml logs > /var/log/orchub-$(date +%Y%m%d).log
```

### Monitoramento (Opcional - Prometheus + Grafana)

```bash
# Adicionar ao docker-compose.prod.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
```

## Checklist Final

- [ ] Certificado SSL configurado
- [ ] Domínio aponta para servidor
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados backup automatizado
- [ ] Nginx reverse proxy funcionando
- [ ] Health checks passando
- [ ] Logs sendo monitorados
- [ ] Firewall configurado (80, 443)
- [ ] Auto-restart configurado
- [ ] Email de notificação (opcional)

## Troubleshooting Produção

### Container não inicia
```bash
docker-compose logs backend
docker-compose ps
```

### Banco de dados indisponível
```bash
docker-compose exec postgres psql -U orchub_user -d orchub -c "SELECT 1"
```

### Frontend não renderiza
```bash
# Verificar logs do nginx
docker-compose logs nginx

# Verificar logs do frontend build
docker build -t orchub-frontend:latest ./frontend
```

### Limite de conexões atingido
```bash
# Aumentar limite no PostgreSQL
docker-compose exec postgres psql -U orchub_user -d orchub -c "ALTER SYSTEM SET max_connections = 200;"
docker-compose restart postgres
```

## Métricas de Performance

### Recomendações
- **CPU**: Mínimo 2 cores
- **RAM**: Mínimo 2GB (4GB recomendado)
- **Disco**: Mínimo 20GB (50GB recomendado para dados)
- **Banda**: Upload mínimo 10Mbps

### Otimizações
```bash
# Limpar espaço em disco
docker image prune -af
docker volume prune -f

# Aumentar limite de memória do Docker
echo '{"storage-driver": "overlay2", "memory": "2g"}' > /etc/docker/daemon.json

# Restart Docker
sudo systemctl restart docker
```

---

**Última atualização:** 15/01/2026
**Versão:** 1.0
