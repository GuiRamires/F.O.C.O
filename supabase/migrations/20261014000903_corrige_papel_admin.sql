create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.user_profiles (id, nome, papel)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    case
      when new.raw_user_meta_data->>'papel' = 'mentor' then 'mentor'
      else 'aluno'
    end
  );
  return new;
end;
$$;

revoke update on public.user_profiles from anon, authenticated;
grant update (nome) on public.user_profiles to authenticated;

drop policy "Usuários criam seu próprio perfil" on public.user_profiles;

create policy "Usuários criam seu próprio perfil"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id and papel in ('aluno', 'mentor'));