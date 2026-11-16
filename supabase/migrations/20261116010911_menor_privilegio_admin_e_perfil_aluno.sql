drop policy if exists "Admins veem todos os focos" on public.focos;

create or replace function public.indicadores_admin()
returns table (
  total_usuarios bigint,
  total_focos bigint,
  usuarios_ativos_30_dias bigint,
  sessoes_30_dias bigint
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
    (select count(*) from public.focus_sessions s where s.created_at >= now() - interval '30 days');
end;
$$;

revoke execute on function public.indicadores_admin() from public, anon;
grant execute on function public.indicadores_admin() to authenticated;

update public.user_profiles set papel = 'aluno' where papel = 'mentor';

alter table public.user_profiles drop constraint if exists user_profiles_papel_check;
alter table public.user_profiles add constraint user_profiles_papel_check check (papel in ('aluno', 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.user_profiles (id, nome, papel)
  values (new.id, new.raw_user_meta_data->>'nome', 'aluno');
  return new;
end;
$$;

drop policy if exists "Usuários criam seu próprio perfil" on public.user_profiles;

create policy "Usuários criam seu próprio perfil"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id and papel = 'aluno');
