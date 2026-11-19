create table public.chamados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  categoria text not null,
  descricao text not null,
  status text not null default 'aberto',
  email_informado text,
  email_contato text,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint chamados_categoria_check check (
    categoria in ('acesso_conta', 'problema_tecnico', 'duvida', 'sugestao', 'privacidade_dados')
  ),
  constraint chamados_status_check check (
    status in ('aberto', 'em_andamento', 'respondido', 'encerrado')
  ),
  constraint chamados_descricao_check check (
    char_length(btrim(descricao)) between 10 and 1000
    and descricao !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 \n.,!?():;-]'
  ),
  constraint chamados_emails_check check (
    (email_informado is null or (char_length(email_informado) <= 254 and email_informado ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
    and (email_contato is null or (char_length(email_contato) <= 254 and email_contato ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
  ),
  constraint chamados_origem_check check (
    (user_id is not null and email_informado is null and email_contato is null)
    or (user_id is null and email_informado is not null and email_contato is not null and categoria = 'acesso_conta')
  )
);

create index chamados_user_id_idx on public.chamados (user_id);
create index chamados_email_informado_idx on public.chamados (lower(email_informado), created_at);

create table public.respostas_chamado (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references public.chamados(id) on delete cascade,
  admin_id uuid references auth.users(id) on delete set null,
  texto text not null,
  created_at timestamptz not null default now(),
  constraint respostas_chamado_texto_check check (char_length(btrim(texto)) between 1 and 2000)
);

create index respostas_chamado_chamado_id_idx on public.respostas_chamado (chamado_id);

alter table public.chamados enable row level security;
alter table public.respostas_chamado enable row level security;

create policy "Usuários veem seus chamados e o Administrador vê todos"
  on public.chamados
  as permissive
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Usuários abrem chamados"
  on public.chamados
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'aberto');

create policy "Usuários veem as respostas dos seus chamados"
  on public.respostas_chamado
  as permissive
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.chamados c
       where c.id = chamado_id
         and (c.user_id = auth.uid() or public.is_admin())
    )
  );

revoke all on public.chamados, public.respostas_chamado from anon;
revoke all on public.chamados, public.respostas_chamado from authenticated;
grant select on public.chamados, public.respostas_chamado to authenticated;
grant insert (categoria, descricao) on public.chamados to authenticated;

create or replace function public.responder_chamado(p_chamado_id uuid, p_texto text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  update public.chamados
     set status = 'respondido',
         atualizado_em = now()
   where id = p_chamado_id
     and status <> 'encerrado';

  if not found then
    raise exception 'Este chamado não pode receber resposta.';
  end if;

  insert into public.respostas_chamado (chamado_id, admin_id, texto)
  values (p_chamado_id, auth.uid(), btrim(p_texto));

  insert into public.logs_auditoria (user_id, acao, detalhes)
  values (auth.uid(), 'responder_chamado', jsonb_build_object('chamado_id', p_chamado_id));
end;
$$;

create or replace function public.alterar_situacao_chamado(p_chamado_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito ao Administrador.';
  end if;

  if p_status not in ('em_andamento', 'encerrado') then
    raise exception 'Situação inválida.';
  end if;

  update public.chamados
     set status = p_status,
         atualizado_em = now()
   where id = p_chamado_id;

  if not found then
    raise exception 'Chamado não encontrado.';
  end if;

  insert into public.logs_auditoria (user_id, acao, detalhes)
  values (auth.uid(), 'alterar_situacao_chamado', jsonb_build_object('chamado_id', p_chamado_id, 'status', p_status));
end;
$$;

revoke execute on function public.responder_chamado(uuid, text) from public, anon;
revoke execute on function public.alterar_situacao_chamado(uuid, text) from public, anon;
grant execute on function public.responder_chamado(uuid, text) to authenticated;
grant execute on function public.alterar_situacao_chamado(uuid, text) to authenticated;

create or replace function public.remover_chamados_sem_login_vencidos()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_total integer;
begin
  delete from public.chamados
   where user_id is null
     and status = 'encerrado'
     and atualizado_em < now() - interval '6 months';

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke execute on function public.remover_chamados_sem_login_vencidos() from public, anon, authenticated;
grant execute on function public.remover_chamados_sem_login_vencidos() to service_role;
