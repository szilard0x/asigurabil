-- Pasul de WhatsApp de la finalul formularului public a fost eliminat: clienții
-- trimit cererea direct din site, iar echipa află prin notificarea instant pe
-- WhatsApp (Twilio). Notificarea devine canalul principal de lead-uri, deci e
-- PORNITĂ implicit; raportul zilnic rămâne opțional.
alter table public.notification_settings alter column instant_new_request set default true;
update public.notification_settings set instant_new_request = true;
