-- Date demo DOAR pentru mediul local (`supabase db reset`). Nu se rulează în cloud.
insert into public.requests (type_id, reasons, reason_text, extra, referral_id, name, phone, city, gdpr_consent, status)
values
  ('rca', array['expira'], '', '{"plate": "CJ 01 ABC", "expiry": "2026-10-05"}', 'instagram',
   'Andrei Pop', '0722 111 222', 'Cluj-Napoca', true, 'nou'),
  ('sanatate', array['medicamente', 'familie'], 'Copil cu tratament lunar.', '{}', 'recomandare',
   'Ioana Mureșan', '0733 444 555', 'Turda', true, 'contactat'),
  ('calatorii', array['vacanta'], '', '{"destination": "Grecia", "period": "10-20 iulie"}', 'facebook',
   'Vlad Ionescu', '0744 666 777', null, true, 'ofertat');
