# Task 00 - Setup do Projeto

## Objetivo

Criar a base tecnica do Finnext antes das funcionalidades: app Next.js, convencoes, scripts, variaveis de ambiente e estrutura inicial de pastas.

## Escopo

- Inicializar projeto Next.js com TypeScript.
- Configurar lint, formatacao e scripts.
- Definir estrutura de `app/`, `components/`, `lib/`, `features/`, `types/` e `supabase/`.
- Criar arquivos `.env.example` e documentacao local.
- Preparar projeto para Supabase e Vercel.

## Passos

1. Criar app Next.js usando App Router, TypeScript e React.
2. Instalar dependencias previstas:
   - `@supabase/ssr`
   - `@supabase/supabase-js`
   - `zod`
   - `react-hook-form`
   - `lucide-react`
   - `recharts`
   - utilitarios de UI conforme stack escolhida.
3. Configurar scripts:
   - `dev`
   - `build`
   - `lint`
   - `typecheck`
   - `test`
4. Criar `.env.example` com:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` somente para contexto server/admin quando necessario.
5. Criar `docs/ENVIRONMENT.md` explicando variaveis locais, preview e producao.

## Criterios de aceite

- `npm run dev` abre a aplicacao local.
- `npm run build` executa sem erro.
- `.env.local` nao e versionado.
- `.env.example` contem apenas nomes e placeholders, sem segredos.

## Observacoes de seguranca

- Nunca usar service role key em componente client.
- Qualquer operacao administrativa deve ficar em ambiente server e ser evitada quando RLS/RPC resolver.
