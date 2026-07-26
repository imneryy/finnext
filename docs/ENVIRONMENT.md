# Finnext - Ambientes e Variaveis

Este projeto usa Next.js, Supabase e Vercel. As variaveis devem ser configuradas por ambiente e nunca devem expor segredos no cliente.

## Local

Crie um arquivo `.env.local` na raiz do projeto com base em `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Use:

```bash
npm run dev
```

## Preview

Na Vercel, configure as variaveis no ambiente de Preview. O ideal e usar um projeto Supabase separado para staging ou, no minimo, um banco sem dados reais de usuarios.

Variaveis necessarias:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, apenas se alguma rotina server-side realmente precisar de operacoes administrativas.

Configure tambem as Redirect URLs no Supabase Auth para as URLs de preview da Vercel.

## Producao

Na Vercel, configure as variaveis de Production apontando para o projeto Supabase de producao.

Somente estas variaveis podem ser publicas no frontend:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Qualquer segredo deve ficar sem o prefixo `NEXT_PUBLIC_` e ser usado apenas em server actions, route handlers ou jobs server-side.

## Regras de seguranca

- Nunca commitar `.env.local`.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` em componente client.
- Preferir RLS e RPCs seguras a operacoes administrativas.
- A identidade do usuario deve vir da sessao Supabase, nao de parametros enviados pelo cliente.
