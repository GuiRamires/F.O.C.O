alter table public.chamados
  add column nome_informado text,
  add column cadastro_informado text,
  add column ultimo_acesso_informado text,
  add column titulos_informados text;

alter table public.chamados
  add constraint chamados_verificacao_textos_check check (
    (nome_informado is null or (
      char_length(btrim(nome_informado)) between 1 and 80
      and nome_informado !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 .,!?():;/-]'
    ))
    and (cadastro_informado is null or (
      char_length(cadastro_informado) <= 40
      and cadastro_informado !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 .,!?():;/-]'
    ))
    and (ultimo_acesso_informado is null or (
      char_length(ultimo_acesso_informado) <= 40
      and ultimo_acesso_informado !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 .,!?():;/-]'
    ))
    and (titulos_informados is null or (
      char_length(btrim(titulos_informados)) between 1 and 300
      and titulos_informados !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 .,!?():;/-]'
    ))
  );

alter table public.chamados
  add constraint chamados_verificacao_origem_check check (
    (user_id is not null
      and nome_informado is null
      and cadastro_informado is null
      and ultimo_acesso_informado is null
      and titulos_informados is null)
    or (user_id is null and nome_informado is not null and titulos_informados is not null)
  ) not valid;
