create or replace function public.versao_atual_termo()
returns text
language sql
immutable
as $$
  select '1.2'::text;
$$;
