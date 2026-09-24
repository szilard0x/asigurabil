-- Brokerii trebuie să fie rapizi: pragul „cerere uitată" se măsoară în ORE, nu
-- în zile. Valorile existente se convertesc (zile × 24, plafonate la o săptămână).
alter table public.notification_settings rename column stale_days to stale_hours;
alter table public.notification_settings drop constraint notification_settings_stale_days_check;
update public.notification_settings set stale_hours = least(stale_hours * 24, 168);
alter table public.notification_settings
  add constraint notification_settings_stale_hours_check check (stale_hours between 1 and 168);
alter table public.notification_settings alter column stale_hours set default 24;
