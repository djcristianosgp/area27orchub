Você é um desenvolvedor fullstack sênior.

Crie um sistema web fullstack para geração de ORÇAMENTOS VIRTUAIS,
compartilhamento de CUPONS DE DESCONTO e PRODUTOS COM LINKS DE AFILIADOS.

STACK OBRIGATÓRIA
- Frontend: React + TypeScript
- Backend: Node.js + Express ou NestJS
- Banco de dados: PostgreSQL com a porta 5463 
- ORM: Prisma
- Estilo: UI moderna (estilo marketplace)
- Autenticação: JWT
- API REST
- Projeto organizado em camadas (DTOs, Services, Controllers)

----------------------------------------------------
FUNCIONALIDADES PRINCIPAIS
----------------------------------------------------

### 1) ORÇAMENTOS VIRTUAIS

#### Telas:
- Cadastro de Clientes
- Cadastro de Produtos
- Cadastro de Serviços
- Criação de Orçamentos
- Visualização pública do orçamento via link

#### Clientes:
- Nome
- Email
- Telefone
- Observações

#### Produtos:
- Nome
- Descrição
- Categoria
- Marca
- Grupo
- Possui VARIAÇÕES
- Cada variação:
  - Nome
  - Preço
  - Link de afiliado (Amazon, Mercado Livre, AliExpress etc)
  - Observação opcional

#### Serviços:
- Nome
- Descrição
- Possui VARIAÇÕES
- Cada variação:
  - Nome
  - Preço
  - Observação

#### Orçamentos:
- Cliente vinculado
- Data de criação
- Status: Rascunho | Enviado | Aprovado | Recusado
- Pode conter:
  - Grupos de Produtos
  - Grupos de Serviços
- Cada grupo:
  - Nome do grupo
  - Itens associados
- Regras:
  - Cada variação tem preço independente
  - Orçamento pode ser CLONADO
  - Geração de LINK PÚBLICO para visualização
  - Cliente pode APROVAR ou RECUSAR via link
  - Orçamento aprovado não pode ser editado

----------------------------------------------------
### 2) CUPONS DE DESCONTO

- Página pública exibindo cupons disponíveis
- Campos do cupom:
  - Título
  - Descrição
  - Plataforma (Amazon, Mercado Livre, AliExpress etc)
  - Código do cupom
  - Link afiliado
  - Data de validade
  - Ativo/Inativo

----------------------------------------------------
### 3) PRODUTOS COM AFILIADOS (MARKETPLACE)

- Página pública de produtos
- Layout atrativo estilo marketplace
- Filtros:
  - Categoria
  - Marca
  - Grupo
- Cada produto exibe:
  - Nome
  - Imagem
  - Menor preço entre variações
  - Botão "Comprar" (link afiliado)
- SEO friendly

----------------------------------------------------
REQUISITOS TÉCNICOS
----------------------------------------------------
- Backend com:
  - CRUD completo para Clientes, Produtos, Serviços, Orçamentos e Cupons
  - Endpoints REST bem definidos
  - Validações
  - Autorização por JWT
- Frontend com:
  - React Hooks
  - Context API ou Zustand
  - Componentes reutilizáveis
  - Páginas públicas e privadas
- Banco:
  - Modelagem relacional
  - Relacionamentos entre produtos, variações, orçamentos e clientes
- Código limpo, comentado e escalável

----------------------------------------------------
EXTRAS (SE POSSÍVEL)
----------------------------------------------------
- Dashboard inicial
- Cálculo automático de total do orçamento
- Tema claro/escuro
- Responsivo (mobile-first)

Crie:
- Estrutura de pastas
- Models (Prisma)
- Controllers
- Services
- Rotas
- Telas principais em React
- Exemplos de payloads da API
