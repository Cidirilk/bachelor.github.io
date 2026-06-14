-- Allowed guests (phone numbers kept server-side only)
CREATE TABLE IF NOT EXISTS allowed_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_normalized TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RSVP responses (one per guest, upsert on guest_id)
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL UNIQUE REFERENCES allowed_guests(id) ON DELETE CASCADE,
  friday_dinner BOOLEAN NOT NULL DEFAULT false,
  friday_sleep BOOLEAN NOT NULL DEFAULT false,
  saturday_breakfast BOOLEAN NOT NULL DEFAULT false,
  saturday_lunch BOOLEAN NOT NULL DEFAULT false,
  saturday_dinner BOOLEAN NOT NULL DEFAULT false,
  saturday_sleep BOOLEAN NOT NULL DEFAULT false,
  sunday_breakfast BOOLEAN NOT NULL DEFAULT false,
  allergies TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_allowed_guests_phone ON allowed_guests(phone_normalized);

-- Enable Row Level Security — no public policies (edge functions use service role)
ALTER TABLE allowed_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at on RSVP changes
CREATE OR REPLACE FUNCTION update_rsvp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_rsvp_timestamp();
