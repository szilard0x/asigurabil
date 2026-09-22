-- asigurabil.ro — schema inițială: profiluri cu roluri, cereri de ofertă, fișiere atașate.
-- Scrierile publice se fac EXCLUSIV prin Edge Functions (service role); rolul anon nu are
-- niciun drept de scriere.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tipuri
-- ─────────────────────────────────────────────────────────────────────────────
create type public.app_role as enum ('admin', 'broker');
create type public.request_status as enum ('nou', 'contactat', 'ofertat', 'inchis');

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiluri (oglindă a auth.users, cu rol)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'broker',
  -- oglindește ban-ul din auth (setat de funcția invite-user la dezactivare)
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Creat automat la fiecare utilizator nou; rolul vine din metadata invitației.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'broker')
  );
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
grant all on public.profiles, public.requests, public.request_files to service_role;
grant select on public.profiles, public.requests, public.request_files to authenticated;
-- brokerii pot modifica DOAR câmpurile de lucru, nu datele clientului
grant update (status, assigned_to, notes) on public.requests to authenticated;
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

-- requests: orice broker autentificat vede tot și poate actualiza
-- status / notes / assigned_to; doar adminul poate șterge.
create policy "requests_select_authenticated" on public.requests
  for select to authenticated
  using (true);

create policy "requests_update_authenticated" on public.requests
  for update to authenticated
  using (true)
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
  end if;
  return new;
end;
$$;

create trigger requests_guard_update
  before update on public.requests
  for each row execute function public.guard_request_update();

-- request_files: doar citire pentru brokeri; scrierea vine din Edge Functions.
create policy "request_files_select_authenticated" on public.request_files
  for select to authenticated
  using (true);

create policy "request_files_delete_admin" on public.request_files
  for delete to authenticated
  using (public.is_admin());

-- Cererile noi apar live în panoul de admin (Realtime).
alter publication supabase_realtime add table public.requests;

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

-- Brokerii autentificați pot citi fișierele; upload-ul se face doar cu service role.
create policy "request_files_storage_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'request-files');
