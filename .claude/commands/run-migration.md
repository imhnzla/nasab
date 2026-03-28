# run-migration

Create and apply a new Supabase database migration safely.

Usage: `/run-migration <description>`

## Instructions

The argument is a short description of the migration: $ARGUMENTS

1. **Create the migration file:**
   ```bash
   npx supabase migration new <description-in-snake-case>
   ```
   This creates `supabase/migrations/{timestamp}_{description}.sql`.

2. **Write the migration SQL** with:
   - Forward migration (the change)
   - A rollback comment block at the bottom:
     ```sql
     -- ROLLBACK:
     -- DROP TABLE IF EXISTS ...;
     -- ALTER TABLE ... DROP COLUMN ...;
     ```
   - RLS policies for any new table
   - Indexes for any foreign key or frequently-queried column

3. **Show the full SQL** for review before applying.

4. **Apply the migration:**
   ```bash
   npx supabase db push
   ```

5. **Regenerate TypeScript types:**
   ```bash
   npx supabase gen types typescript --local > lib/supabase/types.ts
   ```

6. **Log it** in the relevant phase's build log under `docs/build-logs/`.

Never run `supabase db reset` in this command — that destroys all data. Only use `db push`.
