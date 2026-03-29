# check-rls

Audit all Supabase tables to verify Row Level Security is enabled and policies are correct.

Usage: `/check-rls`

## Instructions

Run the following audit and report findings:

1. **Query all tables** in the public schema:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. **Flag any table with `rowsecurity = false`** — this is a critical security issue.

3. **List all existing policies** per table:
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, cmd;
   ```

4. **Check coverage** — every table should have policies for each operation it supports:
   - `persons`: SELECT (public), INSERT/UPDATE/DELETE (admin only)
   - `submissions`: SELECT (own + verifier/admin), INSERT (authenticated), UPDATE (verifier/admin)
   - `users`: SELECT (own + admin), UPDATE (own)
   - `audit_log`: SELECT (admin), INSERT (service_role via trigger)

5. **Report format:**
   ```
   ✅ persons — RLS enabled, 4 policies
   ❌ ocr_jobs — RLS DISABLED (critical)
   ⚠️  submissions — missing UPDATE policy for user self-update
   ```

6. For any missing policy, generate the SQL to create it and ask for confirmation before applying.
