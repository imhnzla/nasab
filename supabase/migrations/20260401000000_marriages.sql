-- Feature 1: marriages table + persons gender + mother_id + photo_url
-- Run: npx supabase db push

CREATE TABLE marriages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  husband_id       uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  wife_id          uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  date_hijri       text,
  date_gregorian   date,
  order_num        integer NOT NULL DEFAULT 1,
  is_verified      boolean NOT NULL DEFAULT false,
  notes_ar         text,
  notes_en         text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marriages_unique_pair UNIQUE (husband_id, wife_id)
);

CREATE INDEX marriages_husband_id_idx ON marriages(husband_id);
CREATE INDEX marriages_wife_id_idx    ON marriages(wife_id);

CREATE TRIGGER marriages_updated_at
  BEFORE UPDATE ON marriages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE marriages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marriages_public_read" ON marriages
  FOR SELECT USING (true);

CREATE POLICY "marriages_admin_insert" ON marriages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
  );

CREATE POLICY "marriages_admin_update" ON marriages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
  );

-- Add gender, mother linkage, photo to persons
ALTER TABLE persons
  ADD COLUMN gender      text NOT NULL DEFAULT 'male'
    CHECK (gender IN ('male', 'female', 'unknown')),
  ADD COLUMN mother_id   uuid REFERENCES persons(id) ON DELETE SET NULL,
  ADD COLUMN marriage_id uuid REFERENCES marriages(id) ON DELETE SET NULL,
  ADD COLUMN photo_url   text;

CREATE INDEX persons_gender_idx    ON persons(gender);
CREATE INDEX persons_mother_id_idx ON persons(mother_id);
