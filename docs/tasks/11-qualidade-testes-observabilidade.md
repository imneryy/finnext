# Task 11 - Qualidade, Testes e Observabilidade

## Objetivo

Garantir confianca nos calculos, isolamento de dados, acessibilidade, responsividade e capacidade de diagnostico.

## Escopo

- Testes unitarios.
- Testes de integracao Supabase.
- Testes E2E.
- Acessibilidade.
- Observabilidade.

## Passos

1. Testes de validacao:
   - schemas Zod.
   - formatacao BRL e datas.
2. Testes financeiros:
   - inserir despesa.
   - editar valor.
   - mover subcategoria.
   - mover competencia.
   - trocar despesa para receita.
   - inativar.
3. Testes de RLS:
   - usuario A nao le B.
   - usuario A nao altera B.
   - RPC nao aceita usuario arbitrario.
4. Testes E2E:
   - cadastro/login.
   - primeira categoria.
   - primeiro lancamento.
   - receita-base e orcamento.
   - dashboard atualizado.
   - relatorio/exportacao.
5. Acessibilidade:
   - foco visivel.
   - labels.
   - contraste.
   - navegacao por teclado.
6. Observabilidade:
   - IDs de correlacao em erros server.
   - monitorar falhas de Auth, RPC, relatorios e exportacao.
   - checagem periodica: materializado vs recalculado.

## Criterios de aceite

- Suite minima roda em CI.
- RLS tem testes automatizados ou script verificavel.
- Nenhum teste usa dados reais de usuario.
- Erros sensiveis sao sanitizados.
