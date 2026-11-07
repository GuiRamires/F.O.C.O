   update public.focos
      set titulo = coalesce(
            nullif(btrim(left(regexp_replace(titulo, '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 -]', '', 'g'), 40)), ''),
            'Foco sem nome'
          )
    where titulo ~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 -]'
       or char_length(titulo) > 40;

   update public.focos
      set observacoes = nullif(
            btrim(left(regexp_replace(observacoes, '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 \n.,!?():;-]', '', 'g'), 200)),
            ''
          )
    where observacoes ~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 \n.,!?():;-]'
       or char_length(observacoes) > 200;

   alter table public.focos
     add constraint focos_titulo_texto
     check (
       char_length(titulo) <= 40
       and titulo !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 -]'
     );

   alter table public.focos
     add constraint focos_observacoes_texto
     check (
       observacoes is null
       or (
         char_length(observacoes) <= 200
         and observacoes !~ '[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 \n.,!?():;-]'
       )
     );