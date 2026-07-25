# Task 05 - Categorias e Subcategorias

## Objetivo

Implementar CRUD seguro de categorias e subcategorias, preservando historico financeiro e evitando duplicidade.

## Escopo

- Listagem agrupada.
- Criacao, edicao e inativacao/exclusao.
- Validacoes do PRD.
- Seletores operacionais apenas com itens ativos.

## Passos

1. Criar tela `/categorias`:
   - categorias ordenadas por `ordem`, depois nome.
   - subcategorias em ordem alfabetica.
2. Criar formulario de categoria:
   - nome obrigatorio.
   - descricao opcional.
   - cor hex valida.
   - ordem obrigatoria ou automatica.
3. Criar formulario de subcategoria:
   - categoria obrigatoria.
   - nome obrigatorio.
   - descricao opcional.
   - ao adicionar de dentro de categoria, pre-selecionar categoria.
4. Implementar edicao.
5. Implementar exclusao segura:
   - categoria com subcategorias nao pode ser excluida.
   - subcategoria com lancamentos/orcamentos deve ser inativada ou bloqueada.
   - nao apagar historico financeiro por cascata operacional.
6. Melhorar erros:
   - conflito de nome.
   - erro de constraint.
   - erro de permissao.

## Criterios de aceite

- Nomes duplicados por usuario sao bloqueados.
- Subcategoria duplicada na mesma categoria e bloqueada.
- Selects operacionais exibem apenas ativos.
- Erros aparecem na UI, nao apenas no console.
