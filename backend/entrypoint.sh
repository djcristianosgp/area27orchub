#!/bin/sh

echo "🚀 Iniciando OrchHub Backend..."

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Run Prisma migrations
echo "🔄 Aplicando migrations..."
npx prisma migrate deploy

# Run seed (criar usuário master se não existir)
echo "🌱 Executando seed..."
npx ts-node -O '{"module":"commonjs"}' prisma/seed.ts

# Start the application
echo "✅ Iniciando aplicação..."
npm run start:prod