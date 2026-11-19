create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'arquivar-focos-inativos',
  '10 6 * * *',
  $$select public.arquivar_focos_inativos();$$
);

select cron.schedule(
  'remover-chamados-sem-login-vencidos',
  '20 6 * * *',
  $$select public.remover_chamados_sem_login_vencidos();$$
);

select cron.schedule(
  'avisar-focos-inativos',
  '0 12 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'foco_project_url') || '/functions/v1/avisar-inatividade',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-rotina-segredo', (select decrypted_secret from vault.decrypted_secrets where name = 'foco_rotina_segredo')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);
