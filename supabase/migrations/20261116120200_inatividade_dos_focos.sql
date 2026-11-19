alter table public.focos
  add column ultimo_aviso_inatividade_em timestamptz;

create or replace function public.inicio_inatividade(p_foco_id uuid)
returns timestamptz
language sql
stable
set search_path to 'public'
as $$
  select greatest(
           f.created_at,
           coalesce(f.resgatado_em, f.created_at),
           coalesce((select max(s.created_at) from public.focus_sessions s where s.foco_id = f.id), f.created_at)
         )
    from public.focos f
   where f.id = p_foco_id;
$$;

create or replace function public.registrar_avisos_inatividade()
returns table (
  foco_id uuid,
  user_id uuid,
  titulo text,
  email text,
  dias_restantes integer
)
language plpgsql
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
begin
  return query
  with candidatos as (
    select f.id, public.inicio_inatividade(f.id) as inicio
      from public.focos f
     where f.status = 'ativo'
       and not f.tem_estrela
  ),
  avisar as (
    select c.id, c.inicio
      from candidatos c
      join public.focos f on f.id = c.id
     where c.inicio <= now() - interval '14 days'
       and (f.ultimo_aviso_inatividade_em is null or f.ultimo_aviso_inatividade_em < c.inicio)
  ),
  marcados as (
    update public.focos f
       set ultimo_aviso_inatividade_em = now()
      from avisar a
     where f.id = a.id
    returning f.id, f.user_id, f.titulo, a.inicio
  )
  select
    m.id,
    m.user_id,
    m.titulo,
    u.email::text,
    greatest(30 - floor(extract(epoch from (now() - m.inicio)) / 86400)::integer, 1)
  from marcados m
  join auth.users u on u.id = m.user_id;
end;
$$;

create or replace function public.arquivar_focos_inativos()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_foco record;
  v_total integer := 0;
begin
  for v_foco in
    select f.id, f.user_id, f.posicao
      from public.focos f
     where f.status = 'ativo'
       and not f.tem_estrela
       and public.inicio_inatividade(f.id) <= now() - interval '30 days'
       and f.ultimo_aviso_inatividade_em is not null
       and f.ultimo_aviso_inatividade_em >= public.inicio_inatividade(f.id)
       and f.ultimo_aviso_inatividade_em < date_trunc('day', now())
     order by f.user_id, f.posicao desc
     for update
  loop
    update public.focos
       set status = 'laboratorio_sonhos',
           arquivado_em = now(),
           posicao = null
     where id = v_foco.id;

    update public.focos
       set posicao = posicao - 1
     where user_id = v_foco.user_id
       and status = 'ativo'
       and posicao > v_foco.posicao;

    insert into public.logs_auditoria (user_id, acao, detalhes)
    values (v_foco.user_id, 'arquivamento_automatico', jsonb_build_object('foco_id', v_foco.id));

    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;

revoke execute on function public.inicio_inatividade(uuid) from public, anon;
revoke execute on function public.registrar_avisos_inatividade() from public, anon, authenticated;
revoke execute on function public.arquivar_focos_inativos() from public, anon, authenticated;
grant execute on function public.inicio_inatividade(uuid) to authenticated;
grant execute on function public.registrar_avisos_inatividade() to service_role;
grant execute on function public.arquivar_focos_inativos() to service_role;
