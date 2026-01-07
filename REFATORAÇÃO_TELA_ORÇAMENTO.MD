Contexto do Projeto
Você está trabalhando em um sistema web de orçamentos (Invoices), com frontend em React e backend em Node/NestJS (ou equivalente), utilizando banco de dados relacional.
A tela atual de orçamentos precisa ser refatorada visualmente e logicamente, mantendo compatibilidade com dados existentes, mas reorganizando fluxos, estados, regras de negócio e experiência do usuário.

🎯 Objetivo Geral

Refatorar a tela http://localhost:3001/admin/invoices e toda a lógica relacionada a listagem, criação, edição, clonagem, visualização pública e exportação de orçamentos, conforme as regras abaixo.

1️⃣ Tela Inicial – Listagem de Orçamentos

Ao acessar http://localhost:3001/admin/invoices:

Visualização

Permitir alternar entre:

Grid

Cards

Kanban

Os orçamentos devem estar agrupados por status:

Rascunho

Pronto

Vencido

Aprovado

Recusado

Concluído

Faturado

Desistido

Abandonado

Dados exibidos em cada orçamento

Código

Cliente

Criado em

Status

Valor Total

Filtros (com seleção múltipla)

Clientes

Serviços

Produtos

Status

Ações Globais

Exportar o resultado filtrado para PDF

2️⃣ Ações por Orçamento (Listagem)

Cada orçamento deve ter um botão/menu de ações, independente da visualização (grid/cards/kanban):

Editar

Visualizar

Exportar para PDF

Clonar

Marcar como Desistido

Marcar como Abandonado

Gerar Página Pública

Enviar por Email

3️⃣ Criação / Edição de Orçamento (Tela com Abas)

A criação e edição de um orçamento deve ser feita em uma tela com abas (tabs):

🧾 Aba 1 — Cliente

Seleção ou visualização dos dados do cliente

Permitir reutilização de clientes já cadastrados

📄 Aba 2 — Cabeçalho do Orçamento

Campos não editáveis:

Código do orçamento

Data de criação

Campos editáveis:

Data de validade da proposta

Origem do orçamento

Observações

Outros campos relevantes (ex: responsável, referência interna, etc.)

🧰 Aba 3 — Produtos e Serviços

Lançamento de produtos e serviços

Possibilidade de:

Agrupar itens

Visualizar subtotal por grupo

Visualizar valor total geral

Permitir:

Ajustar descrição

Ajustar valores

⚠️ Essas alterações são exclusivas do orçamento

Não afetam o cadastro original

Não afetam outros orçamentos

Devem ser mantidas no clone, se escolhido

💳 Aba 4 — Faturamento

Condições de pagamento (uma ou mais):

À vista

A prazo

Cartão de débito

Cartão de crédito

Dinheiro

Pix

Boleto

Campos adicionais:

Descontos

Acréscimos

Deslocamento

O valor final do orçamento deve ser recalculado dinamicamente

4️⃣ Página Pública do Orçamento

Cada orçamento pode gerar uma URL pública

O cliente só pode acessar se:

Estiver dentro da data de validade OU

Status for:

Aprovado

Concluído

Faturado

Orçamento indisponível

Se o cliente acessar uma URL inválida:

Redirecionar para uma página informativa

Exibir o código do orçamento

Permitir enviar uma mensagem solicitando atualização do orçamento

5️⃣ Clonagem de Orçamento

Ao clonar:

Perguntar:

“Deseja atualizar os valores de acordo com os preços atuais do cadastro?”

Se sim:

Atualizar preços de produtos e serviços

Se não:

Manter os valores do orçamento original

6️⃣ Cabeçalho da Empresa (PDF e Página Pública)

No PDF e na URL pública, exibir:

Nome da empresa

Logo

CNPJ

Endereço

Contatos

Como cabeçalho padrão do orçamento

7️⃣ Ações na Página Pública (Cliente)

O cliente poderá:

Exportar para PDF

Imprimir

Ações de decisão:

Aprovar

Recusar

Abandonar

⚠️ Se a ação for Recusar ou Abandonar, exigir:

Justificativa obrigatória

🧠 Diretrizes Técnicas

Refatorar componentes para:

Reutilização

Separação de responsabilidades

Boa organização de estados

Backend:

Validar regras de status

Controlar permissões de acesso à URL pública

Garantir consistência ao clonar orçamentos

Frontend:

UX moderna

Feedback visual de status

Componentes desacoplados

Caso alguma regra descrita não seja ideal:

Propor melhorias

Ajustar a lógica explicando a decisão

👉 Execute a refatoração completa considerando código limpo, escalabilidade, legibilidade e boas práticas.