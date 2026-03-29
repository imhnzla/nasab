-- Phase 1: pg_trgm extension + indexes for fuzzy Arabic/English name search
-- and performance indexes for tree traversal queries

-- Enable trigram extension for fuzzy search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN indexes for Arabic and English name fuzzy search
-- Used by tRPC search.fuzzy via: WHERE name_ar % $1 OR name_en % $1
CREATE INDEX IF NOT EXISTS idx_persons_name_ar_trgm
  ON persons USING gin (name_ar gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_persons_name_en_trgm
  ON persons USING gin (name_en gin_trgm_ops);

-- B-tree index for tree traversal (finding children by father_id)
CREATE INDEX IF NOT EXISTS idx_persons_father_id
  ON persons (father_id);

-- B-tree index for branch-based filtering
CREATE INDEX IF NOT EXISTS idx_persons_branch
  ON persons (branch);

-- B-tree index for generation-based queries (layered layout)
CREATE INDEX IF NOT EXISTS idx_persons_generation
  ON persons (generation);

-- Composite index for the common list query: branch + generation + verified
CREATE INDEX IF NOT EXISTS idx_persons_branch_generation_verified
  ON persons (branch, generation, is_verified);

-- ─── Rollback ─────────────────────────────────────────────────────────────────
-- To reverse this migration:
--
-- DROP INDEX IF EXISTS idx_persons_branch_generation_verified;
-- DROP INDEX IF EXISTS idx_persons_generation;
-- DROP INDEX IF EXISTS idx_persons_branch;
-- DROP INDEX IF EXISTS idx_persons_father_id;
-- DROP INDEX IF EXISTS idx_persons_name_en_trgm;
-- DROP INDEX IF EXISTS idx_persons_name_ar_trgm;
-- DROP EXTENSION IF EXISTS pg_trgm;
