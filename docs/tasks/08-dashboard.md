# Task 08 - Dashboard

## Objetivo

Criar visao mensal consolidada com totais confiaveis, ultimos lancamentos, orcamentos prioritarios e filtros funcionais.

## Escopo

- Indicadores do mes.
- Comparativos contra periodo anterior.
- Ultimos lancamentos.
- Resumo de orcamento.
- Acoes rapidas.

## Passos

1. Criar tela `/dashboard`.
2. Consultar mes civil atual por padrao.
3. Calcular:
   - total de receitas ativas.
   - total de despesas ativas.
   - saldo.
   - total planejado.
   - percentual gasto.
4. Calcular comparativos contra periodo anterior equivalente.
5. Exibir cinco lancamentos mais recentemente criados.
6. Exibir ate seis orcamentos planejados, priorizados por maior gasto.
7. Implementar acoes rapidas:
   - novo lancamento.
   - orcamento.
   - relatorios.
8. Implementar filtros/periodo apenas quando funcionais.

## Criterios de aceite

- Numeros batem com lancamentos, orcamentos e relatorios no mesmo periodo.
- Percentual gasto evita divisao por zero.
- Estados visuais: normal, atencao acima de 80%, excedido acima de 100%.
- Nenhum texto percentual fica fixo/mockado.
