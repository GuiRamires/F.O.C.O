create or replace function public.arquivar_foco(p_foco_id uuid)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  v_usuario uuid;
  v_posicao integer;
begin
  select user_id, posicao
    into v_usuario, v_posicao
    from public.focos
   where id = p_foco_id
     and status = 'ativo'
     and not tem_estrela
   for update;

  if not found then
    raise exception 'Este Foco não pode ser arquivado.';
  end if;

  update public.focos
     set status = 'laboratorio_sonhos',
         arquivado_em = now(),
         posicao = null
   where id = p_foco_id;

  update public.focos
     set posicao = posicao - 1
   where user_id = v_usuario
     and status = 'ativo'
     and posicao > v_posicao;
end;
$$;

create or replace function public.resgatar_foco(p_foco_id uuid)
returns integer
language plpgsql
set search_path to 'public'
as $$
declare
  v_usuario uuid;
  v_posicao integer;
begin
  select user_id
    into v_usuario
    from public.focos
   where id = p_foco_id
     and status = 'laboratorio_sonhos'
   for update;

  if not found then
    raise exception 'Este Foco não está no Laboratório de Sonhos.';
  end if;

  select coalesce(max(posicao), 0) + 1
    into v_posicao
    from public.focos
   where user_id = v_usuario
     and status = 'ativo';

  update public.focos
     set status = 'ativo',
         posicao = v_posicao,
         resgatado_em = now(),
         arquivado_em = null,
         cor_hex = null
   where id = p_foco_id;

  return v_posicao;
end;
$$;

revoke execute on function public.arquivar_foco(uuid) from public, anon;
revoke execute on function public.resgatar_foco(uuid) from public, anon;
grant execute on function public.arquivar_foco(uuid) to authenticated;
grant execute on function public.resgatar_foco(uuid) to authenticated;

create policy "Usuários excluem seus focos do Laboratório"
  on public.focos
  as permissive
  for delete
  to authenticated
  using (auth.uid() = user_id and status = 'laboratorio_sonhos');

revoke truncate on public.focos, public.focus_sessions from anon, authenticated;