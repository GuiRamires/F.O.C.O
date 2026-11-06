create or replace function public.reordenar_foco(p_foco_id uuid, p_nova_posicao integer)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  v_usuario uuid;
  v_tem_estrela boolean;
  v_resgatado_em timestamptz;
  v_total integer;
  v_estrela_na_pilha boolean;
begin
  select user_id, tem_estrela, resgatado_em
    into v_usuario, v_tem_estrela, v_resgatado_em
    from public.focos
   where id = p_foco_id
     and status = 'ativo'
   for update;

  if not found then
    raise exception 'Foco não encontrado na pilha.';
  end if;

  if v_tem_estrela then
    raise exception 'O Foco com a Estrela Dourada fica fixo na 1ª posição.';
  end if;

  if v_resgatado_em is not null and not exists (
    select 1
      from public.focus_sessions
     where foco_id = p_foco_id
       and created_at >= v_resgatado_em
  ) then
    raise exception 'Conclua uma sessão com este Foco antes de mudá-lo de posição.';
  end if;

  select count(*), coalesce(bool_or(tem_estrela), false)
    into v_total, v_estrela_na_pilha
    from public.focos
   where user_id = v_usuario
     and status = 'ativo';

  if p_nova_posicao < 1 or p_nova_posicao > v_total then
    raise exception 'Posição inválida.';
  end if;

  if v_estrela_na_pilha and p_nova_posicao = 1 then
    raise exception 'A 1ª posição é do Foco com a Estrela Dourada.';
  end if;

  perform public.mover_foco(p_foco_id, p_nova_posicao);
end;
$$;

revoke execute on function public.reordenar_foco(uuid, integer) from public, anon;
grant execute on function public.reordenar_foco(uuid, integer) to authenticated;