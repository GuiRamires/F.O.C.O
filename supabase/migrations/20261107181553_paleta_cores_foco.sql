   update public.focos
      set cor_hex = upper(cor_hex)
    where cor_hex is not null;

   update public.focos
      set cor_hex = null
    where cor_hex is not null
      and cor_hex not in ('#9B5CFF', '#22C55E', '#14B8A6', '#EC4899');

   alter table public.focos
     drop constraint if exists focos_cor_hex_formato;

   alter table public.focos
     add constraint focos_cor_hex_paleta
     check (cor_hex is null or cor_hex in ('#9B5CFF', '#22C55E', '#14B8A6', '#EC4899'));

   alter table public.focos
     add constraint focos_titulo_preenchido
     check (char_length(btrim(titulo)) > 0);