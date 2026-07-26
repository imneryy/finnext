-- Finnext RLS, policies, RPCs and budget synchronization.
-- Task 02: isolation and financial integrity.

alter table public.categorias enable row level security;
alter table public.subcategorias enable row level security;
alter table public.lancamentos enable row level security;
alter table public.receitas_base enable row level security;
alter table public.orcamentos enable row level security;
alter table public.preferencias_usuario enable row level security;

alter table public.categorias force row level security;
alter table public.subcategorias force row level security;
alter table public.lancamentos force row level security;
alter table public.receitas_base force row level security;
alter table public.orcamentos force row level security;
alter table public.preferencias_usuario force row level security;

drop policy if exists categorias_select_proprias on public.categorias;
drop policy if exists categorias_insert_proprias on public.categorias;
drop policy if exists categorias_update_proprias on public.categorias;
drop policy if exists categorias_delete_proprias on public.categorias;

create policy categorias_select_proprias
  on public.categorias for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy categorias_insert_proprias
  on public.categorias for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy categorias_update_proprias
  on public.categorias for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy categorias_delete_proprias
  on public.categorias for delete
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists subcategorias_select_proprias on public.subcategorias;
drop policy if exists subcategorias_insert_proprias on public.subcategorias;
drop policy if exists subcategorias_update_proprias on public.subcategorias;
drop policy if exists subcategorias_delete_proprias on public.subcategorias;

create policy subcategorias_select_proprias
  on public.subcategorias for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy subcategorias_insert_proprias
  on public.subcategorias for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy subcategorias_update_proprias
  on public.subcategorias for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy subcategorias_delete_proprias
  on public.subcategorias for delete
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists lancamentos_select_proprios on public.lancamentos;
drop policy if exists lancamentos_insert_proprios on public.lancamentos;
drop policy if exists lancamentos_update_proprios on public.lancamentos;
drop policy if exists lancamentos_delete_proprios on public.lancamentos;

create policy lancamentos_select_proprios
  on public.lancamentos for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy lancamentos_insert_proprios
  on public.lancamentos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy lancamentos_update_proprios
  on public.lancamentos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy lancamentos_delete_proprios
  on public.lancamentos for delete
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists receitas_base_select_proprias on public.receitas_base;
drop policy if exists receitas_base_insert_proprias on public.receitas_base;
drop policy if exists receitas_base_update_proprias on public.receitas_base;
drop policy if exists receitas_base_delete_proprias on public.receitas_base;

create policy receitas_base_select_proprias
  on public.receitas_base for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy receitas_base_insert_proprias
  on public.receitas_base for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy receitas_base_update_proprias
  on public.receitas_base for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy receitas_base_delete_proprias
  on public.receitas_base for delete
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists orcamentos_select_proprios on public.orcamentos;
drop policy if exists orcamentos_insert_proprios on public.orcamentos;
drop policy if exists orcamentos_update_proprios on public.orcamentos;
drop policy if exists orcamentos_delete_proprios on public.orcamentos;

create policy orcamentos_select_proprios
  on public.orcamentos for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy orcamentos_insert_proprios
  on public.orcamentos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy orcamentos_update_proprios
  on public.orcamentos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy orcamentos_delete_proprios
  on public.orcamentos for delete
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists preferencias_usuario_select_proprias on public.preferencias_usuario;
drop policy if exists preferencias_usuario_insert_proprias on public.preferencias_usuario;
drop policy if exists preferencias_usuario_update_proprias on public.preferencias_usuario;
drop policy if exists preferencias_usuario_delete_proprias on public.preferencias_usuario;

create policy preferencias_usuario_select_proprias
  on public.preferencias_usuario for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy preferencias_usuario_insert_proprias
  on public.preferencias_usuario for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy preferencias_usuario_update_proprias
  on public.preferencias_usuario for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy preferencias_usuario_delete_proprias
  on public.preferencias_usuario for delete
  to authenticated
  using (auth.uid() = usuario_id);

create or replace function public.exigir_usuario_autenticado()
returns uuid
language plpgsql
stable
as $$
declare
  usuario_atual uuid;
begin
  usuario_atual := auth.uid();

  if usuario_atual is null then
    raise exception 'Usuario autenticado e obrigatorio.';
  end if;

  return usuario_atual;
end;
$$;

create or replace function public.criar_categorias_padrao()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
  categoria_id uuid;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  insert into public.preferencias_usuario (usuario_id)
  values (usuario_atual)
  on conflict (usuario_id) do nothing;

  if exists (
    select 1
    from public.categorias
    where usuario_id = usuario_atual
    limit 1
  ) then
    return;
  end if;

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Alimentacao', '#16a34a', 1)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Supermercado'),
    (usuario_atual, categoria_id, 'Restaurantes'),
    (usuario_atual, categoria_id, 'Delivery');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Transporte', '#2563eb', 2)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Combustivel'),
    (usuario_atual, categoria_id, 'Transporte Publico'),
    (usuario_atual, categoria_id, 'Uber/Taxi');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Moradia', '#7c3aed', 3)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Aluguel'),
    (usuario_atual, categoria_id, 'Contas'),
    (usuario_atual, categoria_id, 'Manutencao');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Saude', '#dc2626', 4)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Medicos'),
    (usuario_atual, categoria_id, 'Medicamentos'),
    (usuario_atual, categoria_id, 'Academia');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Lazer', '#ea580c', 5)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Cinema'),
    (usuario_atual, categoria_id, 'Viagens'),
    (usuario_atual, categoria_id, 'Hobbies');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Educacao', '#0891b2', 6)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Cursos'),
    (usuario_atual, categoria_id, 'Livros'),
    (usuario_atual, categoria_id, 'Assinaturas');

  insert into public.categorias (usuario_id, nome, cor, ordem)
  values (usuario_atual, 'Outros', '#64748b', 7)
  returning id into categoria_id;

  insert into public.subcategorias (usuario_id, categoria_id, nome)
  values
    (usuario_atual, categoria_id, 'Diversos'),
    (usuario_atual, categoria_id, 'Emergencia');
end;
$$;

create or replace function public.calcular_valor_gasto(
  p_usuario_id uuid,
  p_subcategoria_id uuid,
  p_mes integer,
  p_ano integer
)
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(sum(l.valor), 0)::numeric(14, 2)
  from public.lancamentos l
  where l.usuario_id = p_usuario_id
    and l.subcategoria_id = p_subcategoria_id
    and l.tipo = 'despesa'
    and l.ativo = true
    and extract(month from l.data)::integer = p_mes
    and extract(year from l.data)::integer = p_ano;
$$;

create or replace function public.recalcular_valor_gasto(
  p_mes integer,
  p_ano integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_mes not between 1 and 12 then
    raise exception 'Mes invalido.';
  end if;

  if p_ano < 2020 then
    raise exception 'Ano invalido.';
  end if;

  update public.orcamentos o
  set valor_gasto = public.calcular_valor_gasto(
      o.usuario_id,
      o.subcategoria_id,
      o.mes,
      o.ano
    )
  where o.usuario_id = usuario_atual
    and o.mes = p_mes
    and o.ano = p_ano;
end;
$$;

create or replace function public.sincronizar_orcamento_lancamento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  antigo_mes integer;
  antigo_ano integer;
  novo_mes integer;
  novo_ano integer;
begin
  if tg_op in ('UPDATE', 'DELETE')
    and old.tipo = 'despesa'
    and old.ativo = true
    and old.subcategoria_id is not null then
    antigo_mes := extract(month from old.data)::integer;
    antigo_ano := extract(year from old.data)::integer;

    update public.orcamentos o
    set valor_gasto = greatest(0, o.valor_gasto - old.valor)
    where o.usuario_id = old.usuario_id
      and o.subcategoria_id = old.subcategoria_id
      and o.mes = antigo_mes
      and o.ano = antigo_ano;
  end if;

  if tg_op in ('INSERT', 'UPDATE')
    and new.tipo = 'despesa'
    and new.ativo = true
    and new.subcategoria_id is not null then
    novo_mes := extract(month from new.data)::integer;
    novo_ano := extract(year from new.data)::integer;

    insert into public.orcamentos (
      usuario_id,
      subcategoria_id,
      mes,
      ano,
      valor_planejado,
      valor_gasto
    )
    values (
      new.usuario_id,
      new.subcategoria_id,
      novo_mes,
      novo_ano,
      0,
      new.valor
    )
    on conflict (usuario_id, subcategoria_id, mes, ano)
    do update set valor_gasto = public.orcamentos.valor_gasto + excluded.valor_gasto;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists lancamentos_sincronizar_orcamento on public.lancamentos;

create trigger lancamentos_sincronizar_orcamento
  after insert or update or delete on public.lancamentos
  for each row execute function public.sincronizar_orcamento_lancamento();

create or replace function public.salvar_orcamento_mensal(
  p_mes integer,
  p_ano integer,
  p_receita_base numeric,
  p_alocacoes jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
  total_planejado numeric(14, 2);
  alocacao record;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_mes not between 1 and 12 then
    raise exception 'Mes invalido.';
  end if;

  if p_ano < 2020 then
    raise exception 'Ano invalido.';
  end if;

  if p_receita_base < 0 then
    raise exception 'Receita-base nao pode ser negativa.';
  end if;

  if p_alocacoes is null or jsonb_typeof(p_alocacoes) <> 'array' then
    raise exception 'Alocacoes devem ser um array JSON.';
  end if;

  select coalesce(sum((item->>'valor_planejado')::numeric), 0)::numeric(14, 2)
    into total_planejado
  from jsonb_array_elements(p_alocacoes) item
  where coalesce((item->>'valor_planejado')::numeric, 0) > 0;

  if total_planejado > p_receita_base then
    raise exception 'Total planejado excede a receita-base.';
  end if;

  insert into public.receitas_base (usuario_id, mes, ano, receita_base, ativo)
  values (usuario_atual, p_mes, p_ano, p_receita_base, true)
  on conflict (usuario_id, mes, ano)
  do update set receita_base = excluded.receita_base, ativo = true;

  update public.orcamentos
  set valor_planejado = 0
  where usuario_id = usuario_atual
    and mes = p_mes
    and ano = p_ano;

  for alocacao in
    select
      (item->>'subcategoria_id')::uuid as subcategoria_id,
      (item->>'valor_planejado')::numeric(14, 2) as valor_planejado
    from jsonb_array_elements(p_alocacoes) item
    where coalesce((item->>'valor_planejado')::numeric, 0) > 0
  loop
    if alocacao.valor_planejado < 0 then
      raise exception 'Valor planejado nao pode ser negativo.';
    end if;

    if not exists (
      select 1
      from public.subcategorias s
      where s.id = alocacao.subcategoria_id
        and s.usuario_id = usuario_atual
        and s.ativo = true
    ) then
      raise exception 'Subcategoria invalida para o usuario.';
    end if;

    insert into public.orcamentos (
      usuario_id,
      subcategoria_id,
      mes,
      ano,
      valor_planejado,
      valor_gasto,
      ativo
    )
    values (
      usuario_atual,
      alocacao.subcategoria_id,
      p_mes,
      p_ano,
      alocacao.valor_planejado,
      public.calcular_valor_gasto(usuario_atual, alocacao.subcategoria_id, p_mes, p_ano),
      true
    )
    on conflict (usuario_id, subcategoria_id, mes, ano)
    do update set
      valor_planejado = excluded.valor_planejado,
      valor_gasto = excluded.valor_gasto,
      ativo = true;
  end loop;

  perform public.recalcular_valor_gasto(p_mes, p_ano);
end;
$$;

create or replace function public.duplicar_orcamento_mensal(
  p_mes_origem integer,
  p_ano_origem integer,
  p_mes_destino integer,
  p_ano_destino integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
  receita_origem numeric(14, 2);
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_mes_origem not between 1 and 12 or p_mes_destino not between 1 and 12 then
    raise exception 'Mes invalido.';
  end if;

  if p_ano_origem < 2020 or p_ano_destino < 2020 then
    raise exception 'Ano invalido.';
  end if;

  if exists (
    select 1
    from public.receitas_base rb
    where rb.usuario_id = usuario_atual
      and rb.mes = p_mes_destino
      and rb.ano = p_ano_destino
      and rb.ativo = true
  ) or exists (
    select 1
    from public.orcamentos o
    where o.usuario_id = usuario_atual
      and o.mes = p_mes_destino
      and o.ano = p_ano_destino
      and o.ativo = true
      and (o.valor_planejado > 0 or o.valor_gasto > 0)
  ) then
    raise exception 'Competencia destino ja possui orcamento.';
  end if;

  select rb.receita_base
    into receita_origem
  from public.receitas_base rb
  where rb.usuario_id = usuario_atual
    and rb.mes = p_mes_origem
    and rb.ano = p_ano_origem
    and rb.ativo = true;

  if receita_origem is null then
    raise exception 'Competencia origem nao possui receita-base.';
  end if;

  insert into public.receitas_base (usuario_id, mes, ano, receita_base, ativo)
  values (usuario_atual, p_mes_destino, p_ano_destino, receita_origem, true);

  insert into public.orcamentos (
    usuario_id,
    subcategoria_id,
    mes,
    ano,
    valor_planejado,
    valor_gasto,
    ativo
  )
  select
    usuario_atual,
    o.subcategoria_id,
    p_mes_destino,
    p_ano_destino,
    o.valor_planejado,
    public.calcular_valor_gasto(usuario_atual, o.subcategoria_id, p_mes_destino, p_ano_destino),
    true
  from public.orcamentos o
  join public.subcategorias s on s.id = o.subcategoria_id
  where o.usuario_id = usuario_atual
    and o.mes = p_mes_origem
    and o.ano = p_ano_origem
    and o.ativo = true
    and o.valor_planejado > 0
    and s.usuario_id = usuario_atual
    and s.ativo = true;

  perform public.recalcular_valor_gasto(p_mes_destino, p_ano_destino);
end;
$$;

create or replace function public.relatorio_resumo(
  p_data_inicio date,
  p_data_fim date
)
returns table (
  total_receitas numeric,
  total_despesas numeric,
  saldo_liquido numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_data_inicio > p_data_fim then
    raise exception 'Data inicial nao pode ser posterior a data final.';
  end if;

  return query
  select
    coalesce(sum(l.valor) filter (where l.tipo = 'receita'), 0)::numeric(14, 2),
    coalesce(sum(l.valor) filter (where l.tipo = 'despesa'), 0)::numeric(14, 2),
    (
      coalesce(sum(l.valor) filter (where l.tipo = 'receita'), 0)
      - coalesce(sum(l.valor) filter (where l.tipo = 'despesa'), 0)
    )::numeric(14, 2)
  from public.lancamentos l
  where l.usuario_id = usuario_atual
    and l.ativo = true
    and l.data between p_data_inicio and p_data_fim;
end;
$$;

create or replace function public.relatorio_despesas_por_categoria(
  p_data_inicio date,
  p_data_fim date
)
returns table (
  categoria_id uuid,
  categoria_nome text,
  total_despesas numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_data_inicio > p_data_fim then
    raise exception 'Data inicial nao pode ser posterior a data final.';
  end if;

  return query
  select
    c.id,
    c.nome,
    coalesce(sum(l.valor), 0)::numeric(14, 2)
  from public.lancamentos l
  join public.subcategorias s on s.id = l.subcategoria_id
  join public.categorias c on c.id = s.categoria_id
  where l.usuario_id = usuario_atual
    and s.usuario_id = usuario_atual
    and c.usuario_id = usuario_atual
    and l.ativo = true
    and l.tipo = 'despesa'
    and l.data between p_data_inicio and p_data_fim
  group by c.id, c.nome
  union all
  select
    null::uuid,
    'Nao categorizado'::text,
    coalesce(sum(l.valor), 0)::numeric(14, 2)
  from public.lancamentos l
  where l.usuario_id = usuario_atual
    and l.subcategoria_id is null
    and l.ativo = true
    and l.tipo = 'despesa'
    and l.data between p_data_inicio and p_data_fim
  having coalesce(sum(l.valor), 0) > 0
  order by total_despesas desc;
end;
$$;

create or replace function public.relatorio_orcamento_realizado(
  p_mes integer,
  p_ano integer
)
returns table (
  categoria_nome text,
  subcategoria_nome text,
  valor_planejado numeric,
  valor_gasto numeric,
  saldo numeric,
  percentual_usado numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_atual uuid;
begin
  usuario_atual := public.exigir_usuario_autenticado();

  if p_mes not between 1 and 12 then
    raise exception 'Mes invalido.';
  end if;

  if p_ano < 2020 then
    raise exception 'Ano invalido.';
  end if;

  perform public.recalcular_valor_gasto(p_mes, p_ano);

  return query
  select
    c.nome,
    s.nome,
    o.valor_planejado,
    o.valor_gasto,
    (o.valor_planejado - o.valor_gasto)::numeric(14, 2),
    case
      when o.valor_planejado = 0 then 0::numeric
      else round((o.valor_gasto / o.valor_planejado) * 100, 2)
    end
  from public.orcamentos o
  join public.subcategorias s on s.id = o.subcategoria_id
  join public.categorias c on c.id = s.categoria_id
  where o.usuario_id = usuario_atual
    and s.usuario_id = usuario_atual
    and c.usuario_id = usuario_atual
    and o.mes = p_mes
    and o.ano = p_ano
    and o.ativo = true
  order by c.ordem, c.nome, s.nome;
end;
$$;

grant execute on function public.criar_categorias_padrao() to authenticated;
grant execute on function public.recalcular_valor_gasto(integer, integer) to authenticated;
grant execute on function public.salvar_orcamento_mensal(integer, integer, numeric, jsonb) to authenticated;
grant execute on function public.duplicar_orcamento_mensal(integer, integer, integer, integer) to authenticated;
grant execute on function public.relatorio_resumo(date, date) to authenticated;
grant execute on function public.relatorio_despesas_por_categoria(date, date) to authenticated;
grant execute on function public.relatorio_orcamento_realizado(integer, integer) to authenticated;
