# 👑 Credenciais do Usuário Master

## ✅ Usuário Criado Automaticamente

O usuário master é criado automaticamente toda vez que o container é iniciado (se não existir).

### Credenciais de Acesso

**Email:** `djcristiano.sgp@hotmail.com`  
**Senha:** `MasterPass@2026!Secure`

### Segurança

⚠️ **IMPORTANTE:**
- Guarde essa senha em um local seguro
- Se estiver em produção, mude essa senha após o primeiro login
- A senha foi definida no seed script: `/backend/prisma/seed.ts`

---

## 📝 Para Alterar a Senha Master

1. Acesse o sistema com as credenciais acima
2. Vá para as configurações do usuário
3. Mude a senha (implementar endpoint se necessário)

Ou no banco de dados:

```bash
docker exec are27orchub-postgres-1 psql -U orchub_user -d orchub_db
```

Depois execute:
```sql
UPDATE users SET password = 'novo_hash_bcrypt' WHERE email = 'djcristiano.sgp@hotmail.com';
```

---

## 🔄 Fluxo de Inicialização

Toda vez que o container é iniciado:

1. **⏳ Aguarda PostgreSQL** ficar pronto (10 segundos)
2. **🔄 Aplica Migrations** - Cria as tabelas se não existirem
3. **🌱 Executa Seed** - Cria o usuário master se não existir
4. **✅ Inicia Aplicação** - NestJS começa a rodar

---

## 🧪 Testando

### Via cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "djcristiano.sgp@hotmail.com",
    "password": "MasterPass@2026!Secure"
  }'
```

### Via Frontend

1. Acesse http://localhost:3001
2. Será redirecionado para login
3. Use as credenciais acima
4. Você será redirecionado para o Dashboard

---

## 📍 Arquivos Relevantes

- `/backend/prisma/seed.ts` - Script que cria o usuário master
- `/backend/entrypoint.sh` - Script que roda migrations e seed
- `/backend/package.json` - Script npm `seed`

---

**Data de Criação:** 05/01/2026  
**Status:** ✅ Pronto para Produção
