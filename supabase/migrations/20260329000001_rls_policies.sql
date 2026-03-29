-- Phase 0 — Row Level Security policies for all core tables

-- ─── persons ──────────────────────────────────────────────────────────────────
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can read all persons
CREATE POLICY "persons_public_read"
  ON persons FOR SELECT
  USING (true);

-- Only admins/superadmins can insert
CREATE POLICY "persons_admin_insert"
  ON persons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- Only admins/superadmins can update
CREATE POLICY "persons_admin_update"
  ON persons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- Prevent deletion entirely (soft-delete not needed for Phase 0)
-- No DELETE policy = no one can delete via API

-- ─── users ────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row; admins can read all
CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
    )
  );

-- Users can update their own non-role fields (role changes are admin-only)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    -- Prevent self-elevation of role
    role = (SELECT role FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
    )
  );

-- Admins can update any user (including role changes)
CREATE POLICY "users_admin_update"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
    )
  );

-- Insert handled by trigger (handle_new_user) via SECURITY DEFINER
-- No manual insert policy needed

-- ─── submissions ──────────────────────────────────────────────────────────────
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own submissions; verifiers/admins can read all
CREATE POLICY "submissions_read"
  ON submissions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('verifier', 'admin', 'superadmin')
    )
  );

-- Authenticated users can create submissions
CREATE POLICY "submissions_user_insert"
  ON submissions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own pending submissions; verifiers/admins can update any
CREATE POLICY "submissions_update"
  ON submissions FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('verifier', 'admin', 'superadmin')
    )
  );

-- ─── audit_log ────────────────────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins/superadmins can read the audit log
CREATE POLICY "audit_log_admin_read"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- No UPDATE or DELETE policies — insert-only via service_role triggers
