-- Example allowed guests — replace with your real list before going live.
-- phone_normalized must be exactly 8 digits (Cyprus mobile).

INSERT INTO allowed_guests (name, phone_normalized) VALUES
  ('Charalampos', '99949434'),
  ('Chrysovalantis', '99999999')
ON CONFLICT (phone_normalized) DO NOTHING;
