
  create table "public"."logs_auditoria" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "acao" text not null,
    "detalhes" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."logs_auditoria" enable row level security;


  create table "public"."user_profiles" (
    "id" uuid not null,
    "nome" text not null,
    "papel" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_profiles" enable row level security;

alter table "public"."focos" add column "meta_horas" integer not null default 0;

alter table "public"."focos" add column "observacoes" text;

CREATE UNIQUE INDEX logs_auditoria_pkey ON public.logs_auditoria USING btree (id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

alter table "public"."logs_auditoria" add constraint "logs_auditoria_pkey" PRIMARY KEY using index "logs_auditoria_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."logs_auditoria" add constraint "logs_auditoria_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."logs_auditoria" validate constraint "logs_auditoria_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_papel_check" CHECK ((papel = ANY (ARRAY['aluno'::text, 'mentor'::text, 'admin'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_papel_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.user_profiles (id, nome, papel)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    coalesce(new.raw_user_meta_data->>'papel', 'aluno')
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from user_profiles
    where id = auth.uid()
    and papel = 'admin'
  );
$function$
;

grant delete on table "public"."logs_auditoria" to "anon";

grant insert on table "public"."logs_auditoria" to "anon";

grant references on table "public"."logs_auditoria" to "anon";

grant select on table "public"."logs_auditoria" to "anon";

grant trigger on table "public"."logs_auditoria" to "anon";

grant truncate on table "public"."logs_auditoria" to "anon";

grant update on table "public"."logs_auditoria" to "anon";

grant delete on table "public"."logs_auditoria" to "authenticated";

grant insert on table "public"."logs_auditoria" to "authenticated";

grant references on table "public"."logs_auditoria" to "authenticated";

grant select on table "public"."logs_auditoria" to "authenticated";

grant trigger on table "public"."logs_auditoria" to "authenticated";

grant truncate on table "public"."logs_auditoria" to "authenticated";

grant update on table "public"."logs_auditoria" to "authenticated";

grant delete on table "public"."logs_auditoria" to "service_role";

grant insert on table "public"."logs_auditoria" to "service_role";

grant references on table "public"."logs_auditoria" to "service_role";

grant select on table "public"."logs_auditoria" to "service_role";

grant trigger on table "public"."logs_auditoria" to "service_role";

grant truncate on table "public"."logs_auditoria" to "service_role";

grant update on table "public"."logs_auditoria" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";


  create policy "Admins veem todos os focos"
  on "public"."focos"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Usuários criam seus próprios logs"
  on "public"."logs_auditoria"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Usuários veem seus próprios logs"
  on "public"."logs_auditoria"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins veem todos os perfis"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Usuários atualizam seu próprio perfil"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Usuários criam seu próprio perfil"
  on "public"."user_profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Usuários veem seu próprio perfil"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


