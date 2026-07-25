# PRD — Finnext

**Produto:** Finnext — controle financeiro pessoal  
**Versão do documento:** 1.0  
**Data:** 24/07/2026  
**Status:** Baseline funcional e especificação-alvo  
**Base de análise:** aplicação Next.js, componentes de interface, schema e funções SQL disponíveis no repositório

---

## 1. Resumo executivo

O Finnext é uma aplicação web de finanças pessoais que permite ao usuário registrar receitas e despesas, organizar lançamentos por categorias e subcategorias, planejar o orçamento mensal, acompanhar realizado versus planejado e consultar relatórios financeiros.

O problema central atendido é a dificuldade de transformar registros financeiros dispersos em uma visão mensal acionável. O sistema conecta três ciclos:

1. **Organizar:** definir categorias e subcategorias.
2. **Registrar:** lançar receitas e despesas com data, origem, descrição e tags.
3. **Planejar e acompanhar:** distribuir uma receita-base em orçamentos, comparar o gasto realizado e analisar resultados.

Este PRD documenta tanto o comportamento encontrado no sistema quanto o comportamento-alvo necessário para torná-lo consistente e pronto para produção. Quando houver diferença, são usadas as marcações:

- **Atual:** comportamento identificado na implementação.
- **Alvo:** regra definitiva proposta para o produto.
- **Gap:** inconsistência ou capacidade incompleta a corrigir.

## 2. Visão do produto

### 2.1 Proposta de valor

Dar ao usuário uma visão simples, privada e atualizada de sua vida financeira, ligando cada despesa ao orçamento correspondente e reduzindo o esforço para responder:

- Quanto recebi e gastei no período?
- Qual é meu saldo?
- Em quais categorias estou gastando?
- Quanto ainda posso gastar em cada área?
- Estou acima do orçamento?
- Como este período se compara aos anteriores?

### 2.2 Objetivos de negócio

- Aumentar a frequência e a consistência do registro financeiro pessoal.
- Fazer o usuário concluir seu primeiro ciclo de valor no mesmo dia: conta → categoria → lançamento → visão consolidada.
- Tornar o orçamento mensal um instrumento recorrente, não apenas uma tela de consulta.
- Garantir confiança nos cálculos e isolamento completo dos dados de cada usuário.
- Permitir portabilidade dos dados por exportação.

### 2.3 Objetivos do usuário

- Registrar um lançamento em menos de um minuto.
- Saber o saldo do mês sem cálculos manuais.
- Encontrar transações por descrição, tag, tipo, origem, categoria e período.
- Planejar gastos sem ultrapassar a renda disponível.
- Reaproveitar um orçamento em outro mês.
- Exportar dados e relatórios para uso externo.

### 2.4 Não objetivos da versão atual

- Conta bancária, cartão ou Open Finance sincronizados.
- Conciliação bancária automática.
- Pagamentos, transferências ou movimentação real de dinheiro.
- Investimentos, patrimônio, dívidas e parcelamento.
- Finanças compartilhadas, contas familiares ou múltiplos perfis.
- Contabilidade empresarial, emissão fiscal ou regime tributário.
- Inteligência artificial para classificação automática.

## 3. Público e personas

### 3.1 Persona principal — Organizador individual

Pessoa que controla receitas e despesas próprias, recebe uma ou mais fontes de renda e deseja entender seus hábitos. Tem conhecimento financeiro básico e busca uma ferramenta mais estruturada que uma anotação, mas mais simples que uma planilha complexa.

### 3.2 Persona secundária — Planejador mensal

Pessoa que distribui antecipadamente a renda do mês entre moradia, alimentação, transporte e outras áreas. Valoriza alertas de limite, reaproveitamento do orçamento e comparação entre planejado e realizado.

### 3.3 Papel e permissões

Há um único papel de aplicação: **usuário autenticado**. Cada usuário pode criar, ler, atualizar e excluir somente os próprios dados. Visitantes acessam apenas landing page, login, cadastro e mensagens de autenticação.

## 4. Escopo funcional

| Módulo | Finalidade | Estado observado |
|---|---|---|
| Autenticação | Cadastro, confirmação de e-mail, login, logout e proteção de rotas | Parcialmente implementado |
| Onboarding | Criar categorias padrão e apresentar tour | Parcialmente implementado |
| Dashboard | Consolidar indicadores, últimos lançamentos e orçamento | Implementado com controles não funcionais |
| Lançamentos | Criar, editar, excluir, listar e filtrar receitas/despesas | Implementado |
| Categorias | Administrar categorias e subcategorias | Implementado com gaps de validação |
| Orçamentos | Definir renda-base, alocar limites, acompanhar e duplicar | Implementado |
| Relatórios | Resumo, categorias, tendência, orçamento versus realizado | Implementado com divergências de banco |
| Configurações | Perfil, notificações, backup e exclusão de conta | Parcialmente implementado |

## 5. Arquitetura de informação e navegação

### 5.1 Rotas públicas

- `/auth/login`: autenticação por e-mail e senha.
- `/auth/sign-up`: criação de conta.
- `/auth/sign-up-success`: orientação para confirmar e-mail.
- `/auth/error`: apresentação de falha de autenticação.

### 5.2 Rotas autenticadas

- `/dashboard`: visão mensal consolidada.
- `/lancamentos`: gestão de receitas e despesas.
- `/categorias`: taxonomia financeira.
- `/orcamentos`: planejamento mensal.
- `/relatorios`: análises por período.
- `/configuracoes`: conta, preferências e dados.

### 5.3 Regra de navegação

- Rotas privadas exigem sessão válida.
- Usuário sem sessão deve ser redirecionado para `/auth/login`.
- Após login bem-sucedido, o destino padrão é `/dashboard`.
- Após logout, o destino é `/auth/login`.
- **Alvo:** preservar a URL privada solicitada e retornar a ela após login.

## 6. Jornada principal de ponta a ponta

1. Cria conta com e-mail e senha e confirma a senha.
2. O provedor de autenticação envia confirmação por e-mail.
3. O sistema tenta criar categorias e subcategorias padrão de forma idempotente.
4. Usuário confirma o e-mail, entra e chega ao dashboard.
5. Configura ou ajusta categorias.
6. Registra receitas e despesas.
7. Define a receita-base de um mês.
8. Distribui valores entre subcategorias, sem exceder a receita-base.
9. Cada despesa atualiza automaticamente o valor realizado do orçamento correspondente.
10. Dashboard e relatórios refletem os dados ativos.
11. Usuário filtra, compara, duplica orçamento ou exporta informações.

## 7. Requisitos funcionais e processos

### 7.1 Aquisição e autenticação

#### Fluxo A1 — Cadastro

**Pré-condição:** visitante não autenticado.  
**Entrada:** e-mail, senha e confirmação de senha.

**Processo:**

1. Validar formato e preenchimento do e-mail.
2. Validar senha com mínimo de 6 caracteres.
3. Validar igualdade entre senha e confirmação.
4. Solicitar criação de usuário ao Supabase Auth.
5. Se houver sessão disponível, chamar a criação das categorias padrão.
6. Direcionar para a tela de sucesso e instrução de confirmação de e-mail.

**Exceções:**

- Senhas diferentes: bloquear e informar “As senhas não coincidem”.
- Senha curta: bloquear e informar o mínimo.
- E-mail existente, inválido ou falha do provedor: exibir mensagem acionável sem apagar os campos.
- Falha na criação das categorias padrão: não invalidar a conta; registrar a falha e tentar novamente no primeiro login.

**Critérios de aceite:**

- Uma conta válida é criada apenas uma vez por e-mail.
- A senha nunca é persistida pelo Finnext.
- A operação de categorias padrão pode ser repetida sem duplicação.
- O usuário recebe feedback visual durante o processamento.

#### Fluxo A2 — Login

1. Receber e-mail e senha obrigatórios.
2. Autenticar via senha.
3. Em sucesso, criar/renovar sessão e abrir o dashboard.
4. Em falha, permanecer na página e exibir erro.

#### Fluxo A3 — Logout

1. Usuário aciona “Sair” no menu lateral.
2. Sistema encerra a sessão no provedor.
3. Dados privados deixam de estar acessíveis.
4. Sistema direciona ao login.

#### Regras de autenticação

- **RN-AUT-01:** toda operação de dados exige usuário autenticado.
- **RN-AUT-02:** a identidade usada nos registros deve ser obtida da sessão, nunca aceita livremente do cliente.
- **RN-AUT-03:** confirmação de e-mail segue a configuração do provedor; conta não confirmada não deve ganhar acesso quando a confirmação estiver obrigatória.
- **RN-AUT-04:** criação das categorias padrão é idempotente: se o usuário já possui categorias, nada é inserido.
- **RN-AUT-05 (alvo):** oferecer recuperação de senha e reenvio de confirmação.

### 7.2 Onboarding e categorias padrão

Categorias iniciais observadas na versão SQL final:

| Categoria | Subcategorias padrão |
|---|---|
| Alimentação | Supermercado, Restaurantes, Delivery |
| Transporte | Combustível, Transporte Público, Uber/Taxi |
| Moradia | Aluguel, Contas, Manutenção |
| Saúde | Médicos, Medicamentos, Academia |
| Lazer | Cinema, Viagens, Hobbies |
| Educação | Cursos, Livros, Assinaturas |
| Outros | Diversos, Emergência |

**Alvo do onboarding:**

1. Garantir taxonomia inicial.
2. Explicar rapidamente lançamentos, orçamento e relatórios.
3. Levar o usuário a registrar sua primeira receita ou despesa.
4. Oferecer pular o tour sem bloquear o produto.

- **RN-ONB-01:** categorias padrão pertencem ao usuário e podem ser editadas.
- **RN-ONB-02:** o sistema não deve duplicar categorias em tentativas posteriores.
- **RN-ONB-03 (alvo):** conclusão/dispensa do tour deve ser persistida por usuário.

### 7.3 Categorias e subcategorias

#### Fluxo C1 — Criar ou editar categoria

1. Usuário abre “Categorias” e aciona nova categoria ou edição.
2. Informa nome obrigatório; descrição, cor e ordem são configuráveis.
3. Sistema normaliza espaços do nome e descrição.
4. Sistema valida dados e persiste.
5. Lista é recarregada, ordenada primeiro por `ordem` e depois por nome.

#### Fluxo C2 — Criar ou editar subcategoria

1. Usuário aciona “Nova Subcategoria” ou adiciona dentro de uma categoria.
2. Seleciona uma categoria própria e ativa.
3. Informa nome obrigatório e descrição opcional.
4. Sistema persiste e apresenta a subcategoria em ordem alfabética.

#### Fluxo C3 — Excluir

1. Usuário abre ações e solicita exclusão.
2. Sistema apresenta confirmação irreversível.
3. Categoria com subcategorias não pode ser excluída pela interface.
4. Subcategoria pode ser excluída, sujeita às relações existentes.

#### Regras de categorias

- **RN-CAT-01:** nome da categoria e da subcategoria é obrigatório após remoção de espaços periféricos.
- **RN-CAT-02:** categoria possui uma cor hexadecimal válida.
- **RN-CAT-03:** ordem, quando informada, é inteira e maior ou igual a 1.
- **RN-CAT-04:** subcategoria pertence a exatamente uma categoria e ao mesmo usuário.
- **RN-CAT-05:** categoria não pode ser excluída enquanto possuir subcategorias.
- **RN-CAT-06 (alvo):** nomes de categorias devem ser únicos por usuário, sem diferenciar maiúsculas/minúsculas.
- **RN-CAT-07 (alvo):** nomes de subcategorias devem ser únicos dentro da categoria.
- **RN-CAT-08 (alvo):** se uma subcategoria tiver lançamentos, sua exclusão deve ser lógica (`ativo=false`) ou bloqueada; nunca deve apagar histórico financeiro por cascata.
- **RN-CAT-09:** somente entidades ativas aparecem em seletores e telas operacionais.

**Gap crítico:** o schema permite `ordem NOT NULL`, mas o formulário envia `null` quando o campo opcional fica vazio. A regra-alvo deve tornar a ordem automática ou obrigatória.

### 7.4 Lançamentos

#### Objeto de negócio

Um lançamento representa uma ocorrência financeira, com:

- tipo: `receita` ou `despesa`;
- origem: `fixa` ou `extra`;
- valor monetário;
- data de competência;
- descrição;
- subcategoria opcional;
- conjunto opcional de tags;
- indicador de atividade.

#### Fluxo L1 — Novo lançamento

1. Usuário aciona “Novo Lançamento”.
2. O formulário inicia com tipo `despesa`, origem `extra` e data atual.
3. Usuário informa tipo, origem, valor, data e descrição.
4. Opcionalmente escolhe subcategoria e adiciona tags únicas.
5. Sistema valida e grava o lançamento.
6. Se for despesa categorizada, o realizado do orçamento do mesmo mês/ano e subcategoria é atualizado.
7. Lista, dashboard e relatórios passam a considerar o registro.

#### Fluxo L2 — Editar lançamento

1. Usuário abre ações do lançamento e escolhe editar.
2. Sistema preenche todos os dados atuais.
3. Usuário altera e salva.
4. Sistema remove o impacto orçamentário anterior, quando aplicável, e adiciona o novo impacto.
5. Visões derivadas são recalculadas.

#### Fluxo L3 — Excluir lançamento

1. Usuário solicita exclusão.
2. Sistema exibe descrição e valor na confirmação.
3. Após confirmação, remove o registro.
4. Se era despesa categorizada, subtrai o impacto do orçamento original sem deixar o realizado abaixo de zero.

#### Fluxo L4 — Busca e filtros

Filtros disponíveis:

- texto em descrição ou tags;
- tipo;
- origem;
- subcategoria;
- data inicial inclusiva;
- data final inclusiva.

Filtros são combinados por interseção (AND). A ordenação padrão é data decrescente e, em empate, criação decrescente.

#### Regras de lançamentos

- **RN-LAN-01:** tipo aceita somente receita ou despesa.
- **RN-LAN-02:** origem aceita somente fixa ou extra.
- **RN-LAN-03:** valor é decimal positivo, com duas casas; zero não deve ser aceito no alvo.
- **RN-LAN-04:** descrição é obrigatória e não vazia após normalização.
- **RN-LAN-05:** data é obrigatória; datas passadas e futuras são permitidas.
- **RN-LAN-06:** subcategoria, quando informada, deve estar ativa e pertencer ao usuário.
- **RN-LAN-07:** tags vazias não são persistidas; uma mesma tag não é duplicada no lançamento.
- **RN-LAN-08:** receitas não incrementam `valor_gasto` de orçamento.
- **RN-LAN-09:** somente lançamentos ativos entram nos totais financeiros.
- **RN-LAN-10:** editar tipo, valor, data ou subcategoria deve transferir corretamente o efeito entre orçamentos.
- **RN-LAN-11:** a operação e o ajuste orçamentário devem ser atômicos.
- **RN-LAN-12 (alvo):** exclusão deve ser lógica para preservar auditabilidade, salvo decisão explícita de privacidade.

### 7.5 Orçamento mensal

#### Conceitos

- **Receita-base:** valor disponível para planejamento em determinado mês e ano.
- **Valor planejado:** limite alocado a uma subcategoria.
- **Valor gasto:** soma das despesas ativas daquela subcategoria no período.
- **Saldo disponível:** planejado menos gasto.
- **Percentual usado:** gasto dividido pelo planejado, vezes 100.

#### Fluxo O1 — Selecionar competência

1. Tela inicia no mês e ano atuais.
2. Usuário pode escolher mês de janeiro a dezembro.
3. Usuário pode escolher ano em janela de cinco anos (dois anteriores ao atual até dois posteriores).
4. Sistema carrega receita-base, categorias/subcategorias e orçamentos da competência.

#### Fluxo O2 — Definir receita-base

1. Usuário informa valor não negativo.
2. Se já houver registro da competência, atualiza; senão, cria.
3. A combinação usuário + mês + ano é única.
4. Ao reduzir a receita-base abaixo do total já alocado, sistema alerta e bloqueia a confirmação até ajuste ou confirmação de uma regra específica.

#### Fluxo O3 — Alocar orçamento

1. Após existir receita-base, sistema lista subcategorias ativas agrupadas por categoria.
2. Para cada subcategoria, usuário edita valor ou percentual da receita-base.
3. Alterar valor recalcula percentual; alterar percentual recalcula valor.
4. Sistema soma valores e percentuais, apresenta restante e progresso.
5. Se o total exceder a receita-base, sinaliza e bloqueia salvar.
6. Ao salvar, persiste apenas alocações positivas.
7. Valores realizados existentes devem ser preservados ou recalculados a partir dos lançamentos.

#### Fluxo O4 — Duplicar orçamento

1. Usuário escolhe mês e ano de destino.
2. Sistema impede destino que já tenha orçamento.
3. Sistema copia receita-base e valores planejados da competência atual.
4. O realizado no destino começa em zero, ou é recalculado caso já existam despesas naquele destino.
5. Operação conclui integralmente ou é revertida por completo.

#### Fluxo O5 — Exportar orçamento

Gera CSV da competência contendo categoria, subcategoria, planejado, gasto, percentual utilizado e saldo.

#### Regras de orçamento

- **RN-ORC-01:** competência é definida por mês de 1 a 12 e ano maior ou igual a 2020.
- **RN-ORC-02:** existe no máximo uma receita-base por usuário e competência.
- **RN-ORC-03:** existe no máximo um orçamento por usuário, subcategoria e competência.
- **RN-ORC-04:** valores monetários não podem ser negativos.
- **RN-ORC-05:** soma planejada não pode exceder a receita-base.
- **RN-ORC-06:** percentual individual deve ficar entre 0% e 100%.
- **RN-ORC-07:** subcategorias com valor planejado zero não precisam gerar registro.
- **RN-ORC-08:** `valor_gasto` é derivado de lançamentos e não deve ser editado pelo usuário.
- **RN-ORC-09:** despesa sem subcategoria não afeta orçamento por subcategoria, mas entra no total de despesas.
- **RN-ORC-10:** gasto pode ultrapassar o planejado; o saldo fica negativo e deve ser destacado.
- **RN-ORC-11:** orçamento sem planejado pode ser criado automaticamente para acumular realizado, mas não deve ser exibido como planejamento até receber valor planejado.
- **RN-ORC-12:** duplicação não pode sobrescrever silenciosamente o destino.
- **RN-ORC-13:** duplicação deve ser transacional.
- **RN-ORC-14:** salvar alocações não pode perder o realizado já apurado.

**Gap crítico:** a implementação atual exclui todos os orçamentos da competência e reinsere apenas alocações positivas, carregando `valor_gasto` do cliente. O alvo é realizar `upsert` apenas do planejado e calcular o gasto no banco.

### 7.6 Dashboard

#### Conteúdo do mês atual

- Total de receitas ativas.
- Total de despesas ativas.
- Saldo atual: receitas menos despesas.
- Orçamento total planejado.
- Percentual gasto: despesas totais dividido pelo orçamento total.
- Cinco lançamentos mais recentemente criados.
- Até seis orçamentos planejados, priorizados por maior gasto.
- Ações rápidas para novo lançamento, orçamento e relatórios.

#### Regras de dashboard

- **RN-DAS-01:** período padrão é o mês civil atual no fuso definido para o usuário/sistema.
- **RN-DAS-02:** totais consideram somente dados ativos do usuário.
- **RN-DAS-03:** saldo pode ser positivo, zero ou negativo e deve ter semântica visual coerente.
- **RN-DAS-04:** se orçamento total for zero, percentual gasto é zero, evitando divisão por zero.
- **RN-DAS-05:** acima de 80% do orçamento, o indicador assume estado de atenção; acima de 100%, estado excedido.
- **RN-DAS-06 (alvo):** comparativos percentuais devem ser calculados contra o período anterior, nunca fixos na interface.
- **RN-DAS-07 (alvo):** controles de período e filtros só devem ser exibidos quando funcionais.

**Gaps:** os textos “+12,5%” e “-3,2%” são fixos; os botões “Este mês” e “Filtros” não alteram a consulta.

### 7.7 Relatórios e análises

#### Fluxo R1 — Consultar relatório

1. Período padrão vai do primeiro dia do mês atual até hoje.
2. Usuário altera data inicial, data final e tipo de relatório.
3. Sistema valida que a data inicial não é posterior à final.
4. Sistema carrega:
   - receitas, despesas e saldo líquido;
   - uso do orçamento;
   - variação contra período anterior equivalente;
   - despesas agrupadas por categoria;
   - evolução mensal dos últimos seis meses até a data final;
   - orçamento versus realizado do mês selecionado.
5. Interface apresenta estados de carregamento, vazio e erro.

#### Fluxo R2 — Exportar

- CSV: exporta dados coerentes com o filtro e o tipo selecionado.
- PDF: **alvo**, ainda não implementado.
- Arquivo deve incluir período, data de geração, moeda e cabeçalhos localizados.

#### Fórmulas

- `saldo_líquido = total_receitas - total_despesas`
- `uso_orçamento = total_despesas / orçamento_total × 100`
- `variação = (valor_atual - valor_anterior) / valor_anterior × 100`
- Se valor anterior for zero, variação deve ser apresentada como “sem base de comparação”, e não como crescimento zero.
- `realizado_categoria = soma das despesas ativas ligadas às subcategorias da categoria no período`

#### Regras de relatórios

- **RN-REL-01:** limites do período são inclusivos.
- **RN-REL-02:** data inicial deve ser menor ou igual à data final.
- **RN-REL-03:** todos os cálculos ignoram registros inativos.
- **RN-REL-04:** filtro de tipo deve controlar consultas e seções exibidas.
- **RN-REL-05:** gasto sem categoria é agrupado em “Outros/Não categorizado”.
- **RN-REL-06:** comparativo orçamento versus realizado deve usar uma competência inequívoca; se o intervalo cruzar meses, usuário seleciona competência ou recebe agregação claramente identificada.
- **RN-REL-07:** a exportação deve corresponder aos dados visíveis.
- **RN-REL-08:** valores são exibidos em BRL e datas em `pt-BR`.

**Gaps críticos:** consultas/funções usam `user_id`, `valor_alocado` e mês como data, enquanto o schema define `usuario_id`, `valor_planejado`, `mes` inteiro e `ano` inteiro. O filtro de tipo não afeta os dados. PDF é oferecido na interface, mas não é gerado.

### 7.8 Configurações, dados e privacidade

#### Fluxo S1 — Atualizar perfil

- E-mail é exibido como somente leitura.
- Nome completo é salvo nos metadados de autenticação.
- Sistema exibe toast de sucesso ou erro.

#### Fluxo S2 — Preferências de notificação

Preferências propostas:

- resumo mensal por e-mail;
- alerta ao atingir 80% do orçamento.

**Alvo:** persistir preferências por usuário, com consentimento, data de atualização e opção de cancelamento. Atualmente os switches existem apenas no estado local.

#### Fluxo S3 — Exportar dados pessoais

1. Usuário solicita exportação.
2. Sistema consulta lançamentos, orçamentos, categorias e subcategorias próprias.
3. Gera JSON com e-mail, data da exportação e dados.
4. Inicia download local.

**Alvo:** incluir receita-base, preferências e metadados; informar falha parcial; versionar o formato.

#### Fluxo S4 — Excluir conta

**Alvo:**

1. Usuário solicita exclusão.
2. Sistema explica irreversibilidade e dados afetados.
3. Exige confirmação forte (senha recente ou link por e-mail).
4. Encerra sessões.
5. Exclui conta e dados associados conforme política de retenção.
6. Confirma conclusão sem expor dados.

Atualmente o botão está desabilitado.

#### Regras de privacidade

- **RN-PRI-01:** exportação contém apenas dados do usuário autenticado.
- **RN-PRI-02:** exclusão de usuário remove registros por cascata, ressalvadas retenções legais documentadas.
- **RN-PRI-03:** preferências de comunicação devem ser persistidas e respeitadas.
- **RN-PRI-04:** logs não devem conter senha, token ou conteúdo financeiro sensível desnecessário.
- **RN-PRI-05:** exportações são geradas sob demanda e não ficam publicamente acessíveis.

## 8. Modelo de dados conceitual

### 8.1 Entidades

| Entidade | Chave e unicidade | Campos centrais | Relacionamentos |
|---|---|---|---|
| Usuário | ID do provedor | e-mail, nome | Dono de todas as entidades |
| Categoria | UUID | nome, descrição, cor, ordem, ativo | 1:N subcategorias |
| Subcategoria | UUID | categoria, nome, descrição, ativo | N:1 categoria; 1:N lançamentos/orçamentos |
| Lançamento | UUID | tipo, origem, valor, descrição, tags, data, ativo | N:1 subcategoria opcional |
| Receita-base | UUID; único por usuário/mês/ano | receita_base, ativo | Contexto do orçamento mensal |
| Orçamento | UUID; único por usuário/subcategoria/mês/ano | planejado, gasto, ativo | N:1 subcategoria |
| Preferência (alvo) | único por usuário | e-mail, alertas, limiar | 1:1 usuário |

### 8.2 Integridade

- Toda entidade financeira contém `usuario_id` e deve corresponder ao usuário da sessão.
- A subcategoria e sua categoria devem ter o mesmo proprietário.
- Orçamento e subcategoria devem ter o mesmo proprietário.
- Datas de criação e atualização são mantidas pelo banco.
- Exclusão do usuário remove dependências.
- **Alvo:** constraints impedem valor zero/negativo, referências cruzadas entre usuários e duplicidade nominal.

### 8.3 Fonte de verdade

- Lançamentos são a fonte de verdade do realizado.
- Orçamentos guardam o planejado.
- `valor_gasto` é uma projeção/materialização e deve poder ser integralmente reconstruído dos lançamentos.
- Resumos e gráficos são derivados, nunca editados manualmente.

## 9. Estados e eventos críticos

### 9.1 Estados de uma entidade operacional

- **Ativa:** aparece e participa dos cálculos.
- **Inativa:** preservada para histórico, mas não aparece em operações novas.
- **Excluída:** removida fisicamente somente quando permitido pela política.

### 9.2 Eventos que recalculam orçamento

| Evento no lançamento | Efeito esperado |
|---|---|
| Inserir despesa categorizada | Somar no mês/ano/subcategoria |
| Inserir receita ou item sem categoria | Nenhum efeito no realizado por orçamento |
| Editar valor de despesa | Retirar valor anterior e somar novo |
| Trocar subcategoria | Transferir realizado entre orçamentos |
| Trocar data para outro mês | Transferir realizado entre competências |
| Trocar despesa por receita | Retirar impacto anterior |
| Trocar receita por despesa | Adicionar impacto novo |
| Excluir/inativar despesa | Retirar impacto anterior |
| Reativar despesa | Reaplicar impacto |

## 10. Segurança e autorização

- Supabase Auth gerencia identidade e sessão.
- Row Level Security deve estar ativa em categorias, subcategorias, lançamentos, orçamentos e receitas-base.
- Políticas de SELECT, INSERT, UPDATE e DELETE restringem `auth.uid() = usuario_id`.
- Funções `SECURITY DEFINER` devem validar `auth.uid()` e não confiar em um `user_id` arbitrário recebido por parâmetro.
- Middleware renova sessão e protege acesso.
- Aplicação deve usar variáveis públicas apenas para URL e chave anônima; segredos não vão ao cliente.
- Operações compostas, como duplicação e ajuste de realizado, devem ocorrer em transação no banco.

## 11. Requisitos não funcionais

### 11.1 Desempenho

- Páginas principais devem apresentar conteúdo útil em até 2,5 s no percentil 75 em conexão comum.
- Ações CRUD devem responder em até 1 s no percentil 95, desconsiderando indisponibilidade externa.
- Listas maiores que 100 registros devem usar paginação ou carregamento incremental.
- Consultas usam índices por usuário, data, subcategoria e competência.

### 11.2 Disponibilidade e resiliência

- Meta inicial de disponibilidade: 99,5% mensal.
- Falhas de consulta devem produzir estado de erro com tentativa novamente, não tela vazia.
- Requisições mutáveis devem impedir duplo envio.
- Funções idempotentes são exigidas para onboarding e operações repetíveis.

### 11.3 Acessibilidade

- Atender WCAG 2.1 AA.
- Navegação completa por teclado, foco visível e rótulos acessíveis.
- Cor não pode ser o único meio de indicar receita, despesa ou estouro.
- Gráficos precisam de legenda, alternativa textual e contraste suficiente.

### 11.4 Localização e precisão

- Idioma inicial: português do Brasil.
- Moeda inicial: BRL.
- Valores devem usar decimal exato no banco e arredondamento consistente em duas casas.
- Definir e documentar fuso da competência; padrão recomendado: fuso do usuário, com fallback da aplicação.

### 11.5 Observabilidade

- Registrar falhas por módulo e operação, com ID de correlação.
- Monitorar erros de autenticação, RPC, sincronização de orçamento e exportação.
- Não registrar payloads financeiros completos nem credenciais.
- Criar verificação periódica: `valor_gasto` materializado versus soma real de lançamentos.

### 11.6 Compatibilidade e responsividade

- Suportar versões atuais de Chrome, Edge, Firefox e Safari.
- Layout deve funcionar a partir de 360 px.
- Menu lateral deve se adaptar a dispositivos móveis.

## 12. Métricas de produto

### 12.1 Evento de ativação

Usuário ativado é aquele que, em até 24 horas do cadastro confirmado:

1. acessa o dashboard; e
2. cria ao menos um lançamento; e
3. visualiza o resumo atualizado.

### 12.2 KPIs

- Taxa de cadastro confirmado.
- Taxa de ativação em 24 horas.
- Tempo mediano até primeiro lançamento.
- Usuários ativos semanais e mensais.
- Lançamentos por usuário ativo/mês.
- Percentual de usuários com receita-base configurada.
- Percentual de usuários com ao menos uma alocação mensal.
- Retenção D7 e D30.
- Taxa de falha de CRUD, relatórios e exportações.
- Divergência entre gasto materializado e recalculado.

### 12.3 Eventos analíticos sugeridos

`sign_up_started`, `sign_up_completed`, `email_confirmed`, `login_completed`, `onboarding_completed`, `transaction_created`, `transaction_updated`, `transaction_deleted`, `category_created`, `base_income_saved`, `budget_saved`, `budget_exceeded`, `budget_duplicated`, `report_filtered`, `report_exported`, `data_exported`.

Eventos não devem incluir descrição, tags, valores exatos ou outros dados financeiros identificáveis; faixas agregadas podem ser usadas somente com justificativa e consentimento.

## 13. Critérios de aceite sistêmicos

### 13.1 Ciclo financeiro

- Dada uma despesa de R$ 100 em Alimentação no mês X, o total de despesas e o realizado dessa subcategoria aumentam exatamente R$ 100.
- Ao alterar para R$ 70, ambos refletem R$ 70, sem duplicação.
- Ao mover para Transporte, Alimentação perde R$ 70 e Transporte ganha R$ 70.
- Ao mudar para receita, o impacto orçamentário é removido e o total de receitas aumenta.
- Ao excluir/inativar, totais e orçamento deixam de considerar o lançamento.

### 13.2 Isolamento

- Usuário A não lê, altera nem exclui nenhum dado do usuário B, mesmo manipulando IDs ou chamadas diretas.
- Funções de relatório retornam dados apenas da sessão autorizada.

### 13.3 Planejamento

- Não é possível salvar alocação total maior que a receita-base.
- Gasto acima do planejado é permitido e destacado.
- Duplicar para competência ocupada não sobrescreve dados.
- Falha intermediária na duplicação não deixa dados parciais.

### 13.4 Relatórios

- Totais do dashboard, lançamentos e relatórios coincidem para o mesmo usuário e período.
- Intervalos incluem as datas inicial e final.
- CSV contém os mesmos filtros e resultados apresentados.
- Período vazio apresenta zeros/estado vazio, não erro.

## 14. Inventário de gaps e riscos atuais

### 14.1 Prioridade crítica (P0)

1. **Contrato de banco divergente nos relatórios:** `user_id`, `valor_alocado` e mês-data não existem no schema vigente (`usuario_id`, `valor_planejado`, mês/ano inteiros).
2. **Integridade do realizado:** scripts históricos possuem múltiplas versões do trigger; a versão efetiva precisa ser única e tratar ativo/inativo, INSERT, UPDATE e DELETE sem duplicação.
3. **Persistência do orçamento:** exclusão e reinserção pode apagar ou corromper `valor_gasto`; o realizado deve ser calculado no servidor.
4. **Autorização em RPCs:** parâmetros de usuário em funções privilegiadas podem permitir acesso indevido se não forem comparados com `auth.uid()`.

### 14.2 Prioridade alta (P1)

1. Preferências de notificação são apenas locais e nenhuma notificação é enviada.
2. Filtro de tipo de relatório não é aplicado.
3. Exportação PDF não está implementada.
4. Exportação de backup ordena por `data_lancamento`, mas a coluna é `data`.
5. Exclusão de subcategoria pode conflitar com lançamentos ou apagar orçamentos por cascata.
6. Cadastro tenta criar categorias antes de uma sessão confirmada; é necessário retry no primeiro login.
7. Comparativos do dashboard são textos fixos.

### 14.3 Prioridade média (P2)

1. Controles de período/filtros do dashboard não executam ações.
2. Adicionar subcategoria a partir de uma categoria não pré-seleciona a categoria recebida.
3. Erros de exclusão de categoria ficam apenas no console.
4. Ausência de recuperação de senha.
5. Ausência de paginação em lançamentos.
6. Tour de boas-vindas não tem estado persistido claramente integrado.
7. Diversos textos no código apresentam sinais de encoding incorreto.

## 15. Roadmap recomendado

### Fase 0 — Confiabilidade e contrato único

- Consolidar migrations em uma fonte de verdade.
- Corrigir nomes de colunas/RPCs e gerar tipos do Supabase.
- Reescrever atualização do realizado como função transacional e reconstruível.
- Testar RLS e RPCs contra acesso cruzado.
- Corrigir exportações e encoding.

**Saída:** todos os totais coincidem e não há vazamento entre usuários.

### Fase 1 — Completar o núcleo do produto

- Recuperação de senha e reenvio de confirmação.
- Persistência do onboarding.
- Filtros reais no dashboard.
- Relatórios coerentes e CSV completo.
- Estados de erro/vazio e paginação.
- Estratégia segura de inativação/exclusão de categorias.

**Saída:** jornada principal completa e previsível.

### Fase 2 — Engajamento e privacidade

- Persistir preferências.
- Implementar alertas de 80% e resumo mensal.
- Exportação completa e exclusão segura de conta.
- Instrumentação de métricas sem dados financeiros sensíveis.

**Saída:** recorrência mensal e controles de privacidade operacionais.

### Fase 3 — Evolução

- Lançamentos recorrentes.
- Importação CSV e conciliação assistida.
- Metas financeiras e contas/carteiras.
- Personalização de moeda/fuso.
- Compartilhamento familiar, caso validado por pesquisa.

## 16. Dependências

- Supabase Auth, Postgres, RLS e RPCs.
- Next.js 14 e React 18.
- Vercel para hospedagem e analytics.
- Recharts para gráficos.
- Serviço de e-mail do provedor de autenticação; serviço transacional adicional será necessário para alertas e resumos.

## 17. Decisões em aberto

Estas decisões exigem validação de produto antes da implementação definitiva:

1. Exclusão de lançamentos será física ou lógica?
2. Categorias padrão podem ser removidas ou somente inativadas?
3. Despesas sem orçamento devem criar automaticamente uma linha de orçamento com planejado zero?
4. Receita-base representa renda esperada, renda confirmada ou limite total disponível?
5. Orçamento versus realizado em relatórios multi-mês será agregado ou restrito a uma competência?
6. Qual é o fuso oficial do cálculo mensal?
7. Alertas de orçamento serão enviados uma vez por limiar, por dia ou a cada nova despesa?
8. O produto continuará exclusivamente em BRL e `pt-BR` no horizonte próximo?

## 18. Definição de pronto

Uma funcionalidade é considerada pronta quando:

- regras e critérios de aceite correspondentes estão testados;
- estados de carregamento, vazio, sucesso e erro estão cobertos;
- RLS/autorização foram verificadas;
- cálculos financeiros possuem testes de limite e regressão;
- interface é responsiva e acessível;
- eventos analíticos não carregam dados financeiros sensíveis;
- documentação e tipos refletem o contrato de banco efetivo;
- não há divergência entre dashboard, lista, orçamento e relatório para o mesmo conjunto de dados.

---

## Anexo A — Matriz resumida de regras

| Domínio | Entrada | Validação principal | Resultado derivado |
|---|---|---|---|
| Cadastro | e-mail e senha | e-mail válido, senha ≥ 6, confirmação igual | usuário e taxonomia inicial |
| Categoria | nome, cor, ordem | nome não vazio; cor válida; ordem positiva | agrupamento visual |
| Subcategoria | categoria e nome | mesma titularidade; nome não vazio | classificação operacional |
| Lançamento | tipo, origem, valor, data, descrição | enums válidos; valor > 0; data/descrição obrigatórias | totais e realizado |
| Receita-base | mês, ano, valor | competência válida; valor ≥ 0; unicidade | teto de planejamento |
| Orçamento | subcategoria e planejado | unicidade; total ≤ receita-base | saldo e percentual |
| Relatório | período e tipo | início ≤ fim; limites inclusivos | totais, tendências e comparativos |

## Anexo B — Glossário

- **Competência:** mês e ano aos quais um orçamento ou lançamento pertence.
- **Receita-base:** montante usado como referência para distribuir o orçamento.
- **Planejado:** valor que o usuário pretende gastar em uma subcategoria.
- **Realizado/gasto:** soma das despesas efetivamente registradas.
- **Saldo financeiro:** receitas menos despesas.
- **Saldo do orçamento:** planejado menos realizado.
- **Origem fixa:** ocorrência entendida como recorrente ou previsível.
- **Origem extra:** ocorrência eventual ou fora da base recorrente.
- **RLS:** política do banco que restringe cada linha ao proprietário autenticado.
