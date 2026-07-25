# Task 03 - Next.js: Estrutura, UI Base e Clientes Supabase

## Objetivo

Criar a fundacao frontend/server do Finnext com rotas, layout autenticado, cliente Supabase SSR e padroes de validacao.

## Escopo

- App Router.
- Middleware de sessao.
- Clientes Supabase para browser e server.
- Layout publico e privado.
- Componentes base.
- Helpers de moeda, data e erro.

## Passos

1. Criar clientes Supabase:
   - `lib/supabase/client.ts`
   - `lib/supabase/server.ts`
   - `middleware.ts` para renovar sessao.
2. Criar grupos de rotas:
   - publico: `/auth/login`, `/auth/sign-up`, `/auth/sign-up-success`, `/auth/error`
   - privado: `/dashboard`, `/lancamentos`, `/categorias`, `/orcamentos`, `/relatorios`, `/configuracoes`
3. Proteger rotas privadas:
   - sem sessao redireciona para login.
   - preservar `redirectTo` para voltar a URL solicitada.
4. Criar layout autenticado:
   - sidebar responsiva.
   - menu mobile.
   - acao de logout.
5. Criar componentes base:
   - button, input, select, dialog, toast, table, empty state, error state, loading state.
6. Criar helpers:
   - formatacao BRL.
   - formatacao `pt-BR`.
   - parse seguro de datas.
   - mensagens de erro amigaveis.
7. Criar validacoes com Zod por dominio.

## Criterios de aceite

- Rotas privadas nao renderizam dados sem sessao.
- Logout encerra sessao e redireciona ao login.
- App compila com TypeScript estrito.
- Layout funciona em 360 px e desktop.

## Direcionamento de design

Finnext deve parecer uma ferramenta operacional de financas pessoais: clara, densa o suficiente para uso recorrente, sem cara de landing page. Priorizar leitura de valores, filtros rapidos e acoes obvias.
