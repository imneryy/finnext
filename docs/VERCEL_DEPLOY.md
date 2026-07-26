# Vercel: Deploy, Ambientes e Operacao

## Estado Preparado no Repositorio

- App Next.js com App Router.
- Build validado com `npm.cmd run build`.
- Variaveis documentadas em `.env.example`.
- `.env.local` protegido pelo `.gitignore`.
- Supabase SSR configurado.
- Migrations versionadas em `supabase/migrations`.

## Variaveis na Vercel

Configure em **Project Settings > Environment Variables**.

### Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Preview

Idealmente use um projeto Supabase separado para staging/preview.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Development

Localmente use `.env.local`.

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` em variavel `NEXT_PUBLIC_*`.

## Configuracao do Projeto na Vercel

- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: deixar padrao
- Node.js: 20.x ou superior

## Supabase Auth URLs

No Supabase, configure em **Authentication > URL Configuration**.

### Site URL

Use a URL principal de producao:

```txt
https://SEU-DOMINIO.vercel.app
```

### Redirect URLs

Inclua:

```txt
http://localhost:3000/**
http://localhost:3001/**
https://SEU-DOMINIO.vercel.app/**
https://*.vercel.app/**
```

Se usar dominio customizado:

```txt
https://SEU-DOMINIO.com/**
```

## Migrations Supabase

Antes do deploy final, rode todas as migrations, especialmente:

```txt
supabase/migrations/20260726093000_allow_zero_budget_allocations.sql
```

Essa migration e necessaria para o orcamento salvar categorias selecionadas mesmo quando os valores planejados ainda estiverem zerados.

## Checklist de Preview

- Cadastro cria conta.
- Confirmacao de email redireciona corretamente.
- Login abre Dashboard.
- Rotas privadas redirecionam usuario anonimo.
- Categorias CRUD funciona.
- Lancamentos CRUD funciona.
- Orcamentos salvam categorias com valores zerados.
- Duplicar orcamento bloqueia competencia ocupada.
- Dashboard mostra valores reais.
- Relatorios exportam CSV.
- Configuracoes exporta JSON apenas do usuario autenticado.
- Usuario A nao ve dados do usuario B.

## Promocao para Producao

Somente promova depois que o preview passar no checklist.

Na Vercel:

1. Abra o deployment de preview.
2. Valide o checklist.
3. Promova para producao ou faça merge na branch principal.
4. Revise logs de runtime depois do primeiro acesso real.

## Operacao Inicial

- Monitorar logs em **Vercel > Project > Logs**.
- Monitorar Auth e API em **Supabase > Logs**.
- Manter migrations novas versionadas.
- Nao editar migration ja aplicada; criar sempre uma migration nova.
- Separar Supabase de preview/staging antes de testes destrutivos.

