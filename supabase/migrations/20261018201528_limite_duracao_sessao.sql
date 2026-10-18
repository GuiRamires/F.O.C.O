delete from public.focus_sessions
where duracao_minutos not between 5 and 180;

alter table public.focus_sessions
  drop constraint if exists focus_sessions_duracao_minutos_check;

alter table public.focus_sessions
  add constraint focus_sessions_duracao_minutos_check
  check (duracao_minutos between 5 and 180);