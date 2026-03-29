-- Phase 0 — Initial Schema
-- Creates core tables: persons, users, audit_log
-- Enable pg_trgm for fuzzy search on Arabic/English names

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── persons ──────────────────────────────────────────────────────────────────
CREATE TABLE persons (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar               text NOT NULL,
  name_en               text NOT NULL,
  father_id             uuid REFERENCES persons(id) ON DELETE SET NULL,
  branch                text CHECK (branch IN ('hasanid', 'husaynid', 'hashemite')),
  scholarly_tradition   text CHECK (scholarly_tradition IN ('sunni', 'shia', 'both')),
  generation            integer,
  birth_date_hijri      text,
  death_date_hijri      text,
  birth_date_gregorian  date,
  death_date_gregorian  date,
  bio_ar                text,
  bio_en                text,
  sources               jsonb NOT NULL DEFAULT '[]',
  titles                jsonb NOT NULL DEFAULT '[]',
  is_verified           boolean NOT NULL DEFAULT false,
  is_living             boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX persons_father_id_idx    ON persons(father_id);
CREATE INDEX persons_generation_idx   ON persons(generation);
CREATE INDEX persons_branch_idx       ON persons(branch);
CREATE INDEX persons_name_ar_trgm_idx ON persons USING gin(name_ar gin_trgm_ops);
CREATE INDEX persons_name_en_trgm_idx ON persons USING gin(name_en gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER persons_updated_at
  BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     text,
  role             text NOT NULL DEFAULT 'user'
                     CHECK (role IN ('user', 'verifier', 'admin', 'superadmin')),
  preferred_locale text NOT NULL DEFAULT 'ar'
                     CHECK (preferred_locale IN ('ar', 'en')),
  linked_person_id uuid REFERENCES persons(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_role_idx ON users(role);

-- Auto-create users row on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── submissions ──────────────────────────────────────────────────────────────
CREATE TABLE submissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claimed_father_id   uuid REFERENCES persons(id),
  full_name_ar        text NOT NULL,
  full_name_en        text NOT NULL,
  proof_documents     jsonb NOT NULL DEFAULT '[]',
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  verifier_id         uuid REFERENCES users(id),
  verifier_notes      text,
  rejection_reason    text,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  reviewed_at         timestamptz,
  can_resubmit_after  timestamptz
);

CREATE INDEX submissions_user_id_idx     ON submissions(user_id);
CREATE INDEX submissions_status_idx      ON submissions(status);
CREATE INDEX submissions_verifier_id_idx ON submissions(verifier_id);

-- ─── audit_log ────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   text NOT NULL,
  record_id    uuid NOT NULL,
  action       text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by   uuid REFERENCES users(id),
  old_data     jsonb,
  new_data     jsonb,
  ip_address   inet,
  changed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_record_idx     ON audit_log(table_name, record_id);
CREATE INDEX audit_log_changed_by_idx ON audit_log(changed_by);
CREATE INDEX audit_log_changed_at_idx ON audit_log(changed_at DESC);
