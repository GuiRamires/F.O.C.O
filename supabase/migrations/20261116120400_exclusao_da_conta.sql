alter table public.focos drop constraint if exists focos_user_id_fkey;

alter table public.focos
  add constraint focos_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
