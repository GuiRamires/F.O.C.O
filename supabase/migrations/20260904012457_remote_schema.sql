drop extension if exists "pg_net";


  create table "public"."focos" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "titulo" text not null,
    "status" text not null default 'ativo'::text,
    "tem_estrela" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."focos" enable row level security;


  create table "public"."focus_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "foco_id" uuid not null,
    "duracao_minutos" integer not null,
    "relato" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."focus_sessions" enable row level security;

CREATE UNIQUE INDEX focos_pkey ON public.focos USING btree (id);

CREATE UNIQUE INDEX focus_sessions_pkey ON public.focus_sessions USING btree (id);

alter table "public"."focos" add constraint "focos_pkey" PRIMARY KEY using index "focos_pkey";

alter table "public"."focus_sessions" add constraint "focus_sessions_pkey" PRIMARY KEY using index "focus_sessions_pkey";

alter table "public"."focos" add constraint "focos_status_check" CHECK ((status = ANY (ARRAY['ativo'::text, 'laboratorio_sonhos'::text]))) not valid;

alter table "public"."focos" validate constraint "focos_status_check";

alter table "public"."focos" add constraint "focos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."focos" validate constraint "focos_user_id_fkey";

alter table "public"."focus_sessions" add constraint "focus_sessions_duracao_minutos_check" CHECK ((duracao_minutos > 0)) not valid;

alter table "public"."focus_sessions" validate constraint "focus_sessions_duracao_minutos_check";

alter table "public"."focus_sessions" add constraint "focus_sessions_foco_id_fkey" FOREIGN KEY (foco_id) REFERENCES public.focos(id) ON DELETE CASCADE not valid;

alter table "public"."focus_sessions" validate constraint "focus_sessions_foco_id_fkey";

grant delete on table "public"."focos" to "anon";

grant insert on table "public"."focos" to "anon";

grant references on table "public"."focos" to "anon";

grant select on table "public"."focos" to "anon";

grant trigger on table "public"."focos" to "anon";

grant truncate on table "public"."focos" to "anon";

grant update on table "public"."focos" to "anon";

grant delete on table "public"."focos" to "authenticated";

grant insert on table "public"."focos" to "authenticated";

grant references on table "public"."focos" to "authenticated";

grant select on table "public"."focos" to "authenticated";

grant trigger on table "public"."focos" to "authenticated";

grant truncate on table "public"."focos" to "authenticated";

grant update on table "public"."focos" to "authenticated";

grant delete on table "public"."focos" to "service_role";

grant insert on table "public"."focos" to "service_role";

grant references on table "public"."focos" to "service_role";

grant select on table "public"."focos" to "service_role";

grant trigger on table "public"."focos" to "service_role";

grant truncate on table "public"."focos" to "service_role";

grant update on table "public"."focos" to "service_role";

grant delete on table "public"."focus_sessions" to "anon";

grant insert on table "public"."focus_sessions" to "anon";

grant references on table "public"."focus_sessions" to "anon";

grant select on table "public"."focus_sessions" to "anon";

grant trigger on table "public"."focus_sessions" to "anon";

grant truncate on table "public"."focus_sessions" to "anon";

grant update on table "public"."focus_sessions" to "anon";

grant delete on table "public"."focus_sessions" to "authenticated";

grant insert on table "public"."focus_sessions" to "authenticated";

grant references on table "public"."focus_sessions" to "authenticated";

grant select on table "public"."focus_sessions" to "authenticated";

grant trigger on table "public"."focus_sessions" to "authenticated";

grant truncate on table "public"."focus_sessions" to "authenticated";

grant update on table "public"."focus_sessions" to "authenticated";

grant delete on table "public"."focus_sessions" to "service_role";

grant insert on table "public"."focus_sessions" to "service_role";

grant references on table "public"."focus_sessions" to "service_role";

grant select on table "public"."focus_sessions" to "service_role";

grant trigger on table "public"."focus_sessions" to "service_role";

grant truncate on table "public"."focus_sessions" to "service_role";

grant update on table "public"."focus_sessions" to "service_role";


  create policy "Usuários atualizam seus próprios focos"
  on "public"."focos"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Usuários criam seus próprios focos"
  on "public"."focos"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Usuários veem seus próprios focos"
  on "public"."focos"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Usuários criam sessões nos seus focos"
  on "public"."focus_sessions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.focos
  WHERE ((focos.id = focus_sessions.foco_id) AND (focos.user_id = auth.uid())))));



  create policy "Usuários veem sessões dos seus focos"
  on "public"."focus_sessions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.focos
  WHERE ((focos.id = focus_sessions.foco_id) AND (focos.user_id = auth.uid())))));



