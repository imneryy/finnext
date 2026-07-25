# Task 12 - Vercel: Deploy, Ambientes e Operacao

## Objetivo

Publicar Finnext na Vercel com ambientes separados, variaveis corretas, previews seguros e checklist de producao.

## Escopo

- Projeto Vercel.
- Variaveis por ambiente.
- Redirect URLs no Supabase.
- Deploy preview e producao.
- Operacao inicial.

## Passos

1. Criar projeto na Vercel conectado ao repositorio.
2. Configurar build:
   - framework Next.js.
   - comando de build padrao.
   - Node version compativel.
3. Configurar variaveis:
   - Production:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - segredos server se existirem.
   - Preview:
     - preferencialmente Supabase separado ou banco de staging.
   - Development:
     - local via `.env.local`.
4. Configurar Supabase Auth URLs:
   - `http://localhost:3000`
   - URL de preview, se aplicavel.
   - dominio de producao.
   - callback de redefinicao de senha.
5. Rodar deploy preview.
6. Validar checklist:
   - login.
   - cadastro.
   - rotas privadas.
   - CRUD principal.
   - RLS.
   - exportacao.
7. Promover para producao.
8. Ativar monitoramento:
   - logs Vercel.
   - erros de runtime.
   - analytics se aprovado.

## Criterios de aceite

- Preview funcional antes de producao.
- Variaveis publicas nao contem segredos.
- Redirects de Auth funcionam em local, preview e producao.
- Build de producao passa sem warnings criticos.
- Dominio final acessa o app e protege rotas privadas.
