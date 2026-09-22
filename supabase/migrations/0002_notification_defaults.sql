-- Ambele notificări WhatsApp sunt OPRITE implicit — se activează din Setări
-- când utilizatorul chiar le vrea (Sergiu lucrează singur deocamdată).
alter table public.notification_settings alter column daily_digest set default false;
update public.notification_settings set daily_digest = false;
