with ordem as (
  select
    id,
    row_number() over (
      partition by user_id
      order by tem_estrela desc, created_at asc
    ) as nova_posicao
  from public.focos
  where status = 'ativo'
)
update public.focos
set posicao = ordem.nova_posicao
from ordem
where focos.id = ordem.id;

update public.focos
set posicao = null
where status <> 'ativo';

create unique index focos_uma_estrela_por_usuario
  on public.focos (user_id)
  where tem_estrela;

alter table public.focos
  add constraint focos_posicao_unica
  unique (user_id, posicao)
  deferrable initially deferred;

create or replace function public.definir_posicao_novo_foco()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.status = 'ativo' then
    select coalesce(max(posicao), 0) + 1
      into new.posicao
      from public.focos
     where user_id = new.user_id
       and status = 'ativo';
  end if;
  return new;
end;
$$;

create trigger focos_posicao_novo_foco
  before insert on public.focos
  for each row
  execute function public.definir_posicao_novo_foco();

create or replace function public.mover_foco(p_foco_id uuid, p_nova_posicao integer)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  v_usuario uuid;
  v_atual integer;
  v_total integer;
  v_destino integer;
begin
  select user_id, posicao
    into v_usuario, v_atual
    from public.focos
   where id = p_foco_id
     and status = 'ativo'
   for update;

  if not found or v_atual is null then
    raise exception 'Foco não encontrado na pilha.';
  end if;

  select count(*)
    into v_total
    from public.focos
   where user_id = v_usuario
     and status = 'ativo';

  v_destino := least(greatest(p_nova_posicao, 1), v_total);

  if v_destino > v_atual then
    update public.focos
       set posicao = posicao - 1
     where user_id = v_usuario
       and status = 'ativo'
       and posicao > v_atual
       and posicao <= v_destino;
  elsif v_destino < v_atual then
    update public.focos
       set posicao = posicao + 1
     where user_id = v_usuario
       and status = 'ativo'
       and posicao >= v_destino
       and posicao < v_atual;
  end if;

  update public.focos
     set posicao = v_destino
   where id = p_foco_id;
end;
$$;

create or replace function public.remover_estrela(p_foco_id uuid, p_nova_posicao integer)
returns void
language plpgsql
set search_path to 'public'
as $$
begin
  update public.focos
     set tem_estrela = false
   where id = p_foco_id
     and tem_estrela;

  if not found then
    raise exception 'Este Foco não possui a Estrela Dourada.';
  end if;

  perform public.mover_foco(p_foco_id, p_nova_posicao);
end;
$$;

create or replace function public.atribuir_estrela(p_foco_id uuid)
returns void
language plpgsql
set search_path to 'public'
as $$
begin
  update public.focos
     set tem_estrela = true
   where id = p_foco_id
     and status = 'ativo'
     and not tem_estrela;

  if not found then
    raise exception 'Não foi possível dar a Estrela a este Foco.';
  end if;

  perform public.mover_foco(p_foco_id, 1);
end;
$$;

revoke execute on function public.mover_foco(uuid, integer) from public, anon;
revoke execute on function public.remover_estrela(uuid, integer) from public, anon;
revoke execute on function public.atribuir_estrela(uuid) from public, anon;
grant execute on function public.mover_foco(uuid, integer) to authenticated;
grant execute on function public.remover_estrela(uuid, integer) to authenticated;
grant execute on function public.atribuir_estrela(uuid) to authenticated;

revoke update, delete, truncate on public.logs_auditoria from anon, authenticated;