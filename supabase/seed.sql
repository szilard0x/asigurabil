-- Date demo DOAR pentru mediul local (`supabase db reset`). Nu se rulează în cloud.
insert into public.requests (type_id, reasons, reason_text, extra, referral_id, name, phone, city, gdpr_consent, status)
values
  ('rca', array['expira'], '', '{"plate": "CJ 01 ABC", "expiry": "2026-10-05"}', 'instagram',
   'Andrei Pop', '0722 111 222', 'Cluj-Napoca', true, 'nou'),
  ('sanatate', array['medicamente', 'familie'], 'Copil cu tratament lunar.', '{}', 'recomandare',
   'Ioana Mureșan', '0733 444 555', 'Turda', true, 'contactat'),
  ('calatorii', array['vacanta'], '', '{"destination": "Grecia", "period": "10-20 iulie"}', 'facebook',
   'Vlad Ionescu', '0744 666 777', null, true, 'ofertat'),
  ('casco', array['noua'], '', '{}', 'google',
   'Maria Câmpean', '0755 888 999', 'Dej', true, 'castigat');

-- o cerere „uitată" (neschimbată de 5 zile) ca să aibă ce raporta digestul;
-- triggerul touch_updated_at ar suprascrie data, așa că îl oprim pe durata update-ului
alter table public.requests disable trigger requests_touch_updated_at;
update public.requests
  set updated_at = now() - interval '5 days', created_at = now() - interval '6 days'
  where name = 'Ioana Mureșan';
alter table public.requests enable trigger requests_touch_updated_at;

-- configurarea jobului cron pentru mediul local (URL-ul intern al gateway-ului Kong)
insert into public.app_config (key, value) values
  ('functions_url', 'http://supabase_kong_asigurabil:8000/functions/v1'),
  ('digest_secret', 'local-digest-secret')
on conflict (key) do update set value = excluded.value;
