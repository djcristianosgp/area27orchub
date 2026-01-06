#!/bin/sh
set -e

echo "🚀 Iniciando OrchHub Backend..."

echo "⏳ Aguardando banco de dados..."
sleep 5

echo "🔄 Gerando Prisma Client..."
npx prisma generate

if [ "$NODE_ENV" = "development" ]; then
  echo "🛠 Rodando migrations (DEV)..."
  npx prisma migrate dev --name auto --skip-seed
else
  echo "📦 Aplicando migrations (PROD)..."
  npx prisma migrate deploy
fi

echo "🌱 Executando seed (idempotente)..."
npx ts-node prisma/seed.ts || true

echo "✅ Iniciando aplicação..."
npm run start:prod
