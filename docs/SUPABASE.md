# Finnext - Supabase

Este documento registra a configuracao operacional do Supabase para o Finnext.

## Projeto de desenvolvimento

1. Crie um projeto no Supabase para desenvolvimento.
2. Copie a Project URL para `NEXT_PUBLIC_SUPABASE_URL`.
3. Copie a anon public key para `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Use a service role key apenas em ambiente server quando uma task futura exigir.

## Auth

Em Authentication > Providers:

- Habilite Email.
- Habilite email/password.
- Defina se confirmacao de email sera obrigatoria. O PRD permite seguir a configuracao do provedor, mas recomenda bloquear acesso quando confirmacao estiver obrigatoria.

Em Authentication > URL Configuration, configure:

- Site URL local: `http://localhost:3000`
- Redirect URL local: `http://localhost:3000/auth/callback`
- Redirect URL de reset: `http://localhost:3000/auth/update-password`
- URLs equivalentes de Preview e Production da Vercel quando existirem.

## Migration inicial

A migration base esta em:

```text
supabase/migrations/20260725170500_schema_base.sql
```

Ela cria:

- `categorias`
- `subcategorias`
- `lancamentos`
- `receitas_base`
- `orcamentos`
- `preferencias_usuario`

Tambem cria constraints, unicidades case-insensitive, indices, triggers de `atualizado_em` e validacoes para impedir referencias cruzadas entre usuarios.

## Contrato de nomes

Use somente os nomes do PRD:

- `usuario_id`
- `valor_planejado`
- `mes`
- `ano`
- `data`

Nao usar em codigo novo:

- `user_id`
- `valor_alocado`
- `data_lancamento`

## RLS, RPCs e triggers

A migration da Task 02 esta em:

```text
supabase/migrations/20260725173000_rls_rpcs_triggers.sql
```

Ela adiciona:

- RLS em todas as tabelas privadas.
- Policies CRUD por usuario.
- RPCs de onboarding, orcamento, duplicacao e relatorios.
- Trigger transacional unico para atualizar `valor_gasto`.

As RPCs publicas para o app sao:

- `criar_categorias_padrao()`
- `salvar_orcamento_mensal(p_mes, p_ano, p_receita_base, p_alocacoes)`
- `duplicar_orcamento_mensal(p_mes_origem, p_ano_origem, p_mes_destino, p_ano_destino)`
- `recalcular_valor_gasto(p_mes, p_ano)`
- `relatorio_resumo(p_data_inicio, p_data_fim)`
- `relatorio_despesas_por_categoria(p_data_inicio, p_data_fim)`
- `relatorio_orcamento_realizado(p_mes, p_ano)`

## Tipos TypeScript

O baseline versionado esta em:

```text
src/types/database.types.ts
```

Quando o projeto Supabase estiver conectado, regenere os tipos oficiais com o Supabase CLI:

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/types/database.types.ts
```

Para ambiente local com Supabase CLI:

```bash
supabase gen types typescript --local --schema public > src/types/database.types.ts
```

Depois de regenerar, rode:

```bash
npm run typecheck
```
