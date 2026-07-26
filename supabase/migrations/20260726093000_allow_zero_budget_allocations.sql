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

  select coalesce(sum(greatest((item->>'valor_planejado')::numeric, 0)), 0)::numeric(14, 2)
    into total_planejado
  from jsonb_array_elements(p_alocacoes) item;

  if total_planejado > p_receita_base then
    raise exception 'Total planejado excede a receita-base.';
  end if;

  insert into public.receitas_base (usuario_id, mes, ano, receita_base, ativo)
  values (usuario_atual, p_mes, p_ano, p_receita_base, true)
  on conflict (usuario_id, mes, ano)
  do update set receita_base = excluded.receita_base, ativo = true;

  update public.orcamentos
  set valor_planejado = 0,
      ativo = case when valor_gasto > 0 then true else false end
  where usuario_id = usuario_atual
    and mes = p_mes
    and ano = p_ano;

  for alocacao in
    select
      (item->>'subcategoria_id')::uuid as subcategoria_id,
      (item->>'valor_planejado')::numeric(14, 2) as valor_planejado
    from jsonb_array_elements(p_alocacoes) item
  loop
    if alocacao.valor_planejado < 0 then
      raise exception 'Valor planejado nao pode ser negativo.';
    end if;

    if not exists (
      select 1
      from public.subcategorias s
      join public.categorias c on c.id = s.categoria_id
      where s.id = alocacao.subcategoria_id
        and s.usuario_id = usuario_atual
        and s.ativo = true
        and c.ativo = true
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
