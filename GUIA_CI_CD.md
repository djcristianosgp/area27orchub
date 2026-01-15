# 🔄 GUIA CI/CD - INTEGRAÇÃO CONTÍNUA E DEPLOY AUTOMÁTICO

Configuração para automatizar testes, build e deploy do OrchHub.

---

## 📦 GitHub Actions (CI/CD)

### 1. Setup Inicial

Criar arquivo: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # ========== TESTS ==========
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      # Backend Tests
      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Build Backend
        working-directory: ./backend
        run: npm run build
      
      - name: Run Backend Tests
        working-directory: ./backend
        run: npm test
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
      
      # Frontend Tests
      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build
      
      - name: Run Frontend Tests
        working-directory: ./frontend
        run: npm test -- --coverage

  # ========== LINT ==========
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Backend Lint
        working-directory: ./backend
        run: |
          npm install
          npm run lint
      
      - name: Frontend Lint
        working-directory: ./frontend
        run: |
          npm install
          npm run lint

  # ========== BUILD DOCKER ==========
  build:
    runs-on: ubuntu-latest
    needs: [test, lint]
    
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and Push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/orchub-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/orchub-backend:${{ github.sha }}
      
      - name: Build and Push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/orchub-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/orchub-frontend:${{ github.sha }}

  # ========== DEPLOY STAGING ==========
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_KEY }}
          script: |
            cd /opt/orchub
            git pull origin develop
            docker-compose -f deploy/docker-compose.prod.yml up -d --build
            docker-compose -f deploy/docker-compose.prod.yml exec -T postgres psql -U orchub_user -d orchub -c "SELECT 1" || exit 1

  # ========== DEPLOY PRODUCTION ==========
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://seudominio.com
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Deployment
        uses: actions/github-script@v6
        with:
          script: |
            const deployment = await github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.ref,
              environment: 'production',
              auto_merge: false
            });
            return deployment.data.id;
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_KEY }}
          script: |
            set -e
            
            cd /opt/orchub
            
            # Backup
            docker-compose -f deploy/docker-compose.prod.yml exec -T postgres pg_dump -U orchub_user orchub > /backups/orchub-$(date +%Y%m%d-%H%M%S).sql
            
            # Update
            git pull origin main
            
            # Build e Deploy
            docker-compose -f deploy/docker-compose.prod.yml up -d --build
            
            # Verify
            docker-compose -f deploy/docker-compose.prod.yml ps
            curl -f https://seudominio.com || exit 1
      
      - name: Update Deployment Status
        if: success()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: context.payload.deployment.id,
              state: 'success',
              environment_url: 'https://seudominio.com'
            });
      
      - name: Notify Slack
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Production deployment failed for ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed* 🚨\nRepository: ${{ github.repository }}\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

---

## 🔐 GitHub Secrets

Configurar em: Settings → Secrets and variables → Actions

```
DOCKER_USERNAME          = seu-username-docker
DOCKER_PASSWORD          = token-docker
STAGING_HOST            = seu-server-staging.com
STAGING_USER            = deploy-user
STAGING_KEY             = private-key
PROD_HOST               = seu-server-prod.com
PROD_USER               = deploy-user
PROD_KEY                = private-key
SLACK_WEBHOOK           = https://hooks.slack.com/...
```

---

## 🚀 GitLab CI (Alternativa)

Criar arquivo: `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_TAG: $DOCKER_REGISTRY/$CI_PROJECT_PATH

# ========== TESTS ==========
backend-test:
  stage: test
  image: node:18-alpine
  before_script:
    - cd backend
    - npm ci
  script:
    - npm run build
    - npm test
  coverage: '/Coverage: \d+\.\d+/'

frontend-test:
  stage: test
  image: node:18-alpine
  before_script:
    - cd frontend
    - npm ci
  script:
    - npm run build
    - npm test -- --coverage

# ========== BUILD ==========
build-backend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG/backend:latest ./backend
    - docker push $IMAGE_TAG/backend:latest
  only:
    - main

build-frontend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG/frontend:latest ./frontend
    - docker push $IMAGE_TAG/frontend:latest
  only:
    - main

# ========== DEPLOY ==========
deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - mkdir -p ~/.ssh
    - echo "$DEPLOY_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H "$PROD_HOST" >> ~/.ssh/known_hosts
  script:
    - ssh deploy@$PROD_HOST "cd /opt/orchub && docker-compose pull && docker-compose up -d"
  environment:
    name: production
    url: https://seudominio.com
  only:
    - main
  when: manual
```

---

## 🔍 Health Checks e Monitoring

### Configurar Healthcheck

```bash
# docker-compose.prod.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://backend:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Integrar com Monitoring (Datadog)

```typescript
// backend/src/main.ts
import { DatadogMetricWriter } from 'dd-trace';

const tracer = require('dd-trace').init({
  service: 'orchub-backend',
  version: '1.0.0',
  env: 'production'
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Adicionar middleware de trace
  app.use(tracer.middleware);
  
  await app.listen(3000);
}
```

---

## 📊 Relatório de Testes

### Gerar Coverage Report

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage --watchAll=false
```

### Publicar em Github Pages

```yaml
- name: Deploy Coverage to Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./coverage
```

---

## 🔄 Rollback Automático

```yaml
deploy-production:
  # ... outros steps ...
  script:
    - |
      set -e
      
      # Salvar versão anterior
      export PREVIOUS_VERSION=$(docker inspect --format='{{.Config.Image}}' orchub-backend | cut -d':' -f2)
      
      # Deploy nova versão
      docker-compose -f deploy/docker-compose.prod.yml up -d
      
      # Health check
      if ! curl -f http://localhost:3000/health; then
        echo "Health check failed! Rolling back..."
        docker-compose -f deploy/docker-compose.prod.yml down
        docker-compose -f deploy/docker-compose.prod.yml pull $PREVIOUS_VERSION
        docker-compose -f deploy/docker-compose.prod.yml up -d
        exit 1
      fi
```

---

## 📈 Métricas e Observabilidade

### Prometheus Config

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "OrchHub Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~'5..'}[5m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      }
    ]
  }
}
```

---

## 🛡️ Segurança no CI/CD

### SAST (Static Application Security Testing)

```yaml
security-scan:
  stage: test
  image: node:18-alpine
  script:
    - npm install -g snyk
    - snyk auth $SNYK_TOKEN
    - snyk test --severity-threshold=high
  allow_failure: true
```

### Dependency Check

```yaml
dependency-check:
  stage: test
  image: owasp/dependency-check:latest
  script:
    - dependency-check.sh -s . -o report.json --format JSON
  artifacts:
    paths:
      - report.json
```

### Secret Scanning

```yaml
secret-scan:
  stage: test
  image: python:3.9-alpine
  script:
    - pip install detect-secrets
    - detect-secrets scan > baseline.json
    - detect-secrets validate baseline.json
```

---

## 📋 Checklist CI/CD

- [ ] GitHub Actions configurado
- [ ] Testes passando em PR
- [ ] Lint passando em PR
- [ ] Docker build working
- [ ] Staging deployment funcionando
- [ ] Health checks configurados
- [ ] Rollback strategy implementada
- [ ] Slack notifications configuradas
- [ ] Secrets management em place
- [ ] Monitoring e observabilidade setup
- [ ] Security scans implementados
- [ ] Database migrations automáticas

---

## 🚀 Exemplo Completo de Deploy

```bash
# 1. Fazer push para main
git push origin main

# 2. GitHub Actions é acionado:
#    - Testes executados
#    - Lint executado
#    - Docker build
#    - Deploy automático para prod

# 3. Verificar deployment
curl https://seudominio.com

# 4. Ver logs
docker-compose logs -f
```

---

**Última atualização:** 15/01/2026
