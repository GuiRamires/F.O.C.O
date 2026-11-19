create or replace function public.versao_atual_termo()
returns text
language sql
immutable
as $$
  select '1.1'::text;
$$;

create table public.aceites_termo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  versao text not null,
  aceito_em timestamptz not null default now(),
  constraint aceites_termo_usuario_versao_key unique (user_id, versao)
);

alter table public.aceites_termo enable row level security;

create policy "Usuário vê os próprios aceites do termo"
  on public.aceites_termo
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.aceites_termo from anon, authenticated;
grant select on public.aceites_termo to authenticated;

create or replace function public.termo_pendente()
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select case
           when auth.uid() is null then null
           when exists (
             select 1
               from public.aceites_termo a
              where a.user_id = auth.uid()
                and a.versao = public.versao_atual_termo()
           ) then null
           else public.versao_atual_termo()
         end;
$$;

create or replace function public.aceitar_termo()
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_aceito_em timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Sessão inválida.';
  end if;

  insert into public.aceites_termo (user_id, versao)
  values (auth.uid(), public.versao_atual_termo())
  on conflict (user_id, versao) do nothing
  returning aceito_em into v_aceito_em;

  if v_aceito_em is null then
    select a.aceito_em
      into v_aceito_em
      from public.aceites_termo a
     where a.user_id = auth.uid()
       and a.versao = public.versao_atual_termo();
  else
    insert into public.logs_auditoria (user_id, acao, detalhes)
    values (auth.uid(), 'aceitar_termo', jsonb_build_object('versao', public.versao_atual_termo()));
  end if;

  return v_aceito_em;
end;
$$;

create or replace function public.registrar_aceite_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.raw_user_meta_data ->> 'termo_versao' = public.versao_atual_termo() then
    insert into public.aceites_termo (user_id, versao)
    values (new.id, public.versao_atual_termo())
    on conflict (user_id, versao) do nothing;

    insert into public.logs_auditoria (user_id, acao, detalhes)
    values (new.id, 'aceitar_termo', jsonb_build_object('versao', public.versao_atual_termo(), 'origem', 'cadastro'));
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_registrar_aceite
  after insert on auth.users
  for each row execute function public.registrar_aceite_no_cadastro();

revoke execute on function public.termo_pendente() from public, anon;
revoke execute on function public.aceitar_termo() from public, anon;
revoke execute on function public.registrar_aceite_no_cadastro() from public, anon, authenticated;
grant execute on function public.termo_pendente() to authenticated;
grant execute on function public.aceitar_termo() to authenticated;
