drop function if exists public.indicadores_admin();

create function public.indicadores_admin()
returns table (
  total_usuarios bigint,
  total_focos bigint,
  usuarios_ativos_30_dias bigint,
  sessoes_30_dias bigint,
  chamados_abertos bigint,
  chamados_em_andamento bigint,
  chamados_respondidos bigint,
  chamados_encerrados bigint
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  return query
  select
    (select count(*) from public.user_profiles),
    (select count(*) from public.focos),
    (select count(*) from auth.users u where u.last_sign_in_at >= now() - interval '30 days'),
    (select count(*) from public.focus_sessions s where s.created_at >= now() - interval '30 days'),
    (select count(*) from public.chamados c where c.status = 'aberto'),
    (select count(*) from public.chamados c where c.status = 'em_andamento'),
    (select count(*) from public.chamados c where c.status = 'respondido'),
    (select count(*) from public.chamados c where c.status = 'encerrado');
end;
$$;

create or replace function public.listar_usuarios_admin()
returns table (
  id uuid,
  nome text,
  email text,
  papel text,
  cadastrado_em timestamptz,
  ultimo_acesso timestamptz,
  bloqueado boolean,
  total_focos bigint
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  return query
  select
    u.id,
    p.nome,
    u.email::text,
    p.papel,
    u.created_at,
    u.last_sign_in_at,
    coalesce(u.banned_until > now(), false),
    (select count(*) from public.focos f where f.user_id = u.id)
  from auth.users u
  join public.user_profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.conferir_titulos(p_email text, p_titulos text[])
returns integer
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_usuario uuid;
  v_total integer;
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  select u.id
    into v_usuario
    from auth.users u
   where lower(u.email) = lower(btrim(p_email));

  if v_usuario is null then
    return 0;
  end if;

  select count(distinct lower(btrim(t)))
    into v_total
    from unnest(p_titulos) as t
   where btrim(t) <> ''
     and exists (
       select 1
         from public.focos f
        where f.user_id = v_usuario
          and lower(f.titulo) = lower(btrim(t))
     );

  return v_total;
end;
$$;

revoke execute on function public.indicadores_admin() from public, anon;
revoke execute on function public.listar_usuarios_admin() from public, anon;
revoke execute on function public.conferir_titulos(text, text[]) from public, anon;
grant execute on function public.indicadores_admin() to authenticated;
grant execute on function public.listar_usuarios_admin() to authenticated;
grant execute on function public.conferir_titulos(text, text[]) to authenticated;

create or replace function public.registrar_alteracao_email(p_chamado_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  if not exists (
    select 1 from public.chamados
     where id = p_chamado_id
       and categoria = 'acesso_conta'
  ) then
    raise exception 'Chamado de acesso à conta não encontrado.';
  end if;

  insert into public.logs_auditoria (user_id, acao, detalhes)
  values (auth.uid(), 'alterar_email_suporte', jsonb_build_object('chamado_id', p_chamado_id));
end;
$$;

revoke execute on function public.registrar_alteracao_email(uuid) from public, anon;
grant execute on function public.registrar_alteracao_email(uuid) to authenticated;
