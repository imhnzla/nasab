-- Urdu name support
ALTER TABLE persons ADD COLUMN name_ur text;

-- Geographic data
ALTER TABLE persons
  ADD COLUMN birth_city    text,
  ADD COLUMN birth_country text,
  ADD COLUMN death_city    text,
  ADD COLUMN death_country text,
  ADD COLUMN lat           double precision,
  ADD COLUMN lng           double precision;

CREATE INDEX persons_birth_country_idx ON persons(birth_country);

-- Change requests table
CREATE TABLE change_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id        uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_changes jsonb NOT NULL DEFAULT '{}',
  status           text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id      uuid REFERENCES users(id),
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_requests_user_select" ON change_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "change_requests_user_insert" ON change_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "change_requests_admin_all" ON change_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
  );

-- Bookmarks table
CREATE TABLE bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_id  uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  label      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, person_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_owner" ON bookmarks
  FOR ALL USING (user_id = auth.uid());
  