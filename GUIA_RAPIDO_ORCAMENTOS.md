# 🚀 Guia Rápido - Sistema de Orçamentos Refatorado

## ⚡ Início Rápido

### 1. Aplicar as Mudanças no Banco de Dados

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Testar a Nova Interface

Acesse: `http://localhost:3001/admin/invoices`

---

## 🎯 Principais Funcionalidades

### 📊 Visualizações

**3 Modos de Visualização:**

1. **Grid (Grade)** - Cards visuais em grade
2. **List (Lista)** - Tabela tradicional com todas as informações
3. **Kanban** - Quadro visual agrupado por status

**Como usar:**
- Clique nos botões no canto superior direito
- A visualização é salva automaticamente

### 🔍 Filtros Avançados

**Clique no botão "Filtros" para:**
- Filtrar por múltiplos clientes
- Filtrar por múltiplos produtos
- Filtrar por múltiplos serviços
- Filtrar por múltiplos status
- Buscar por código ou nome do cliente

**Dica:** Os filtros são cumulativos - quanto mais filtros, mais específico o resultado

### ⚙️ Ações por Orçamento

**Menu de ações (ícone ⋮):**

1. **Visualizar** - Ver detalhes completos
2. **Editar** - Modificar orçamento (se não aprovado)
3. **Exportar PDF** - Gerar PDF do orçamento
4. **Clonar** - Criar cópia
   - Opção de atualizar preços ou manter valores originais
5. **Marcar como Desistido** - Cliente desistiu
6. **Marcar como Abandonado** - Orçamento abandonado
7. **Gerar Página Pública** - Cria URL pública e copia automaticamente
8. **Enviar por Email** - Enviar orçamento para cliente
9. **Deletar** - Remover orçamento (se não aprovado)

### 🔗 URL Pública

**Como funciona:**

1. Clique em "Gerar Página Pública" no menu de ações
2. A URL é copiada automaticamente para sua área de transferência
3. Compartilhe com o cliente
4. Cliente pode:
   - Visualizar orçamento completo
   - Aprovar
   - Recusar (com justificativa)
   - Abandonar (com justificativa)
   - Exportar PDF
   - Imprimir

**Controle de Acesso:**
- Orçamento deve estar dentro da validade
- OU ter status: Aprovado, Concluído, Faturado
- URL pode ser desativada a qualquer momento

### 📋 Status do Orçamento

**Ciclo de Vida:**

```
RASCUNHO → PRONTO → APROVADO → CONCLUÍDO → FATURADO
           ↓         ↓
        VENCIDO   RECUSADO
                     ↓
                ABANDONADO
                     ↓
                 DESISTIDO
```

**Cores dos Status:**
- 🔵 Rascunho - Cinza
- 🔵 Pronto - Azul
- 🟠 Vencido - Laranja
- 🟢 Aprovado - Verde
- 🔴 Recusado - Vermelho
- 🟣 Concluído - Roxo
- 🟣 Faturado - Índigo
- 🟡 Desistido - Amarelo
- ⚫ Abandonado - Cinza escuro

---

## 🔧 API - Novos Endpoints

### Endpoints Administrativos

```typescript
// Criar orçamento
POST /invoices
Body: {
  clientId: string
  proposalValidDate?: string
  origin?: string
  observations?: string
  responsible?: string
  internalReference?: string
  discounts?: number
  additions?: number
  displacement?: number
  groups?: InvoiceGroup[]
  paymentConditions?: PaymentCondition[]
}

// Atualizar orçamento
PATCH /invoices/:id
Body: (mesmos campos do create)

// Clonar orçamento
POST /invoices/:id/clone?updatePrices=true|false

// Alterar status
POST /invoices/:id/status
Body: { status: string, reason?: string }

// Regenerar URL pública
POST /invoices/:id/regenerate-url

// Ativar/desativar URL pública
POST /invoices/:id/toggle-url
Body: { active: boolean }

// Deletar
DELETE /invoices/:id
```

### Endpoints Públicos (Cliente)

```typescript
// Visualizar orçamento
GET /invoices/public/:publicUrl

// Aprovar
POST /invoices/public/:publicUrl/approve

// Recusar
POST /invoices/public/:publicUrl/refuse
Body: { reason: string } // obrigatório

// Abandonar
POST /invoices/public/:publicUrl/abandon
Body: { reason: string } // obrigatório
```

---

## 💡 Dicas de Uso

### Para o Vendedor

1. **Crie orçamentos rapidamente**
   - Use o botão "Novo Orçamento"
   - Reutilize clientes existentes
   - Clone orçamentos similares

2. **Organize visualmente**
   - Use Kanban para ver status de forma visual
   - Filtre por cliente para acompanhar negociações
   - Marque origem para análise de conversão

3. **Compartilhe profissionalmente**
   - Gere URL pública com um clique
   - Configure data de validade
   - Acompanhe status em tempo real

### Para o Cliente

1. **Acesse o orçamento**
   - Clique no link recebido
   - Visualize todos os detalhes
   - Sem necessidade de cadastro

2. **Tome decisões**
   - Aprove se concordar
   - Recuse explicando o motivo
   - Abandone se não tiver mais interesse

3. **Documente**
   - Exporte para PDF
   - Imprima se necessário
   - Guarde para referência

---

## 🎨 Customizações

### Valores por Orçamento

**Importante:** Você pode customizar valores sem afetar o cadastro original

```typescript
{
  customName: "Nome alternativo para o item"
  customDescription: "Descrição personalizada"
  customPrice: 150.00  // Preço diferente do cadastro
}
```

**Quando usar:**
- Descontos específicos para cliente
- Pacotes especiais
- Promoções temporárias

**Ao clonar:**
- Escolha "Manter valores originais" → mantém customizações
- Escolha "Atualizar preços" → volta aos preços do cadastro

### Cálculo de Valores

**Fórmula Automática:**

```
Total de Itens = Soma(quantidade × preço unitário)
Valor Final = Total - Descontos + Acréscimos + Deslocamento
```

**Campos disponíveis:**
- `discounts`: Descontos gerais
- `additions`: Acréscimos (taxas, etc.)
- `displacement`: Custos de deslocamento

---

## 🚨 Regras Importantes

### ❌ Não Permitido

1. **Editar orçamento aprovado**
   - Motivo: Comprometimento já firmado
   - Solução: Clone e crie novo orçamento

2. **Deletar orçamento aprovado**
   - Motivo: Histórico importante
   - Solução: Marque como abandonado/desistido

3. **Acessar URL pública vencida**
   - Motivo: Prazo expirado
   - Solução: Solicite novo orçamento

### ✅ Permitido

1. **Clonar qualquer orçamento**
2. **Customizar valores individualmente**
3. **Regenerar URL pública**
4. **Desativar/ativar URL a qualquer momento**
5. **Mudar status (com justificativa quando necessário)**

---

## 🐛 Troubleshooting

### Problema: Orçamento não aparece na lista

**Possíveis causas:**
1. Filtros ativos
2. Termo de busca muito específico
3. Erro no carregamento

**Solução:**
1. Limpe todos os filtros
2. Recarregue a página (F5)
3. Verifique console do navegador

### Problema: Não consigo editar orçamento

**Causa provável:** Orçamento está aprovado

**Solução:**
- Clone o orçamento
- Edite a cópia
- Desative o anterior

### Problema: Cliente não consegue acessar URL pública

**Verifique:**
1. URL está ativa (`publicUrlActive = true`)
2. Orçamento está dentro da validade
3. Status permite acesso (DRAFT, READY, APPROVED, COMPLETED, INVOICED)

**Solução:**
- Regenere a URL
- Ajuste data de validade
- Verifique status

---

## 📞 Próximos Passos

### Funcionalidades em Desenvolvimento

1. **Formulário com Abas** (próxima implementação)
   - Aba Cliente
   - Aba Cabeçalho
   - Aba Produtos/Serviços
   - Aba Faturamento

2. **Exportação PDF Completa**
   - Cabeçalho da empresa
   - Logo
   - Formatação profissional

3. **Envio por Email**
   - Template personalizado
   - Anexo PDF automático
   - Link para URL pública

4. **Página Pública Completa**
   - Design profissional
   - Ações do cliente
   - Formulário de contato

---

## 📚 Recursos Adicionais

- **Documentação Completa:** `REFATORACAO_INVOICES_COMPLETA.md`
- **Especificações:** `REFATORAÇÃO_TELA_ORÇAMENTO.MD`
- **API Examples:** Veja console do navegador para exemplos de requisições

---

**Desenvolvido com ❤️ para otimizar seu processo de vendas**
