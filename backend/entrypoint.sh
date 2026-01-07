#!/bin/bash

set -e

echo "🚀 Iniciando OrchHub Backend..."

# Aguardar banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
db_ready=0
for i in $(seq 1 30); do
  if nc -z postgres 5432 2>/dev/null; then
    echo "✅ Banco de dados disponível"
    db_ready=1
    break
  fi
  echo "  Tentativa $i/30..."
  sleep 1
done

if [ "$db_ready" -ne 1 ]; then
  echo "❌ Banco de dados não respondeu após 30 tentativas. Abortando."
  exit 1
fi

# Aplicar todas as migrations
echo "📦 Aplicando migrations do Prisma..."
npx prisma migrate deploy
echo "✅ Migrations aplicadas com sucesso."

# Gerar Prisma Client com schema atualizado
echo "🔄 Gerando Prisma Client com schema sincronizado..."
npx prisma generate

# Aguardar um pouco para garantir que tudo está sincronizado
sleep 2

# Executar seed com validações de existência
echo "🌱 Executando seed do banco de dados..."
npm run seed 2>&1 | tee /tmp/seed.log || {
  echo "⚠️  Seed falhou, verificando logs..."
  cat /tmp/seed.log || true
  echo "⚠️  Continuando mesmo com erro no seed (dados podem já existir)"
}
echo "✅ Seed concluído ou já existente."

# Iniciar aplicação
echo "✅ Iniciando aplicação..."
npm run start:prod
