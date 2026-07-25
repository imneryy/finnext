# Task 09 - Relatorios e Exportacoes

## Objetivo

Implementar relatorios financeiros coerentes com filtros, formulas do PRD e exportacao CSV fiel aos dados exibidos.

## Escopo

- Periodo customizado.
- Tipos de relatorio.
- Resumo, categorias, tendencia e orcamento versus realizado.
- CSV.
- PDF apenas quando for implementado de verdade.

## Passos

1. Criar tela `/relatorios`.
2. Periodo padrao:
   - primeiro dia do mes atual ate hoje.
3. Validar data inicial <= data final.
4. Implementar filtro de tipo controlando consultas e secoes.
5. Consultar/calcular:
   - receitas.
   - despesas.
   - saldo liquido.
   - uso de orcamento.
   - variacao contra periodo anterior equivalente.
   - despesas por categoria.
   - evolucao mensal dos ultimos seis meses.
   - orcamento versus realizado da competencia.
6. Tratar gastos sem categoria como `Nao categorizado`.
7. Exportar CSV:
   - corresponder aos dados visiveis.
   - incluir periodo, geracao, moeda e cabecalhos pt-BR.
8. Remover ou desabilitar botao PDF ate existir geracao real.

## Criterios de aceite

- Filtro de tipo altera dados de verdade.
- Intervalos incluem data inicial e final.
- Periodo anterior zero mostra `sem base de comparacao`.
- Consultas usam `usuario_id`, `valor_planejado`, `mes` e `ano`.
- CSV bate com a tela.
