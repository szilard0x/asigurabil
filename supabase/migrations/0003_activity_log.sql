-- Jurnal permanent de activitate (tab-ul „Jurnal" din panou, doar pentru admin):
-- cereri noi, invitații/ștergeri de utilizatori, rapoarte trimise, resetări de
-- parolă. Mesajele WhatsApp asociate stau în meta (wa_body) — local, cu driverul
-- mock, linkurile de invitație/resetare se deschid direct de aici.
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activity_log_created_at_idx on public.activity_log (created_at desc);
create index activity_log_type_idx on public.activity_log (type);

grant all on public.activity_log to service_role;
grant select on public.activity_log to authenticated;

alter table public.activity_log enable row level security;

create policy "activity_log_select_admin" on public.activity_log
  for select to authenticated
  using (public.is_admin());
