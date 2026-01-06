# 🎨 GUIA DE IMPLEMENTAÇÃO DO FRONTEND - ORÇAMENTOS REFATORADOS

## 📋 RESUMO DO QUE FOI FEITO NO BACKEND

✅ Corrigido bug de salvamento de grupos e itens  
✅ Adicionados campos de cabeçalho (código, origem, validade, observações)  
✅ Implementados descontos, acréscimos e deslocamento  
✅ Novos status: READY, EXPIRED, COMPLETED, INVOICED, ABANDONED, DESISTED  
✅ Customização de itens (nome, descrição, preço)  
✅ Condições de pagamento  
✅ Clone com opção de atualizar preços  
✅ Filtros avançados (cliente, status, produto, serviço, busca)  
✅ Mudança de status com validações  
✅ Ações públicas (aprovar, recusar, abandonar)  

---

## 🎯 O QUE PRECISA SER IMPLEMENTADO NO FRONTEND

### 1. **Página de Listagem** (`/admin/invoices`)

**Arquivo:** `frontend/src/pages/admin/InvoicesPage.tsx`

#### Funcionalidades Necessárias:

1. **Três Modos de Visualização:**
   - 📊 **Grid (Tabela):** Lista tradicional com colunas
   - 🎴 **Cards:** Cards organizados por status
   - 📋 **Kanban:** Colunas por status com drag-and-drop (opcional)

2. **Barra de Busca e Filtros:**
   ```typescript
   interface Filters {
     search: string;        // Busca por código ou nome do cliente
     clientId?: string;     // Filtro por cliente específico
     status?: InvoiceStatus; // Filtro por status
     productId?: string;    // Filtro por produto
     serviceId?: string;    // Filtro por serviço
   }
   ```

3. **Informações Exibidas em Cada Orçamento:**
   - Código (ORC-000001)
   - Cliente
   - Data de Criação
   - Status (com badge colorido)
   - Total (valor formatado em R$)

4. **Botão de Ações em Cada Orçamento:**
   - ✏️ Editar
   - 👁️ Visualizar
   - 📄 Exportar PDF
   - 📋 Clonar (com opção de atualizar preços)
   - 🚫 Marcar como Desistido/Abandonado
   - 🔗 Gerar Link Público
   - 📧 Enviar por Email

5. **Exportação:**
   - Botão "Exportar para PDF" que exporta os resultados filtrados

6. **Agrupamento por Status:**
   - Rascunho (cinza)
   - Pronto (azul)
   - Vencido (laranja)
   - Aprovado (verde)
   - Recusado (vermelho)
   - Concluído (roxo)
   - Faturado (índigo)
   - Abandonado (amarelo)
   - Desistido (rosa)

#### Exemplo de Código (Listagem com Filtros):

```typescript
// Requisição com filtros
const loadInvoices = async () => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.clientId) params.append('clientId', filters.clientId);
  if (filters.status) params.append('status', filters.status);
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.serviceId) params.append('serviceId', filters.serviceId);
  
  const response = await api.get(`/invoices?${params.toString()}`);
  setInvoices(response.data);
};

// Agrupar por status
const groupedByStatus = invoices.reduce((acc, invoice) => {
  if (!acc[invoice.status]) {
    acc[invoice.status] = [];
  }
  acc[invoice.status].push(invoice);
  return acc;
}, {} as Record<InvoiceStatus, Invoice[]>);
```

---

### 2. **Formulário de Criação/Edição** (`/admin/invoices/new` e `/admin/invoices/:id/edit`)

**Arquivo:** `frontend/src/pages/admin/InvoiceFormPage.tsx` (criar novo)

#### Estrutura com Abas:

```typescript
type TabType = 'client' | 'header' | 'items' | 'payment';

const tabs = [
  { id: 'client', label: 'Cliente' },
  { id: 'header', label: 'Cabeçalho' },
  { id: 'items', label: 'Produtos e Serviços' },
  { id: 'payment', label: 'Faturamento' },
];
```

#### **ABA 1: Cliente**
- Select de cliente existente OU
- Botão "Criar Novo Cliente"
- Exibir dados do cliente selecionado

#### **ABA 2: Cabeçalho**

**Campos SOMENTE LEITURA:**
- Código (ORC-000001) - gerado automaticamente
- Data de Criação - preenchida automaticamente

**Campos EDITÁVEIS:**
```typescript
interface HeaderData {
  proposalValidDate: string; // Data de validade da proposta
  origin: string;            // Origem (ex: "Website", "WhatsApp", "Telefone")
  observations: string;      // Observações gerais
}
```

#### **ABA 3: Produtos e Serviços**

**Estrutura:**
```typescript
interface InvoiceGroup {
  id?: string;
  name: string;               // Nome do grupo (ex: "Equipamentos de Som")
  type: 'PRODUCT' | 'SERVICE';
  items: InvoiceItem[];
}

interface InvoiceItem {
  id?: string;
  quantity: number;
  unitPrice: number;
  
  // Customização (exclusiva deste orçamento)
  customName?: string;        // Nome customizado
  customDescription?: string; // Descrição customizada
  customPrice?: number;       // Preço customizado
  
  // Referências originais
  productId?: string;
  serviceId?: string;
  productVariationId?: string;
  serviceVariationId?: string;
}
```

**Funcionalidades:**
1. Botão "+ Adicionar Grupo de Produtos"
2. Botão "+ Adicionar Grupo de Serviços"
3. Dentro de cada grupo:
   - Campo "Nome do Grupo"
   - Botão "+ Adicionar Item"
   - Lista de itens com:
     - Select de Produto/Serviço
     - Select de Variação
     - Quantidade
     - Preço unitário (editável)
     - Checkbox "Customizar"
       - Se marcado, exibe campos: Nome Custom, Descrição Custom, Preço Custom
     - Botão "Remover"
   - Mostrar **Subtotal do Grupo**
4. Mostrar **Total Geral**

#### **ABA 4: Faturamento**

```typescript
interface PaymentData {
  discounts: number;        // Descontos
  additions: number;        // Acréscimos
  displacement: number;     // Deslocamento/Frete
  paymentConditions: PaymentCondition[];
}

interface PaymentCondition {
  type: PaymentType;        // CASH, INSTALLMENTS, DEBIT_CARD, CREDIT_CARD, PIX, BOLETO
  description?: string;
  numberOfInstallments?: number;
  interestRate?: number;
}
```

**Layout:**
1. **Resumo Financeiro:**
   ```
   Subtotal:       R$ 1.000,00
   (-) Descontos:  R$   100,00
   (+) Acréscimos: R$    50,00
   (+) Deslocamento: R$  150,00
   -------------------------------
   TOTAL:          R$ 1.100,00
   ```

2. **Campos:**
   - Input Descontos (R$)
   - Input Acréscimos (R$)
   - Input Deslocamento (R$)

3. **Condições de Pagamento:**
   - Botão "+ Adicionar Forma de Pagamento"
   - Lista de formas:
     - Select Tipo (À Vista, Parcelado, Débito, Crédito, PIX, Boleto)
     - Input Descrição
     - Input Número de Parcelas (se parcelado)
     - Input Taxa de Juros
     - Botão "Remover"

#### Exemplo de Salvamento:

```typescript
const handleSubmit = async () => {
  const payload = {
    clientId: formData.clientId,
    origin: formData.origin,
    proposalValidDate: formData.proposalValidDate,
    observations: formData.observations,
    discounts: formData.discounts,
    additions: formData.additions,
    displacement: formData.displacement,
    groups: formData.groups.map(group => ({
      name: group.name,
      type: group.type,
      items: group.items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customName: item.customName,
        customDescription: item.customDescription,
        customPrice: item.customPrice,
        productId: item.productId,
        serviceId: item.serviceId,
        productVariationId: item.productVariationId,
        serviceVariationId: item.serviceVariationId,
      })),
    })),
    paymentConditions: formData.paymentConditions,
  };

  const response = await api.post('/invoices', payload);
  // Sucesso!
};
```

---

### 3. **Página Pública** (`/invoice/:publicUrl`)

**Arquivo:** `frontend/src/pages/PublicInvoicePage.tsx`

#### Funcionalidades:

1. **Validação de Acesso:**
   ```typescript
   const canAccess = (invoice: Invoice): boolean => {
     // Pode acessar se:
     // - Está dentro da data de validade OU
     // - Status é APPROVED, COMPLETED ou INVOICED
     
     const isValid = !invoice.proposalValidDate || 
                     new Date(invoice.proposalValidDate) >= new Date();
     
     const validStatuses = ['APPROVED', 'COMPLETED', 'INVOICED'];
     
     return isValid || validStatuses.includes(invoice.status);
   };
   ```

2. **Se NÃO pode acessar:**
   - Mostrar tela: "Orçamento Não Disponível"
   - Exibir código do orçamento
   - Formulário para enviar mensagem:
     ```
     "Deseja solicitar atualização deste orçamento?"
     [ ] Sim, quero atualização
     [Campo de mensagem opcional]
     [Botão Enviar Solicitação]
     ```

3. **Se PODE acessar:**

   **Layout:**
   
   a) **Cabeçalho com Dados da Empresa:**
   ```
   ╔══════════════════════════════════════╗
   ║  LOGO DA EMPRESA                     ║
   ║  Nome da Empresa                     ║
   ║  CNPJ: XX.XXX.XXX/0001-XX           ║
   ║  Endereço Completo                  ║
   ║  Telefone | Email                    ║
   ╚══════════════════════════════════════╝
   ```

   b) **Informações do Orçamento:**
   - Código
   - Data de Criação
   - Data de Validade
   - Status
   - Cliente

   c) **Grupos e Itens:**
   - Lista de grupos
   - Itens de cada grupo
   - Subtotal de cada grupo
   
   d) **Resumo Financeiro:**
   ```
   Subtotal:       R$ X
   Descontos:      R$ Y
   Acréscimos:     R$ Z
   Deslocamento:   R$ W
   -----------------------
   TOTAL:          R$ TOTAL
   ```

   e) **Condições de Pagamento:**
   - Lista de formas aceitas

   f) **Botões de Ação:**
   - ✅ **Aprovar** (verde) → Muda status para APPROVED
   - ❌ **Recusar** (vermelho) → Modal com campo de motivo → Muda para REFUSED
   - 🚫 **Abandonar** (amarelo) → Modal com campo de motivo → Muda para ABANDONED
   - 📄 **Exportar PDF**
   - 🖨️ **Imprimir**

#### Exemplo de Ações:

```typescript
const handleApprove = async () => {
  await api.post(`/invoices/public/${publicUrl}/approve`);
  alert('Orçamento aprovado com sucesso!');
};

const handleRefuse = async (reason: string) => {
  await api.post(`/invoices/public/${publicUrl}/refuse`, { reason });
  alert('Orçamento recusado.');
};

const handleAbandon = async (reason: string) => {
  await api.post(`/invoices/public/${publicUrl}/abandon`, { reason });
  alert('Orçamento abandonado.');
};
```

---

### 4. **Modal de Clonar Orçamento**

Quando clicar em "Clonar":

```typescript
const handleClone = async (invoiceId: string, updatePrices: boolean) => {
  const response = await api.post(`/invoices/${invoiceId}/clone?updatePrices=${updatePrices}`);
  alert('Orçamento clonado!');
  // Redirecionar para edição do novo orçamento
  navigate(`/admin/invoices/${response.data.id}/edit`);
};
```

**Modal:**
```
╔═══════════════════════════════════════╗
║  Clonar Orçamento                     ║
╠═══════════════════════════════════════╣
║  [ ] Atualizar preços com valores    ║
║      atuais do cadastro               ║
║                                       ║
║  ⚠️ Marcando esta opção, os preços   ║
║     serão atualizados caso tenham     ║
║     sido alterados nos cadastros.     ║
║                                       ║
║  [Cancelar]  [Clonar Orçamento]      ║
╚═══════════════════════════════════════╝
```

---

### 5. **Modal de Mudança de Status**

```typescript
const statusOptions = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'READY', label: 'Pronto' },
  { value: 'EXPIRED', label: 'Vencido' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REFUSED', label: 'Recusado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'INVOICED', label: 'Faturado' },
  { value: 'ABANDONED', label: 'Abandonado' },
  { value: 'DESISTED', label: 'Desistido' },
];

const handleChangeStatus = async (invoiceId: string, status: string, reason?: string) => {
  await api.post(`/invoices/${invoiceId}/status`, { status, reason });
  loadInvoices();
};
```

Se o status for ABANDONED, DESISTED ou REFUSED, mostrar campo de motivo.

---

## 🎨 COMPONENTES REUTILIZÁVEIS A CRIAR

### 1. `InvoiceStatusBadge.tsx`
```typescript
const statusColors = {
  DRAFT: 'gray',
  READY: 'blue',
  EXPIRED: 'orange',
  // ...
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge color={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  );
}
```

### 2. `InvoiceGroupCard.tsx`
Componente para exibir um grupo de produtos/serviços com seus itens e subtotal.

### 3. `InvoiceItemRow.tsx`
Linha de item dentro de um grupo, com opções de edição/customização.

### 4. `PaymentConditionForm.tsx`
Formulário para adicionar/editar condição de pagamento.

### 5. `InvoiceFinancialSummary.tsx`
Card com resumo financeiro (subtotal, descontos, total, etc).

---

## 📦 PACOTES NECESSÁRIOS

```bash
# Para geração de PDF
npm install jspdf jspdf-autotable

# Para drag-and-drop (Kanban)
npm install @dnd-kit/core @dnd-kit/sortable

# Para ícones
npm install @heroicons/react
```

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

1. ✅ **Backend (COMPLETO)**
2. ⏳ **Frontend:**
   1. Atualizar tipos (`Invoice`, `InvoiceGroup`, `InvoiceItem`, `PaymentCondition`)
   2. Atualizar serviço API (`api.ts`) com novos endpoints
   3. Criar componentes base (Badge, GroupCard, ItemRow, etc)
   4. Implementar página de listagem com 3 visualizações
   5. Implementar formulário de criação/edição com abas
   6. Implementar página pública
   7. Adicionar exportação PDF
   8. Testes finais

---

## 📞 PRECISA DE AJUDA?

Me avise qual parte você quer que eu implemente primeiro:
- 🎨 Componentes base
- 📋 Página de listagem
- ✏️ Formulário de criação/edição
- 🌐 Página pública
- 📄 Exportação PDF

Ou posso implementar tudo de uma vez! 🚀
