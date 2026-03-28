# Database Schema

All tables live in Supabase (PostgreSQL 15+) under the `public` schema. Row Level Security is enabled on every table.

---

## persons

The core tree node. Every individual in the genealogical tree is one row.

```sql
CREATE TABLE persons (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar               text NOT NULL,           -- Arabic canonical name (source of truth)
  name_en               text NOT NULL,           -- IJMES English transliteration
  father_id             uuid REFERENCES persons(id) ON DELETE SET NULL,
  branch                text CHECK (branch IN ('hasanid', 'husaynid', 'hashemite')),
  scholarly_tradition   text CHECK (scholarly_tradition IN ('sunni', 'shia', 'both')),
  generation            integer,                 -- 1 = Prophet Muhammad (pbuh)
  birth_date_hijri      text,                   -- e.g. "12 Rabi al-Awwal 570"
  death_date_hijri      text,
  birth_date_gregorian  date,
  death_date_gregorian  date,
  bio_ar                text,
  bio_en                text,
  sources               jsonb NOT NULL DEFAULT '[]',  -- [{ title, author?, url?, type }]
  titles                jsonb NOT NULL DEFAULT '[]',  -- ["Imam", "Sayyid", ...]
  is_verified           boolean NOT NULL DEFAULT false,
  is_living             boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX persons_father_id_idx ON persons(father_id);
CREATE INDEX persons_generation_idx ON persons(generation);
CREATE INDEX persons_branch_idx ON persons(branch);
CREATE INDEX persons_name_ar_trgm_idx ON persons USING gin(name_ar gin_trgm_ops);
CREATE INDEX persons_name_en_trgm_idx ON persons USING gin(name_en gin_trgm_ops);
```

### RLS Policies
```sql
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "public_read" ON persons FOR SELECT USING (true);

-- Only admins can write
CREATE POLICY "admin_insert" ON persons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin')));

CREATE POLICY "admin_update" ON persons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin')));
```

---

## submissions

Lineage claims submitted by users, awaiting verification.

```sql
CREATE TABLE submissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claimed_father_id   uuid REFERENCES persons(id),
  full_name_ar        text NOT NULL,
  full_name_en        text NOT NULL,
  proof_documents     jsonb NOT NULL DEFAULT '[]',  -- [{ filename, storage_path, uploaded_at }]
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','under_review','approved','rejected')),
  verifier_id         uuid REFERENCES users(id),
  verifier_notes      text,
  rejection_reason    text,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  reviewed_at         timestamptz,
  can_resubmit_after  timestamptz   -- set on rejection
);

CREATE INDEX submissions_user_id_idx ON submissions(user_id);
CREATE INDEX submissions_status_idx ON submissions(status);
CREATE INDEX submissions_verifier_id_idx ON submissions(verifier_id);
```

---

## users

Extended profile for authenticated users. Extends `auth.users`.

```sql
CREATE TABLE users (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     text,
  role             text NOT NULL DEFAULT 'user'
                     CHECK (role IN ('user','verifier','admin','superadmin')),
  preferred_locale text NOT NULL DEFAULT 'ar' CHECK (preferred_locale IN ('ar','en')),
  linked_person_id uuid REFERENCES persons(id),  -- if user is a verified tree node
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---

## audit_log

Immutable ledger of all changes to persons and submissions.

```sql
CREATE TABLE audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   text NOT NULL,
  record_id    uuid NOT NULL,
  action       text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by   uuid REFERENCES users(id),
  old_data     jsonb,
  new_data     jsonb,
  ip_address   inet,
  changed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_record_idx ON audit_log(table_name, record_id);
CREATE INDEX audit_log_changed_by_idx ON audit_log(changed_by);
```

No UPDATE or DELETE policies — insert-only via database trigger or service_role.

---

## ocr_jobs *(Phase 2)*

Tracks Urdu PDF digitisation jobs.

```sql
CREATE TABLE ocr_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file     text NOT NULL,    -- Supabase Storage path
  status          text NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing','review','approved','imported','failed')),
  page_count      integer,
  parsed_count    integer DEFAULT 0,
  approved_count  integer DEFAULT 0,
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);
```

---

## Sources JSON Schema

The `sources` column on `persons` is a JSONB array:

```json
[
  {
    "title": "Maqatil al-Talibiyyin",
    "author": "Abu al-Faraj al-Isfahani",
    "year_hijri": "284",
    "url": "https://...",
    "type": "classical_text"
  }
]
```

Types: `classical_text`, `manuscript`, `certificate`, `modern_reference`, `institutional`
