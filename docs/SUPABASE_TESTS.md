# Finnext - Checklist de Testes Supabase

Use este checklist apos aplicar as migrations das Tasks 01 e 02.

## RLS

1. Crie dois usuarios de teste pelo Supabase Auth.
2. Autentique como Usuario A no app ou em uma ferramenta com JWT do Usuario A.
3. Crie uma categoria para o Usuario A.
4. Tente consultar, alterar ou excluir uma linha do Usuario B usando o ID diretamente.
5. Resultado esperado: Usuario A nao le nem altera dados do Usuario B.

## Onboarding

1. Autenticado como um usuario sem categorias, execute:

```sql
select public.criar_categorias_padrao();
```

2. Execute novamente.
3. Resultado esperado: categorias e subcategorias padrao existem uma unica vez.

## Orcamento e realizado

1. Crie receita-base e alocacoes com:

```sql
select public.salvar_orcamento_mensal(
  7,
  2026,
  5000,
  '[{"subcategoria_id":"COLE_UUID_DA_SUBCATEGORIA","valor_planejado":1000}]'::jsonb
);
```

2. Insira uma despesa ativa nessa subcategoria e competencia.
3. Resultado esperado: `orcamentos.valor_gasto` aumenta exatamente o valor da despesa.
4. Edite o valor da despesa.
5. Resultado esperado: `valor_gasto` reflete o novo valor, sem duplicacao.
6. Troque a despesa para receita.
7. Resultado esperado: impacto do orcamento e removido.
8. Troque de volta para despesa e depois inative.
9. Resultado esperado: lancamento inativo nao entra no realizado.

## Recalculo

Execute:

```sql
select public.recalcular_valor_gasto(7, 2026);
```

Resultado esperado: `valor_gasto` bate com a soma de despesas ativas por subcategoria.

## Duplicacao

1. Duplique para competencia vazia:

```sql
select public.duplicar_orcamento_mensal(7, 2026, 8, 2026);
```

2. Tente duplicar novamente para a mesma competencia.
3. Resultado esperado: a primeira chamada copia o planejamento; a segunda falha sem sobrescrever dados.
