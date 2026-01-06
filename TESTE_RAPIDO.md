# 🚀 Teste Rápido - Sistema de Clientes

## 1️⃣ Preparar o Banco de Dados

```bash
cd backend
npx prisma migrate dev
```

Isso vai aplicar a migração e você verá mensagens como:
```
✔ Generated Prisma Client
✔ 1 migration found in prisma/migrations

PostgreSQL migration completed successfully.
```

## 2️⃣ Iniciar Backend

```bash
npm run start:dev
```

Aguarde até ver:
```
[Nest] 12345  - 01/06/2025, 10:00:00 AM     LOG [NestFactory] Nest application successfully started +2ms
```

## 3️⃣ Em outro terminal, Iniciar Frontend

```bash
cd frontend
npm run dev
```

Você deve ver:
```
VITE v5.0.0  ready in 245 ms

➜  Local:   http://localhost:5173/
```

## 4️⃣ Abrir no Navegador

```
http://localhost:5173
```

## 5️⃣ Fazer Login

- **Email:** usuario@example.com (ou o que foi criado)
- **Senha:** senha123

Se precisar criar usuário:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 6️⃣ Testar Página de Clientes

1. **Sidebar:** Clique em "👥 Gerenciar Clientes"
2. **Novo Cliente:** Clique em "+ Novo Cliente"
3. **Preencher Dados:**
   - Nome: "João Silva"
   - Nickname: "João SP"
   - CPF: "123.456.789-00"
   - Status: "ATIVO"
   - Endereço completo
   - Adicionar 2 emails (marque um como principal)
   - Adicionar 2 telefones (marque um com WhatsApp)
   - Adicionar 2 redes sociais
   - Adicionar observações

4. **Clicar:** "Criar Cliente"

## 7️⃣ Validar Resposta

✅ **Esperado:**
- Página volta pra lista vazia → Cliente criado!
- Clique em "+ Novo Cliente" novamente
- Lista deve mostrar o cliente com:
  - Nome em negrito
  - CPF formatado
  - Email principal
  - Telefone com 📱 se tem WhatsApp
  - Status com cor

## 8️⃣ Testar Edição

1. Clique em "✏️ Editar" do cliente
2. Mude alguns dados:
   - Adicione mais um email
   - Mude o status
   - Altere observações
3. Clique em "Atualizar Cliente"
4. Valide as mudanças na tabela

## 9️⃣ Testar Exclusão

1. Clique em "🗑️ Deletar"
2. Confirme no alert
3. Cliente deve sumir da lista

## 🔟 Verificar Banco de Dados (PostgreSQL)

```bash
# Conectar ao banco
psql -U postgres -d orchub

# Listar clientes
SELECT id, name, cpf_cnpj, status FROM "Client";

# Listar emails de um cliente
SELECT email, primary FROM "ClientEmail" WHERE client_id = 'ID_DO_CLIENTE';

# Listar telefones
SELECT phone, has_whatsapp FROM "ClientPhone" WHERE client_id = 'ID_DO_CLIENTE';
```

---

## 🎯 Checklist de Sucesso

- [ ] Migration executada sem erros
- [ ] Backend iniciado na porta 3000
- [ ] Frontend iniciado na porta 5173
- [ ] Login funcionando
- [ ] Página de clientes carrega vazia
- [ ] Criar novo cliente com todos os campos
- [ ] Cliente aparece na lista
- [ ] Editar cliente funciona
- [ ] Deletar cliente funciona
- [ ] Validações aparecem (nome obrigatório, etc)
- [ ] Emails e telefones múltiplos funcionam
- [ ] Checkboxes (WhatsApp, Principal) funcionam
- [ ] Modal scrollável com muitos campos

---

## 🆘 Problemas Comuns

### Erro: "relation \"Client\" does not exist"
```bash
# Solução
npx prisma migrate dev --name expand_client_fields
```

### Erro: "Client with cpfCnpj already exists"
- CPF/CNPJ já existe no banco
- Tente outro valor ou delete o cliente anterior

### FormField não found
- Verificar que `SelectField` está exportado em `frontend/src/components/index.ts`

### API retorna 400
- Verificar console do backend
- Validar JSON enviado vs DTOs esperados

### Modal não mostra
- Abrir console do navegador (F12)
- Procurar erros de TypeScript

---

## 📊 Estrutura Final

```
DB (PostgreSQL)
├── clients (7 campos de endereço)
├── client_emails
├── client_phones
└── client_social_media

Backend
├── ClientsService (criar, editar, deletar com cascata)
├── ClientsController (endpoints REST)
└── DTOs (validação)

Frontend
├── ClientsPage (lista + modal com 6 seções)
├── Types (Client, ClientEmail, etc)
└── api.ts (métodos CRUD)
```

---

**Boa sorte! 🎉**
