# Task 06 - Lancamentos

## Objetivo

Implementar gestao de receitas e despesas com filtros, tags, validacao forte e sincronizacao correta com orcamentos.

## Escopo

- Criar, editar, listar, filtrar e inativar/excluir lancamentos.
- Integracao com subcategorias.
- Tags unicas por lancamento.
- Paginacao ou carregamento incremental.

## Passos

1. Criar tela `/lancamentos`.
2. Listar lancamentos:
   - data desc.
   - criado_em desc em empate.
   - filtros combinados por AND.
3. Implementar filtros:
   - texto em descricao/tags.
   - tipo.
   - origem.
   - subcategoria.
   - data inicial inclusiva.
   - data final inclusiva.
4. Criar formulario:
   - tipo padrao `despesa`.
   - origem padrao `extra`.
   - data padrao hoje.
   - valor > 0.
   - descricao obrigatoria.
   - subcategoria opcional.
   - tags sem vazios e sem duplicadas.
5. Implementar edicao:
   - carregar dados atuais.
   - salvar alteracoes.
   - confiar no banco para transferir impacto orcamentario.
6. Implementar exclusao logica preferencial:
   - `ativo=false`.
   - confirmar com descricao e valor.
7. Atualizar estados:
   - loading.
   - vazio.
   - erro.
   - sucesso.

## Criterios de aceite

- Receita nao aumenta realizado do orcamento.
- Despesa categorizada atualiza realizado do mes/ano correto.
- Editar valor, data, tipo ou subcategoria transfere impacto sem duplicar.
- Lancamentos inativos nao entram em totais.
- Lista suporta mais de 100 registros sem degradar a tela.
