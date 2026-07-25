# Task 07 - Orcamentos

## Objetivo

Implementar planejamento mensal por receita-base e alocacoes por subcategoria, sem permitir corrupcao do realizado.

## Escopo

- Competencia mes/ano.
- Receita-base.
- Alocacoes por valor e percentual.
- Duplicacao.
- Exportacao CSV de orcamento.

## Passos

1. Criar tela `/orcamentos`.
2. Selecionar competencia:
   - mes 1 a 12.
   - ano atual -2 ate atual +2.
3. Receita-base:
   - criar ou atualizar por competencia.
   - valor >= 0.
   - bloquear reducao abaixo do total planejado ou exigir fluxo explicito.
4. Alocacoes:
   - listar subcategorias ativas agrupadas por categoria.
   - permitir editar valor.
   - permitir editar percentual.
   - recalcular restante.
   - bloquear total planejado > receita-base.
5. Salvar:
   - chamar RPC transacional.
   - enviar apenas planejado, nunca realizado.
6. Duplicar:
   - escolher competencia destino.
   - bloquear destino ocupado.
   - chamar RPC transacional.
7. Exportar CSV:
   - categoria.
   - subcategoria.
   - planejado.
   - gasto.
   - percentual utilizado.
   - saldo.

## Criterios de aceite

- Total planejado nao excede receita-base.
- Gasto pode exceder planejado e mostra saldo negativo.
- Salvar alocacoes nao perde realizado existente.
- Duplicacao nao sobrescreve competencia ocupada.
- Falha na duplicacao nao deixa dados parciais.
