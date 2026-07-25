# Task 01 - Supabase: Projeto, Ambientes e Schema Base

## Objetivo

Criar o projeto Supabase e consolidar um schema unico, alinhado ao PRD, para categorias, subcategorias, lancamentos, receita-base, orcamentos e preferencias.

## Escopo

- Criar projeto Supabase.
- Configurar Auth.
- Criar migrations versionadas.
- Criar tabelas, constraints, indices e enums/checks.
- Gerar tipos TypeScript do banco.

## Passos no Supabase

1. Criar projeto Supabase para desenvolvimento.
2. Configurar Auth:
   - Email/password habilitado.
   - Confirmacao de email conforme decisao de produto.
   - Redirect URLs locais e da Vercel.
3. Criar migration inicial em `supabase/migrations`.
4. Criar tabelas:
   - `categorias`
   - `subcategorias`
   - `lancamentos`
   - `receitas_base`
   - `orcamentos`
   - `preferencias_usuario`
5. Padronizar colunas de propriedade:
   - `usuario_id uuid not null references auth.users(id) on delete cascade`
6. Padronizar auditoria:
   - `criado_em timestamptz not null default now()`
   - `atualizado_em timestamptz not null default now()`
7. Usar campos do PRD:
   - `valor_planejado`, nao `valor_alocado`.
   - `mes int`, `ano int`, nao mes como data.
   - `data date`, nao `data_lancamento`.
8. Criar constraints:
   - valor de lancamento `> 0`
   - valores de orcamento `>= 0`
   - mes entre 1 e 12
   - ano >= 2020
   - categoria cor hex valida
   - tipo em `receita/despesa`
   - origem em `fixa/extra`
9. Criar unicidades:
   - categoria unica por usuario, case-insensitive.
   - subcategoria unica por categoria, case-insensitive.
   - receita-base unica por usuario/mes/ano.
   - orcamento unico por usuario/subcategoria/mes/ano.
10. Criar indices por:
   - `usuario_id`
   - `data`
   - `subcategoria_id`
   - `mes, ano`
   - `ativo`

## Criterios de aceite

- Migrations rodam em um banco limpo.
- Nomes de colunas batem com o PRD.
- Tipos do Supabase sao gerados e versionados.
- Nao existem nomes antigos como `user_id`, `valor_alocado` ou `data_lancamento` em queries novas.

## Direcionamento para o script SQL

O script desta task deve ser idempotente no nivel de migration: nao depender de dados manuais no painel. Caso precise alterar schema depois, criar nova migration em vez de editar migration ja aplicada.
