# 🧪 GUIA DE TESTES - SISTEMA ORÇAMENTOS VIRTUAIS

## ⚡ INÍCIO RÁPIDO

### 1. Iniciar o Sistema
```bash
# No diretório do projeto
docker-compose up -d --build

# Aguardar 5-10 segundos para tudo ficar pronto
```

### 2. Acessar o Sistema
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Database: localhost:5463

## 🔑 LOGIN

**Usuário padrão:**
- Email: `master@area27.com`
- Senha: `Master@123`

## 📋 FLUXO DE TESTES

### Teste 1: Verificar Acesso Público

1. Abra http://localhost:3001/products
   - [ ] Página carrega com sucesso
   - [ ] Produtos são exibidos em grid
   - [ ] Filtros funcionam (Categoria, Marca, Grupo)
   - [ ] Botão "Comprar" tem link de afiliado

2. Abra http://localhost:3001/coupons
   - [ ] Página carrega com sucesso
   - [ ] Cupons são listados
   - [ ] Filtros de plataforma funcionam
   - [ ] Data de validade é exibida

### Teste 2: Login e Acesso Admin

1. Acesse http://localhost:3001/login
   - [ ] Formulário de login carrega

2. Digite as credenciais
   - Email: `master@area27.com`
   - Senha: `Master@123`
   - [ ] Clique em "Entrar"
   - [ ] Redirecionado para dashboard admin
   - [ ] Token JWT armazenado no localStorage

### Teste 3: Gerenciamento de Clientes

1. Vá para http://localhost:3001/admin/clients
   - [ ] Lista de clientes carrega
   - [ ] Botão "Novo Cliente" está visível

2. Clique em "Novo Cliente"
   - [ ] Modal de criação abre
   - [ ] Campos: Nome, Email, Telefone, Observações

3. Preencha os dados
   ```
   Nome: João Silva
   Email: joao@example.com
   Telefone: (11) 99999-9999
   Observações: Cliente VIP
   ```
   - [ ] Clique em "Salvar"
   - [ ] Cliente aparece na lista
   - [ ] Mensagem de sucesso exibida

4. Editar cliente
   - [ ] Clique no botão de editar (ícone lápis)
   - [ ] Modal abre com dados preenchidos
   - [ ] Altere algum campo
   - [ ] Clique em "Salvar"
   - [ ] Alterações refletem na lista

5. Deletar cliente
   - [ ] Clique no botão de deletar (ícone lixo)
   - [ ] Confirme a exclusão
   - [ ] Cliente desaparece da lista

### Teste 4: Gerenciamento de Categorias

1. Vá para http://localhost:3001/admin/categories
   - [ ] Página carrega com tabela

2. Criar categoria
   - [ ] Clique em "Nova Categoria"
   - [ ] Modal abre
   - [ ] Digite "Eletrônicos"
   - [ ] Salve
   - [ ] Categoria aparece na tabela

3. Editar e deletar
   - [ ] Repita o processo similar ao de clientes

### Teste 5: Gerenciamento de Produtos

1. Vá para http://localhost:3001/admin/products
   - [ ] Página carrega com grid de produtos
   - [ ] Botão "Novo Produto" visível

2. Criar Produto
   - [ ] Clique em "Novo Produto"
   - [ ] Preencha dados:
     ```
     Nome: Notebook Dell
     Descrição: Notebook i7 16GB RAM
     Categoria: Eletrônicos
     Marca: Dell
     Grupo: Informática
     ```
   - [ ] Clique em "Salvar"
   - [ ] Produto aparece na lista
   - [ ] Ícone Package visível

3. Adicionar Variações
   - [ ] Clique no produto criado
   - [ ] Modal de edição abre
   - [ ] Clique em "Adicionar Variação"
   - [ ] Preencha:
     ```
     Nome: 16GB - Intel i7
     Preço: 4500.00
     Link de Afiliado: https://amazon.com.br/produto
     ```
   - [ ] Clique em "Adicionar"
   - [ ] Variação aparece na lista
   - [ ] Repita para mais variações

4. Visualizar no Marketplace
   - [ ] Vá para http://localhost:3001/products
   - [ ] Produto aparece com menor preço
   - [ ] Botão "Comprar" funciona
   - [ ] Abre link de afiliado

### Teste 6: Gerenciamento de Serviços

1. Vá para http://localhost:3001/admin/services
   - [ ] Página carrega

2. Criar Serviço
   - [ ] Clique em "Novo Serviço"
   - [ ] Preencha:
     ```
     Nome: Consultoria de TI
     Descrição: Consultoria especializada em infraestrutura
     ```
   - [ ] Salve
   - [ ] Serviço aparece na lista

3. Adicionar Variações
   - [ ] Clique no serviço
   - [ ] "Adicionar Variação"
   - [ ] Preencha:
     ```
     Nome: 1 hora
     Preço: 250.00
     ```
   - [ ] Salve

### Teste 7: Gerenciamento de Orçamentos

1. Vá para http://localhost:3001/admin/invoices
   - [ ] Página carrega com lista de orçamentos
   - [ ] Botão "Novo Orçamento" visível

2. Criar Orçamento
   - [ ] Clique em "Novo Orçamento"
   - [ ] Selecione um cliente (João Silva que criamos)
   - [ ] Clique em "Adicionar Produto"
   - [ ] Selecione o Notebook Dell
   - [ ] Selecione a variação "16GB - Intel i7"
   - [ ] Quantidade: 1
   - [ ] Clique em "Adicionar"
   - [ ] Item aparece na lista do orçamento
   - [ ] Total é calculado automaticamente
   - [ ] Clique em "Salvar"

3. Visualizar Orçamento
   - [ ] Na lista, clique no orçamento criado
   - [ ] Modal de edição abre
   - [ ] Dados estão preenchidos corretamente

4. Gerar Link Público
   - [ ] Na lista, clique no ícone de link
   - [ ] Link é copiado para clipboard
   - [ ] Copie o link (exemplo: http://localhost:3001/invoices/public/abc123xyz)
   - [ ] Abra em nova aba anônima (verificar se acessa sem login)
   - [ ] Cliente vê o orçamento
   - [ ] Cliente pode aprovar ou recusar

5. Aprovar Orçamento (como cliente)
   - [ ] Na página pública do orçamento
   - [ ] Clique em "Aprovar"
   - [ ] Confirmação exibida
   - [ ] Status muda para "Aprovado"

6. Voltar ao admin
   - [ ] Login novamente
   - [ ] Vá para orçamentos
   - [ ] Orçamento agora exibe status "Aprovado"
   - [ ] Botão de editar deve estar desabilitado

### Teste 8: Gerenciamento de Cupons

1. Vá para http://localhost:3001/admin/coupons
   - [ ] Página carrega

2. Criar Cupom
   - [ ] Clique em "Novo Cupom"
   - [ ] Preencha:
     ```
     Título: Black Friday - 20% OFF
     Descrição: Cupom exclusivo para compras acima de R$100
     Plataforma: Amazon
     Código: BLACKFRIDAY20
     Link Afiliado: https://amazon.com.br/ref/blackfriday
     Data de Validade: 31/12/2025
     ```
   - [ ] Salve

3. Visualizar na página pública
   - [ ] Vá para http://localhost:3001/coupons
   - [ ] Cupom aparece na lista
   - [ ] Filtro de plataforma funciona
   - [ ] Código do cupom é exibido

### Teste 9: Clone de Orçamento

1. Na lista de orçamentos
   - [ ] Clique no ícone de clone
   - [ ] Novo orçamento é criado como "Rascunho"
   - [ ] Mantém os mesmos itens do original
   - [ ] Total é recalculado

### Teste 10: Teste de Validação

1. Tente criar cliente sem email
   - [ ] Clique em "Novo Cliente"
   - [ ] Deixe Email em branco
   - [ ] Clique "Salvar"
   - [ ] Erro de validação exibido

2. Tente criar produto com preço negativo
   - [ ] Na variação, digite -100
   - [ ] Sistema deve rejeitar ou avisar

## 🔍 VERIFICAÇÕES FINAIS

### Backend API

Testar endpoints com Postman/Insomnia:

1. **Login**
   ```bash
   POST http://localhost:3000/auth/login
   Body:
   {
     "email": "master@area27.com",
     "password": "Master@123"
   }
   ```
   - [ ] Retorna token JWT

2. **Listar Clientes** (requer Bearer token)
   ```bash
   GET http://localhost:3000/clients
   Header: Authorization: Bearer {token}
   ```
   - [ ] Retorna lista de clientes

3. **Listar Produtos Públicos** (sem autenticação)
   ```bash
   GET http://localhost:3000/products
   ```
   - [ ] Retorna lista de produtos

## 🚨 TROUBLESHOOTING

### Problema: "Connection refused" na porta 3001
**Solução:**
```bash
docker-compose logs frontend
# Aguarde até ver "Local: http://localhost:3001"
```

### Problema: Erro 404 ao listar clientes
**Solução:**
- [ ] Verifique se está logado
- [ ] Confirme se token JWT é válido
- [ ] Verifique se backend está rodando

### Problema: "Minified React Error #31"
**Solução:**
- [ ] Limpe cache do navegador
- [ ] Recarregue a página (Ctrl+F5)
- [ ] Verifique se os ícones Lucide estão importados corretamente

### Problema: Banco de dados não inicializa
**Solução:**
```bash
# Recrie os volumes
docker-compose down -v
docker-compose up -d
```

## 📊 EXPECTED TEST RESULTS

| Teste | Status | Notas |
|-------|--------|-------|
| Acesso Público | ✅ | Sem autenticação necessária |
| Login | ✅ | Usuário master criado |
| CRUD Clientes | ✅ | Completo e funcional |
| CRUD Produtos | ✅ | Com variações |
| CRUD Serviços | ✅ | Com variações |
| CRUD Orçamentos | ✅ | Com cálculo automático |
| CRUD Cupons | ✅ | Com plataformas |
| Link Público | ✅ | Cliente pode visualizar |
| Aprovação | ✅ | Orçamento fica imutável |
| Marketplace | ✅ | Grid responsivo |

---

**Duração estimada dos testes:** 30-45 minutos
**Última atualização:** 15/01/2026
