# ⚡ QUICK START - PRIMEIROS PASSOS

## 1️⃣ FAZER LOGIN

Acesse: **http://localhost:3001/login**

```
Email:  djcristiano.sgp@hotmail.com
Senha:  MasterPass@2026!Secure
```

Clique em **"Entrar"**

---

## 2️⃣ CRIAR UM CLIENTE

1. No menu, clique em **"Clientes"**
2. Clique no botão **"Novo Cliente"**
3. Preencha os dados:
   - Nome (obrigatório)
   - Email
   - Telefone
   - Observações
4. Clique em **"Salvar"**

---

## 3️⃣ CRIAR UM PRODUTO COM VARIAÇÕES

1. No menu, clique em **"Produtos"**
2. Clique em **"Novo Produto"**
3. Preencha:
   - Nome
   - Descrição
   - Categoria (ex: Eletrônicos)
   - Marca (ex: Samsung)
   - Grupo (ex: Smartphones)
4. Clique em **"Adicionar Variação"**
5. Para cada variação:
   - Nome (ex: Preto, Branco)
   - Preço
   - Link de afiliado (opcional)
6. Clique em **"Salvar"**

---

## 4️⃣ CRIAR UM ORÇAMENTO

1. No menu, clique em **"Orçamentos"**
2. Clique em **"Novo Orçamento"**
3. **ABA 1 - CLIENTE:**
   - Selecione um cliente da lista
   - Clique em **"Próxima Aba"**

4. **ABA 2 - CABEÇALHO:**
   - Data de validade do orçamento
   - Origem (Indicação, Website, etc)
   - Observações gerais
   - Responsável (seu nome)
   - Referência interna
   - Clique em **"Próxima Aba"**

5. **ABA 3 - PRODUTOS/SERVIÇOS:**
   - Clique em **"Novo Grupo"**
   - Nome do grupo (ex: "Eletrônicos")
   - Tipo: Produto ou Serviço
   - Clique em **"Adicionar Item"**
   - Selecione um produto
   - Selecione uma variação
   - Quantidade
   - Preço unitário (vem automático)
   - Subtotal é calculado automaticamente
   - Clique em **"Próxima Aba"**

6. **ABA 4 - FATURAMENTO:**
   - Desconto (se houver)
   - Acréscimos (taxas)
   - Deslocamento (frete)
   - O total é calculado automaticamente
   - Clique em **"Salvar Orçamento"**

✅ **Orçamento criado com sucesso!**

---

## 5️⃣ VISUALIZAR ORÇAMENTO PUBLICAMENTE

Após salvar um orçamento:

1. Vá para a lista de orçamentos
2. Clique no orçamento que criou
3. Copie o **"Link Público"**
4. Compartilhe com o cliente
5. Cliente pode **aprovar** ou **recusar** pelo link

---

## 6️⃣ CRIAR CUPOM DE DESCONTO

1. Menu: **"Cupons"**
2. Clique **"Novo Cupom"**
3. Preencha:
   - Título (ex: "Black Friday 20%")
   - Descrição
   - Plataforma (Amazon, Mercado Livre, AliExpress)
   - Código do cupom
   - Link afiliado
   - Data de validade
   - Ativo: SIM
4. Clique **"Salvar"**

---

## 7️⃣ VER MARKETPLACE PÚBLICO

Qualquer pessoa pode acessar: **http://localhost:3001/products**

Lá ela pode:
- Ver todos os seus produtos
- Filtrar por Categoria, Marca ou Grupo
- Ver o preço mais baixo de cada variação
- Clicar para comprar no link afiliado

---

## 🎯 DICAS IMPORTANTES

✅ **Sempre** preencha os campos obrigatórios (marcados com *)

✅ **Preços de variações** são calculados automaticamente no orçamento

✅ **Totais** são recalculados em tempo real

✅ **Orçamentos aprovados** não podem ser editados (crie um novo)

✅ **Links públicos** podem ser compartilhados e reusados

✅ **Cupons** aparecem em http://localhost:3001/coupons (público)

---

## ⚠️ LEMBRETE DE SEGURANÇA

Você está usando **senha padrão**: `MasterPass@2026!Secure`

**Por favor, altere esta senha antes de ir para produção!**

1. No dashboard, vá para **"Perfil"** (seu ícone no canto superior)
2. Clique em **"Alterar Senha"**
3. Digite a nova senha
4. Clique em **"Salvar"**

---

## 🆘 PROBLEMAS?

Se o sistema não responder:

```powershell
# Reiniciar tudo
docker-compose restart

# Ou fazer reset completo
docker-compose down -v
docker-compose up -d --build
```

Se ainda não funcionar, abra um terminal e execute:

```powershell
docker-compose logs -f backend
```

Para ver o que está acontecendo.

---

## 📞 CONTATO

Sistema: **Are27 OrchHub - Gerador de Orçamentos Online**  
Versão: 1.0.0  
Suporte: Verifique os logs ou reinicie os containers

---

**Bom uso! 🚀**

Data: 7 de janeiro de 2026
