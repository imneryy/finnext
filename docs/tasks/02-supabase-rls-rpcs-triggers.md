# Task 02 - Supabase: RLS, Policies, RPCs e Triggers

## Objetivo

Garantir isolamento entre usuarios e integridade financeira no banco, especialmente calculo de realizado, onboarding idempotente e operacoes transacionais.

## Escopo

- Ativar RLS em todas as tabelas privadas.
- Criar policies CRUD por `auth.uid() = usuario_id`.
- Criar funcoes seguras para onboarding, orcamento e relatorios.
- Criar trigger unico para sincronizacao de `valor_gasto`.
- Criar funcoes de verificacao/reconstrucao do realizado.

## Passos

1. Ativar RLS em:
   - `categorias`
   - `subcategorias`
   - `lancamentos`
   - `receitas_base`
   - `orcamentos`
   - `preferencias_usuario`
2. Criar policies:
   - SELECT: usuario autenticado le apenas proprios dados.
   - INSERT: `with check (auth.uid() = usuario_id)`.
   - UPDATE: `using` e `with check` com mesmo usuario.
   - DELETE: permitido apenas onde a politica de produto aceitar exclusao fisica.
3. Criar RPC `criar_categorias_padrao()`:
   - Sem parametro de usuario.
   - Usa `auth.uid()`.
   - Idempotente.
   - Insere categorias e subcategorias padrao apenas se usuario nao tiver taxonomia.
4. Criar RPC para salvar orcamento mensal:
   - Recebe mes, ano, receita-base e alocacoes.
   - Valida soma planejada <= receita-base.
   - Faz upsert de `valor_planejado`.
   - Nao aceita `valor_gasto` vindo do cliente.
   - Executa em transacao.
5. Criar RPC para duplicar orcamento:
   - Bloqueia destino ocupado.
   - Copia receita-base e planejado.
   - Recalcula realizado no destino.
   - Executa de forma atomica.
6. Criar trigger unico de lancamentos:
   - INSERT despesa ativa categorizada: soma realizado.
   - UPDATE: remove impacto anterior e aplica novo.
   - DELETE ou inativacao: remove impacto anterior.
   - Receita ou lancamento sem subcategoria nao afeta orcamento.
7. Criar RPC `recalcular_valor_gasto(mes, ano)`:
   - Reconstroi realizado com base nos lancamentos ativos.
   - Serve para manutencao, teste e correcao.
8. Criar funcoes de relatorio usando `auth.uid()`, nunca `user_id` recebido do cliente.

## Criterios de aceite

- Usuario A nao acessa dados do usuario B via query direta.
- RPCs privilegiadas validam `auth.uid()`.
- Editar valor, tipo, data ou subcategoria transfere realizado corretamente.
- Excluir/inativar lancamento nao deixa realizado negativo.
- Recalculo do realizado bate com valores materializados.

## Testes minimos

- Criar dois usuarios e tentar cruzar IDs.
- Inserir despesa, editar valor, mover subcategoria, trocar para receita e inativar.
- Duplicar orcamento para competencia vazia e para competencia ocupada.
