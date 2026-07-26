# Finnext

Sistema de financas pessoais construido com Next.js, Supabase e Vercel.

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth/Postgres/RLS/RPC
- Vercel
- Recharts
- Zod

## Desenvolvimento

```txt
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis

Copie `.env.example` para `.env.local` e preencha as chaves do Supabase.

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Nao versionar `.env.local`.

## Scripts

```txt
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Supabase

As migrations ficam em `supabase/migrations`.

Leia:

- `docs/SUPABASE.md`
- `docs/SUPABASE_TESTS.md`

## Deploy

Leia `docs/VERCEL_DEPLOY.md`.
