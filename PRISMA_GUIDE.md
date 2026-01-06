# Prisma Migration Guide

## Inicializar Prisma

Se for a primeira vez usando este projeto:

```bash
cd backend

# Instalar Prisma CLI globalmente (opcional)
npm install -g @prisma/cli

# Criar primeira migration
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate
```

## Visualizar Dados no Prisma Studio

```bash
npx prisma studio
```

Acesse http://localhost:5555 para ver e gerenciar os dados do banco de forma visual.

## Fazer Changes no Schema

1. Edite o arquivo `prisma/schema.prisma`
2. Execute:
```bash
npx prisma migrate dev --name descricao_da_mudanca
```

Exemplo:
```bash
npx prisma migrate dev --name add_user_role
```

## Resetar o Banco (CUIDADO - DELETE ALL DATA!)

```bash
npx prisma migrate reset
```

Isso vai:
1. Deletar o banco
2. Recriar do zero
3. Rodar todas as migrations
4. (Opcional) Rodar seed script

## Seed do Banco (Popular com dados iniciais)

Crie arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@orchub.com',
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  console.log('Admin criado:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Configure no `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Depois execute:
```bash
npx prisma db seed
```

## Verificar Migrations

```bash
npx prisma migrate status
```

## Sincronizar Schema com Banco

Se modificou o schema fora do Prisma:

```bash
npx prisma db push
```

## Deploy em Produção

Antes de fazer deploy:

```bash
# Build backend
npm run build

# Migrar banco em produção
npx prisma migrate deploy
```

No seu CI/CD pipeline:
```yaml
- name: Run migrations
  run: npx prisma migrate deploy
```

## Troubleshooting

### "Could not connect to the database server"
- Verifique a DATABASE_URL
- Confira se PostgreSQL está rodando
- Teste a conexão: `psql $DATABASE_URL`

### "PrismaClientInitializationError"
- Execute: `npx prisma generate`
- Delete `node_modules/.prisma`
- Run `npm install` novamente

### Conflito de migrations
```bash
# Ver histórico
npx prisma migrate status

# Resolver manualmente se necessário
npx prisma migrate resolve --rolled-back migration_name
```
