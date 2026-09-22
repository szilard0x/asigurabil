-- asigurabil.ro — schema inițială: profiluri cu roluri, cereri de ofertă, fișiere atașate.
-- Scrierile publice se fac EXCLUSIV prin Edge Functions (service role); rolul anon nu are
-- niciun drept de scriere.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tipuri
-- ─────────────────────────────────────────────────────────────────────────────
create type public.app_role as enum ('admin', 'broker');
-- „câștigat"/„pierdut" în loc de un simplu „închis" — altfel statisticile de
-- conversie nu ar însemna nimic.
create type public.request_status as enum ('nou', 'contactat', 'ofertat', 'castigat', 'pierdut');

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiluri (oglindă a auth.users, cu rol)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- identitatea de autentificare e un email sintetic (40xxx@wa.asigurabil.ro);
  -- utilizatorii se loghează cu TELEFONUL, emailul nu e expus nicăieri în UI.
  email text not null,
  -- telefonul în format E.164 fără plus (ex: 40751461173) — unic per cont
  phone text unique,
  full_name text,
  role public.app_role not null default 'broker',
  -- codul din linkul personal de recomandare (asigurabil.ro/b/<cod>)
  referral_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  -- oglindește ban-ul din auth (setat de funcția invite-user la dezactivare)
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Preferințe de notificare pe WhatsApp, per utilizator.
-- „instant_new_request" e doar pregătit pentru v2 (nu se trimite încă nimic);
-- digestul zilnic de cereri nelucrate ESTE funcțional.
create table public.notification_settings (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  instant_new_request boolean not null default false,
  daily_digest boolean not null default true,
  -- ora locală (Europe/Bucharest) la care se trimite digestul
  digest_hour int not null default 9 check (digest_hour between 0 and 23),
  -- o cerere e considerată „uitată" dacă nu s-a schimbat de atâtea zile
  stale_days int not null default 2 check (stale_days between 1 and 30),
  last_digest_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Jurnalul mesajelor WhatsApp trimise de sistem (invitații, resetări, digest).
-- Local (driver "mock") ține loc de WhatsApp: linkurile se citesc de aici.
create table public.whatsapp_outbox (
  id uuid primary key default gen_random_uuid(),
  to_phone text not null,
  purpose text not null, -- invite | reset | temp_password | digest
  body text not null,
  status text not null default 'mock', -- mock | sent | failed
  error text,
  created_at timestamptz not null default now()
);

-- Configurări per-mediu citite de jobul cron (setate de seed local / DEPLOY.md în cloud).
create table public.app_config (
  key text primary key,
  value text not null
);

-- Creat automat la fiecare utilizator nou; rolul și telefonul vin din metadata invitației.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'broker')
  );
  insert into public.notification_settings (profile_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rolul utilizatorului curent (folosit în politici; security definer ca să nu
-- depindă de RLS-ul de pe profiles).
create or replace function public.current_role_of(uid uuid)
returns public.app_role
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = uid;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role_of(auth.uid()) = 'admin';
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Cereri de ofertă
-- ─────────────────────────────────────────────────────────────────────────────
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  -- id scurt, prietenos, folosit în mesajul WhatsApp pentru corelare
  short_id text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  type_id text not null,
  reasons text[] not null default '{}',
  reason_text text not null default '',
  extra jsonb not null default '{}',
  referral_id text,
  name text not null,
  phone text not null,
  city text,
  gdpr_consent boolean not null check (gdpr_consent),
  status public.request_status not null default 'nou',
  assigned_to uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index requests_created_at_idx on public.requests (created_at desc);
create index requests_status_idx on public.requests (status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger requests_touch_updated_at
  before update on public.requests
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Fișiere atașate cererilor
-- ─────────────────────────────────────────────────────────────────────────────
create table public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  size bigint not null,
  content_type text not null,
  created_at timestamptz not null default now()
);

create index request_files_request_id_idx on public.request_files (request_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GRANT-uri (noile proiecte nu mai expun implicit tabelele către rolurile API)
-- ─────────────────────────────────────────────────────────────────────────────
grant all on public.profiles, public.requests, public.request_files,
  public.notification_settings, public.whatsapp_outbox, public.app_config to service_role;
grant select on public.profiles, public.requests, public.request_files,
  public.notification_settings, public.whatsapp_outbox to authenticated;
-- brokerii pot modifica DOAR câmpurile de lucru, nu datele clientului
grant update (status, assigned_to, notes) on public.requests to authenticated;
grant update (instant_new_request, daily_digest, digest_hour, stale_days, updated_at)
  on public.notification_settings to authenticated;
grant delete on public.requests, public.request_files to authenticated; -- RLS restrânge la admin
-- rolul anon nu primește nimic: scrierile publice trec prin Edge Functions.

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.request_files enable row level security;

-- profiles: fiecare își vede profilul; adminul le vede pe toate.
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- requests: brokerii văd DOAR cererile care le sunt asignate; adminul vede tot
-- (cererile intră neasignate și adminul le distribuie). Doar adminul poate șterge.
create policy "requests_select_assigned_or_admin" on public.requests
  for select to authenticated
  using (assigned_to = auth.uid() or public.is_admin());

create policy "requests_update_assigned_or_admin" on public.requests
  for update to authenticated
  using (assigned_to = auth.uid() or public.is_admin())
  with check (true);

create policy "requests_delete_admin" on public.requests
  for delete to authenticated
  using (public.is_admin());

-- Câmpurile clientului nu pot fi modificate din panou — doar cele de lucru.
create or replace function public.guard_request_update()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.type_id := old.type_id;
    new.reasons := old.reasons;
    new.reason_text := old.reason_text;
    new.extra := old.extra;
    new.referral_id := old.referral_id;
    new.name := old.name;
    new.phone := old.phone;
    new.city := old.city;
    new.gdpr_consent := old.gdpr_consent;
    new.short_id := old.short_id;
    new.created_at := old.created_at;
    -- doar adminul poate schimba responsabilul
    if not public.is_admin() then
      new.assigned_to := old.assigned_to;
    end if;
  end if;
  return new;
end;
$$;

create trigger requests_guard_update
  before update on public.requests
  for each row execute function public.guard_request_update();

-- request_files: vizibile doar dacă vezi cererea; scrierea vine din Edge Functions.
create policy "request_files_select_visible_request" on public.request_files
  for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id
        and (r.assigned_to = auth.uid() or public.is_admin())
    )
  );

create policy "request_files_delete_admin" on public.request_files
  for delete to authenticated
  using (public.is_admin());

alter table public.notification_settings enable row level security;
alter table public.whatsapp_outbox enable row level security;
alter table public.app_config enable row level security;

-- fiecare își vede/editează propriile preferințe; adminul le vede pe toate
create policy "notification_settings_select" on public.notification_settings
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "notification_settings_update_own" on public.notification_settings
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- jurnalul WhatsApp e vizibil doar adminului (conține linkuri de resetare)
create policy "whatsapp_outbox_select_admin" on public.whatsapp_outbox
  for select to authenticated
  using (public.is_admin());
-- app_config: fără politici — accesibil doar cu service role.

-- Cererile noi apar live în panoul de admin (Realtime).
alter publication supabase_realtime add table public.requests;

-- ─────────────────────────────────────────────────────────────────────────────
-- Digest zilnic: cron orar → funcția edge send-digest
-- URL-ul funcțiilor și secretul vin din app_config (seed local / DEPLOY.md cloud).
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.trigger_digest()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  fn_url text;
  secret text;
begin
  select value into fn_url from public.app_config where key = 'functions_url';
  select value into secret from public.app_config where key = 'digest_secret';
  if fn_url is null or secret is null then
    raise notice 'digest: app_config incomplet, sar peste';
    return;
  end if;
  perform net.http_post(
    url := fn_url || '/send-digest',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-digest-secret', secret),
    body := '{}'::jsonb
  );
end;
$$;

select cron.schedule('send-digest-hourly', '5 * * * *', $$select public.trigger_digest()$$);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: bucket privat pentru fișierele cererilor
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-files',
  'request-files',
  false,
  10485760, -- 10 MB per fișier
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do nothing;

-- Fișierele din storage urmează aceeași regulă de vizibilitate ca cererea
-- (calea e requests/<request_id>/<fișier>); upload-ul se face doar cu service role.
create policy "request_files_storage_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'request-files'
    and exists (
      select 1 from public.requests r
      where r.id::text = (storage.foldername(name))[2]
        and (r.assigned_to = auth.uid() or public.is_admin())
    )
  );
