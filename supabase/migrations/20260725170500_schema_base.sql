-- Finnext schema base
-- Task 01: Supabase project, environments and base data model.

create extension if not exists pgcrypto;

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  cor text not null default '#64748b',
  ordem integer not null default 1,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint categorias_nome_nao_vazio check (length(btrim(nome)) > 0),
  constraint categorias_cor_hex_valida check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categorias_ordem_positiva check (ordem >= 1)
);

create table public.subcategorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint subcategorias_nome_nao_vazio check (length(btrim(nome)) > 0)
);

create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  subcategoria_id uuid references public.subcategorias(id) on delete restrict,
  tipo text not null,
  origem text not null,
  valor numeric(14, 2) not null,
  data date not null,
  descricao text not null,
  tags text[] not null default '{}',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint lancamentos_tipo_valido check (tipo in ('receita', 'despesa')),
  constraint lancamentos_origem_valida check (origem in ('fixa', 'extra')),
  constraint lancamentos_valor_positivo check (valor > 0),
  constraint lancamentos_descricao_nao_vazia check (length(btrim(descricao)) > 0)
);

create table public.receitas_base (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  mes integer not null,
  ano integer not null,
  receita_base numeric(14, 2) not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint receitas_base_mes_valido check (mes between 1 and 12),
  constraint receitas_base_ano_valido check (ano >= 2020),
  constraint receitas_base_valor_nao_negativo check (receita_base >= 0),
  constraint receitas_base_usuario_competencia_unica unique (usuario_id, mes, ano)
);

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  subcategoria_id uuid not null references public.subcategorias(id) on delete restrict,
  mes integer not null,
  ano integer not null,
  valor_planejado numeric(14, 2) not null default 0,
  valor_gasto numeric(14, 2) not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint orcamentos_mes_valido check (mes between 1 and 12),
  constraint orcamentos_ano_valido check (ano >= 2020),
  constraint orcamentos_valor_planejado_nao_negativo check (valor_planejado >= 0),
  constraint orcamentos_valor_gasto_nao_negativo check (valor_gasto >= 0),
  constraint orcamentos_usuario_subcategoria_competencia_unica unique (
    usuario_id,
    subcategoria_id,
    mes,
    ano
  )
);

create table public.preferencias_usuario (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text,
  onboarding_concluido boolean not null default false,
  resumo_mensal_email boolean not null default false,
  alerta_orcamento_email boolean not null default false,
  alerta_orcamento_percentual integer not null default 80,
  atualizado_em timestamptz not null default now(),
  criado_em timestamptz not null default now(),

  constraint preferencias_alerta_percentual_valido check (
    alerta_orcamento_percentual between 1 and 100
  )
);

create unique index categorias_usuario_nome_unico_idx
  on public.categorias (usuario_id, lower(btrim(nome)));

create unique index subcategorias_categoria_nome_unico_idx
  on public.subcategorias (categoria_id, lower(btrim(nome)));

create index categorias_usuario_idx on public.categorias (usuario_id);
create index categorias_usuario_ativo_idx on public.categorias (usuario_id, ativo);
create index categorias_usuario_ordem_nome_idx on public.categorias (usuario_id, ordem, nome);

create index subcategorias_usuario_idx on public.subcategorias (usuario_id);
create index subcategorias_categoria_idx on public.subcategorias (categoria_id);
create index subcategorias_usuario_ativo_idx on public.subcategorias (usuario_id, ativo);

create index lancamentos_usuario_idx on public.lancamentos (usuario_id);
create index lancamentos_usuario_data_idx on public.lancamentos (usuario_id, data);
create index lancamentos_subcategoria_idx on public.lancamentos (subcategoria_id);
create index lancamentos_usuario_tipo_idx on public.lancamentos (usuario_id, tipo);
create index lancamentos_usuario_ativo_idx on public.lancamentos (usuario_id, ativo);
create index lancamentos_usuario_data_criado_idx
  on public.lancamentos (usuario_id, data desc, criado_em desc);

create index receitas_base_usuario_idx on public.receitas_base (usuario_id);
create index receitas_base_usuario_competencia_idx
  on public.receitas_base (usuario_id, mes, ano);
create index receitas_base_usuario_ativo_idx on public.receitas_base (usuario_id, ativo);

create index orcamentos_usuario_idx on public.orcamentos (usuario_id);
create index orcamentos_subcategoria_idx on public.orcamentos (subcategoria_id);
create index orcamentos_usuario_competencia_idx
  on public.orcamentos (usuario_id, mes, ano);
create index orcamentos_usuario_competencia_ativo_idx
  on public.orcamentos (usuario_id, mes, ano, ativo);

create index preferencias_usuario_atualizado_idx
  on public.preferencias_usuario (atualizado_em);

create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger categorias_definir_atualizado_em
  before update on public.categorias
  for each row execute function public.definir_atualizado_em();

create trigger subcategorias_definir_atualizado_em
  before update on public.subcategorias
  for each row execute function public.definir_atualizado_em();

create trigger lancamentos_definir_atualizado_em
  before update on public.lancamentos
  for each row execute function public.definir_atualizado_em();

create trigger receitas_base_definir_atualizado_em
  before update on public.receitas_base
  for each row execute function public.definir_atualizado_em();

create trigger orcamentos_definir_atualizado_em
  before update on public.orcamentos
  for each row execute function public.definir_atualizado_em();

create trigger preferencias_usuario_definir_atualizado_em
  before update on public.preferencias_usuario
  for each row execute function public.definir_atualizado_em();

create or replace function public.validar_subcategoria_do_usuario()
returns trigger
language plpgsql
as $$
declare
  subcategoria_usuario_id uuid;
begin
  if new.subcategoria_id is null then
    return new;
  end if;

  select usuario_id
    into subcategoria_usuario_id
  from public.subcategorias
  where id = new.subcategoria_id;

  if subcategoria_usuario_id is null or subcategoria_usuario_id <> new.usuario_id then
    raise exception 'A subcategoria informada nao pertence ao usuario do registro.';
  end if;

  return new;
end;
$$;

create or replace function public.validar_subcategoria_categoria_do_usuario()
returns trigger
language plpgsql
as $$
declare
  categoria_usuario_id uuid;
begin
  select usuario_id
    into categoria_usuario_id
  from public.categorias
  where id = new.categoria_id;

  if categoria_usuario_id is null or categoria_usuario_id <> new.usuario_id then
    raise exception 'A categoria informada nao pertence ao usuario da subcategoria.';
  end if;

  return new;
end;
$$;

create trigger subcategorias_validar_categoria_usuario
  before insert or update of usuario_id, categoria_id on public.subcategorias
  for each row execute function public.validar_subcategoria_categoria_do_usuario();

create trigger lancamentos_validar_subcategoria_usuario
  before insert or update of usuario_id, subcategoria_id on public.lancamentos
  for each row execute function public.validar_subcategoria_do_usuario();

create trigger orcamentos_validar_subcategoria_usuario
  before insert or update of usuario_id, subcategoria_id on public.orcamentos
  for each row execute function public.validar_subcategoria_do_usuario();
