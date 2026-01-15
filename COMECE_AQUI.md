# 🚀 COMO COMEÇAR - GUIA RÁPIDO (2 MINUTOS)

Seu sistema OrchHub está **100% pronto para usar**.

---

## ⚡ PASSO 1: Verificar se está tudo rodando

```bash
docker-compose ps
```

✅ Se você ver 3 containers em status **"Up"**, está pronto!

---

## 🌐 PASSO 2: Acessar o sistema

### Frontend (Aplicação Principal)
```
http://localhost:3001
```

### Backend (API)
```
http://localhost:3000
```

### Database (PostgreSQL)
```
localhost:5463
```

---

## 🔑 PASSO 3: Fazer Login

Na página http://localhost:3001/login, use:

```
Email:  master@area27.com
Senha:  Master@123
```

---

## ✅ PASSO 4: Pronto!

Você está autenticado e pode agora:

1. **Criar Clientes** → Menu Admin → Clientes
2. **Criar Produtos** → Menu Admin → Produtos
3. **Criar Serviços** → Menu Admin → Serviços
4. **Criar Orçamentos** → Menu Admin → Orçamentos
5. **Ver Marketplace** → Home → Marketplace

---

## 📊 EXEMPLO: Seu Primeiro Orçamento

### 1. Criar um Cliente
- Clique em **Admin → Clientes**
- Clique em **Novo Cliente**
- Preencha:
  ```
  Nome: João Silva
  Email: joao@example.com
  Telefone: (11) 99999-9999
  ```
- Clique em **Salvar**

### 2. Criar um Produto
- Clique em **Admin → Produtos**
- Clique em **Novo Produto**
- Preencha:
  ```
  Nome: Notebook
  Descrição: Notebook i7
  Categoria: Eletrônicos
  Marca: Dell
  Grupo: Informática
  ```
- Clique em **Salvar**

### 3. Adicionar Variação ao Produto
- Clique no produto que criou
- Clique em **Adicionar Variação**
- Preencha:
  ```
  Nome: 16GB - Intel i7
  Preço: 4500.00
  Link de Afiliado: https://amazon.com.br/...
  ```
- Clique em **Adicionar**

### 4. Criar Orçamento
- Clique em **Admin → Orçamentos**
- Clique em **Novo Orçamento**
- Selecione o cliente **João Silva**
- Clique em **Adicionar Produto**
- Selecione o **Notebook** e a variação **16GB**
- Quantidade: **1**
- Clique em **Adicionar**
- Clique em **Salvar**

### 5. Compartilhar com Cliente
- Na lista de orçamentos, clique no ícone de **Link** (🔗)
- Link é copiado para área de transferência
- Envie para o cliente via email/WhatsApp

---

## 🌐 Acessar como Cliente (sem login)

O cliente clica no link compartilhado e pode:
- Ver todos os itens do orçamento
- Ver o total
- Clique em **Aprovar** ou **Recusar**

---

## 📱 Acessar Marketplace Público

**Qualquer pessoa** pode acessar:
```
http://localhost:3001/products
```

Aqui verá:
- Grid de produtos
- Filtros (Categoria, Marca, Grupo)
- Botão "Comprar" com link de afiliado

---

## 🎟️ Visualizar Cupons Públicos

```
http://localhost:3001/coupons
```

Aqui aparecerão todos os cupons criados com filtro por plataforma.

---

## 🔄 Se algo não funcionar

### Frontend não carrega
```bash
docker-compose logs frontend -f
# Aguarde até ver "Local: http://localhost:3001"
```

### Backend erro
```bash
docker-compose logs backend -f
# Verifique se database está saudável
```

### Recomeçar do zero
```bash
docker-compose down -v
docker-compose up -d --build
# Aguarde 15 segundos
```

---

## 📚 Próximos Passos

Explore a documentação completa:

1. **Para testes detalhados**: Veja [GUIA_TESTES.md](GUIA_TESTES.md)
2. **Para entender a arquitetura**: Veja [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Para fazer deploy em produção**: Veja [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md)
4. **Para adicionar novas funcionalidades**: Veja [GUIA_DESENVOLVIMENTO_FUTURO.md](GUIA_DESENVOLVIMENTO_FUTURO.md)

---

## 🎯 Funcionalidades Principais

✅ **Orçamentos Virtuais**
- Criar, editar, deletar
- Link público para compartilhamento
- Cliente aprova/recusa
- Cálculo automático de total
- Clone de orçamentos

✅ **Gerenciamento**
- Clientes
- Produtos com variações
- Serviços com variações
- Cupons
- Categorias, Marcas, Grupos

✅ **Marketplace Público**
- Grid responsivo
- Filtros avançados
- Links de afiliado

✅ **Cupons Públicos**
- Página dedicada
- Filtro por plataforma
- Data de validade

---

## 🆘 Dúvidas?

1. Leia os documentos `.md` no projeto
2. Verifique os logs: `docker-compose logs -f`
3. Consulte [GUIA_TESTES.md](GUIA_TESTES.md) para troubleshooting

---

## ✨ Você está Pronto!

Seu sistema OrchHub está **100% operacional** e pronto para usar!

🎉 **Bem-vindo ao OrchHub!**

---

**Sistema Status:** ✅ PRONTO PARA USO
**Última atualização:** 15/01/2026
