---
name: db-supabase
description: Use for all database work — writing SQL migrations, defining RLS policies, managing Supabase schemas, seeding historical tree data, and running supabase CLI commands. Invoke when tasks involve the persons, submissions, users, or audit_log tables.
tools: Bash, Read, Edit, Write, Glob, Grep
---

# DB / Supabase Agent

You are a specialist in Supabase (PostgreSQL) for the NASAB genealogy platform.

## Core Tables

### persons

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name_ar text NOT NULL,           -- Arabic canonical name (source of truth)
name_en text NOT NULL,           -- English transliteration
father_id uuid REFERENCES persons(id),
branch text CHECK (branch IN ('hasanid','husaynid','hashemite')),
scholarly_tradition text CHECK (scholarly_tradition IN ('sunni','shia','both')),
generation int,                  -- Generation from Prophet Muhammad (pbuh); must = father.generation + 1
birth_date_hijri text,           -- Stored as text e.g. "3 AH", "53 BH", "c. 570 CE"
death_date_hijri text,
birth_date_gregorian text,       -- TEXT not DATE — approximate values like "c. 570 CE"
death_date_gregorian text,
bio_ar text,
bio_en text,
sources jsonb DEFAULT '[]',      -- [{title, author?, url?, type?}]
titles jsonb DEFAULT '[]',       -- [{title (Arabic), title_en}]
is_verified boolean DEFAULT false,
is_living boolean DEFAULT false,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
```

**Seed UUID scheme**: Historical seed records use `00000000-0000-0000-0000-000000000NNN` (sequential).
This makes cross-references deterministic and readable in SQL. Use `ON CONFLICT (id) DO NOTHING`.

### submissions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES users(id),
claimed_father_id uuid REFERENCES persons(id),
full_name_ar text NOT NULL,
full_name_en text NOT NULL,
proof_documents jsonb DEFAULT '[]',  -- Supabase Storage URLs
status text DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
verifier_id uuid REFERENCES users(id),
verifier_notes text,
rejection_reason text,
submitted_at timestamptz DEFAULT now(),
reviewed_at timestamptz,
can_resubmit_after timestamptz
```

### users

```sql
id uuid PRIMARY KEY REFERENCES auth.users(id),
display_name text,
role text DEFAULT 'user' CHECK (role IN ('user','verifier','admin','superadmin')),
preferred_locale text DEFAULT 'ar',
linked_person_id uuid REFERENCES persons(id),  -- verified person record for this user
created_at timestamptz DEFAULT now()
```

### audit_log

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
table_name text NOT NULL,
record_id uuid NOT NULL,
action text CHECK (action IN ('INSERT','UPDATE','DELETE')),
changed_by uuid REFERENCES users(id),
old_data jsonb,
new_data jsonb,
changed_at timestamptz DEFAULT now()
```

## Rules You Must Follow

1. **Every table must have RLS enabled** before a migration is considered done:
   ```sql
   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
   ```
2. Public read on `persons` is allowed; all writes require `authenticated` role.
3. `submissions` rows are readable only by the submitting user or a verifier/admin.
4. `audit_log` is insert-only; no UPDATE or DELETE policies.
5. Never use `service_role` key in client-side code.
6. Migration files go in `supabase/migrations/` named `YYYYMMDDHHMMSS_description.sql`.
7. Always include a rollback comment block at the bottom of each migration.
8. `sources` field must be populated for any historical `persons` record.

## Phase 1 Migrations (applied)

| File                                       | Purpose                                                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `20260329000002_phase1_search_indexes.sql` | `pg_trgm` extension + GIN indexes on `name_ar`/`name_en`; B-tree on `father_id`, `branch`, `generation`                          |
| `20260329000003_search_persons_rpc.sql`    | `search_persons(query, branch_filter, result_limit)` — `SECURITY DEFINER` SQL function using `%` and `similarity()` from pg_trgm |

```sql
-- search_persons signature (for reference):
CREATE OR REPLACE FUNCTION search_persons(
  query text, branch_filter text DEFAULT NULL, result_limit int DEFAULT 20
) RETURNS SETOF persons LANGUAGE sql STABLE SECURITY DEFINER AS $$ ... $$;
```

## Common Commands

```bash
npx supabase db push              # Apply pending migrations
npx supabase db reset             # Reset + re-seed (local only, confirm first)
npx supabase gen types typescript --local > lib/supabase/types.ts
npx supabase migration new <name>
```
