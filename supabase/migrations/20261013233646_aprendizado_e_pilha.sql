-- Registro de aprendizado da sessão (RF22)
alter table public.focus_sessions
  rename column relato to aprendizado;

alter table public.focus_sessions
  add constraint focus_sessions_aprendizado_tamanho
  check (char_length(aprendizado) <= 1000);

-- Pilha, cor e Laboratório de Sonhos (RF10, RF11, RF12, RF15, RF18)
alter table public.focos
  add column posicao integer,
  add column cor_hex text,
  add column arquivado_em timestamptz,
  add column resgatado_em timestamptz;

alter table public.focos
  add constraint focos_cor_hex_formato
  check (cor_hex ~ '^#[0-9A-Fa-f]{6}$');

-- Posição inicial dos Focos ativos
with ordem as (
  select
    id,
    row_number() over (
      partition by user_id
      order by tem_estrela desc, created_at desc
    ) as nova_posicao
  from public.focos
  where status = 'ativo'
)
update public.focos
set posicao = ordem.nova_posicao
from ordem
where focos.id = ordem.id;