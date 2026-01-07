#!/usr/bin/env bash
set -euo pipefail

# Parâmetros:
#  - caminho do deploy no servidor já contém docker-compose.prod.yml e env.prod
# Uso:
#   ./deploy.sh <SSH_USER> <SSH_HOST> <SSH_KEY_PATH> <REMOTE_PATH>
# Exemplo:
#   ./deploy.sh deployer vps.example.com ~/.ssh/id_rsa /var/www/are27orchub

SSH_USER=${1:-}
SSH_HOST=${2:-}
SSH_KEY=${3:-}
REMOTE_PATH=${4:-/var/www/are27orchub}

if [[ -z "$SSH_USER" || -z "$SSH_HOST" || -z "$SSH_KEY" ]]; then
  echo "Uso: $0 <SSH_USER> <SSH_HOST> <SSH_KEY_PATH> <REMOTE_PATH>" && exit 1
fi

# Cria diretório remoto
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "mkdir -p $REMOTE_PATH"

# Copia arquivos de deploy
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  deploy/docker-compose.prod.yml \
  "$SSH_USER@$SSH_HOST:$REMOTE_PATH/docker-compose.prod.yml"

# Assume que env.prod foi preparado manualmente no servidor (com segredos)
# Se quiser enviar também:
# scp -i "$SSH_KEY" deploy/env.prod "$SSH_USER@$SSH_HOST:$REMOTE_PATH/.env"

# Faz pull das imagens e sobe containers
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "\
  cd $REMOTE_PATH && \
  docker compose --env-file .env -f docker-compose.prod.yml pull && \
  docker compose --env-file .env -f docker-compose.prod.yml up -d --remove-orphans && \
  docker compose --env-file .env -f docker-compose.prod.yml ps\
"

echo "✅ Deploy finalizado em $SSH_HOST:$REMOTE_PATH"
