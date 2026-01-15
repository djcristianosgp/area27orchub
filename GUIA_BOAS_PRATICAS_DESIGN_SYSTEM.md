# 📚 GUIA DE BOAS PRÁTICAS - DESIGN SYSTEM ORCHUB

## 🎨 Padrões Visuais

### Cores
```typescript
// Primary - Ações principais
primary-600: #0284c7   // Estado normal
primary-700: #0369a1   // Hover
primary-800: #075985   // Active

// Secondary - Elementos neutros
secondary-600: #475569
secondary-700: #334155
secondary-900: #0f172a

// Success, Warning, Danger, Accent
// Seguir mesmo padrão com 50-900 scale
```

### Tipografia
```
h1: text-4xl font-bold    (36px, 700)
h2: text-3xl font-bold    (30px, 700)
h3: text-2xl font-semibold (24px, 600)
h4: text-xl font-semibold  (20px, 600)
p:  text-base font-normal  (16px, 400)
sm: text-sm font-medium    (14px, 500)
xs: text-xs font-regular   (12px, 400)
```

### Espaçamentos
```
xs: 0.5rem   (8px)
sm: 1rem     (16px)
md: 1.5rem   (24px)
lg: 2rem     (32px)
xl: 3rem     (48px)
```

### Border Radius
```
lg: 0.5rem    (8px) - inputs, buttons
xl: 0.75rem   (12px) - cards, modals
2xl: 1rem     (16px) - componentes grandes
3xl: 1.5rem   (24px) - destaque
```

---

## 🧩 Componentes Reutilizáveis

### 1. Button
```typescript
// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>

// Tamanhos
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Estados
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### 2. Input
```typescript
// Básico
<Input 
  label="Email"
  type="email"
  placeholder="seu@email.com"
  required
/>

// Com ícone
<Input
  label="Senha"
  type="password"
  icon={<Lock className="h-5 w-5" />}
/>

// Com erro
<Input
  label="Email"
  error="Email inválido"
  helperText="Digite um email válido"
/>
```

### 3. Card
```typescript
// Simple
<Card>
  <div>Conteúdo</div>
</Card>

// Com estrutura
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardBody>
    Conteúdo
  </CardBody>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### 4. Modal
```typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirmação"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
      <Button onClick={handleConfirm}>Confirmar</Button>
    </>
  }
>
  Conteúdo do modal
</Modal>
```

### 5. Table
```typescript
<Table
  columns={[
    { key: 'name', label: 'Nome', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge>{val}</Badge>
    }
  ]}
  data={items}
  onRowClick={handleRowClick}
  isLoading={loading}
/>
```

### 6. Badge
```typescript
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="secondary">Secondary</Badge>
```

### 7. Alert
```typescript
<Alert
  variant="info"
  title="Informação"
  message="Mensagem informativa"
  closable
  onClose={handleClose}
/>
```

---

## 📄 Padrões de Página

### Layout Padrão Admin
```typescript
import { AdminLayout } from '@components/layout';
import { PageHeader, SearchBar, Loading, EmptyState } from '@components/common';
import { Button, Card, Table, Modal } from '@components/ui';

export const MyPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header com ação */}
        <PageHeader
          title="Meu Título"
          subtitle="Subtítulo descritivo"
          action={<Button onClick={handleNew}>Nova Item</Button>}
        />

        {/* Filtros */}
        <Card>
          <div className="p-6 flex gap-4">
            <SearchBar onSearch={handleSearch} />
            <select className="input-base">
              <option>Filtro 1</option>
            </select>
          </div>
        </Card>

        {/* Conteúdo */}
        {loading ? (
          <Loading message="Carregando..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="Nenhum item"
            description="Comece criando seu primeiro item"
            action={{ label: 'Criar', onClick: handleNew }}
          />
        ) : (
          <Card>
            <Table columns={columns} data={data} />
          </Card>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {/* Formulário */}
        </Modal>
      </div>
    </AdminLayout>
  );
};
```

---

## 🎯 Padrões de Cor por Contexto

### Ações
- **Primary** (Azul): Ações principais, CTAs
- **Secondary** (Cinza): Ações secundárias, elementos neutros
- **Ghost**: Links, ações leves

### Estados
- **Success** (Verde): Sucesso, aprovar, ativo
- **Warning** (Amarelo): Atenção, aviso, pendente
- **Danger** (Vermelho): Erro, deletar, recusar
- **Accent** (Roxo): Destaque, premium

### Exemplos
```typescript
// Aprovar
<Button variant="success">Aprovar</Button>

// Deletar
<Button variant="danger">Deletar</Button>

// Pendente
<Badge variant="warning">Pendente</Badge>

// Ativo
<Badge variant="success">Ativo</Badge>
```

---

## 📐 Grid & Layout

### Grids Responsivos
```typescript
// 2 colunas em desktop, 1 em mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3 colunas em desktop, 1 em mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4 colunas em desktop, 2 em tablet, 1 em mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

### Flexbox
```typescript
// Topo centro
<div className="flex items-center justify-center">

// Espaço entre
<div className="flex items-center justify-between">

// Coluna com gap
<div className="flex flex-col gap-4">

// Linha com wrap
<div className="flex flex-wrap gap-2">
```

---

## ♿ Acessibilidade

### Labels Obrigatórios
```typescript
// ✓ Correto
<Input label="Email" type="email" required />

// ✗ Errado
<input type="email" placeholder="email" />
```

### Estados Visuais
```typescript
// ✓ Com indicador visual
<Button disabled>Desabilitado</Button>

// ✓ Com cor e ícone
<Badge variant="danger">Erro</Badge>

// ✗ Apenas por cor
<div className="bg-red-500">Texto</div>
```

### Navegação Keyboard
```typescript
// Todos os componentes interativos
// devem funcionar com Tab + Enter/Space
<button onClick={handleClick}>Clique</button>
```

---

## 🔄 Estados Comuns

### Loading
```typescript
{isLoading && <Loading message="Carregando..." />}

// Ou
<Button isLoading>Salvando...</Button>
```

### Erro
```typescript
{error && (
  <Alert 
    variant="danger" 
    title="Erro"
    message={error}
  />
)}
```

### Vazio
```typescript
{items.length === 0 && (
  <EmptyState
    title="Sem dados"
    description="Crie seu primeiro item"
    action={{ label: 'Criar', onClick: handleNew }}
  />
)}
```

### Sucesso
```typescript
{success && (
  <Alert
    variant="success"
    title="Sucesso!"
    message="Operação concluída"
    closable
  />
)}
```

---

## 🚀 Performance

### Code Splitting
```typescript
// Lazy load de páginas
const ProductsPage = lazy(() => import('./ProductsPage'));

<Suspense fallback={<Loading />}>
  <ProductsPage />
</Suspense>
```

### Memoization
```typescript
// Para componentes complexos
export const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### Otimização de Renders
```typescript
// useCallback para funções passadas como props
const handleDelete = useCallback((id) => {
  deleteItem(id);
}, []);

// useMemo para dados calculados
const filteredItems = useMemo(() => {
  return items.filter(/* ... */);
}, [items, searchQuery]);
```

---

## 📦 Estrutura de Componente Novo

```typescript
import React from 'react';
import { OtherComponent } from '@components/ui';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

/**
 * Descrição do componente
 * @param title - Título do componente
 * @param children - Conteúdo interno
 * @param variant - Variante visual
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`container-base ${className}`}>
      <h3 className="font-semibold text-secondary-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
};
```

---

## ✅ Checklist de Componente Novo

- [ ] Tipagem completa (TypeScript)
- [ ] Props bem documentadas
- [ ] Variantes de estilo
- [ ] Estados (hover, active, disabled)
- [ ] Responsividade
- [ ] Acessibilidade (labels, ARIA)
- [ ] Testes básicos
- [ ] Exportado no `index.ts`
- [ ] Documentação no Storybook (opcional)

---

## 🎓 Exemplos Práticos

### Listar Items com Filtro
```typescript
const [items, setItems] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredItems(filtered);
}, [items, searchQuery]);

return (
  <div className="space-y-6">
    <SearchBar onSearch={setSearchQuery} />
    <Table columns={columns} data={filteredItems} />
  </div>
);
```

### Modal com Formulário
```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '' });

const handleSave = async () => {
  await api.create(formData);
  setIsOpen(false);
};

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Novo</Button>
    <Modal 
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Novo Item"
      footer={
        <>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Criar</Button>
        </>
      }
    >
      <Input
        label="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    </Modal>
  </>
);
```

---

## 📞 Suporte

Para dúvidas ou sugestões:
1. Verificar este guia
2. Consultar componente similar existente
3. Seguir padrões do design system

---

*Guia de Boas Práticas - OrçHub v2.0*
*Última atualização: 14 de Janeiro de 2025*
