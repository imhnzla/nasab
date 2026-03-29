-- Phase 1: search_persons RPC function for fuzzy Arabic/English name search
-- Called by tRPC search.fuzzy via supabase.rpc('search_persons', ...)
-- Requires pg_trgm extension (enabled in 20260329000002_phase1_search_indexes.sql)

CREATE OR REPLACE FUNCTION search_persons(
  query text,
  branch_filter text DEFAULT NULL,
  result_limit int DEFAULT 20
)
RETURNS SETOF persons
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM persons
  WHERE is_verified = true
    AND (
      name_ar % query
      OR name_en % query
      OR name_ar ILIKE '%' || query || '%'
      OR name_en ILIKE '%' || query || '%'
    )
    AND (branch_filter IS NULL OR branch = branch_filter)
  ORDER BY GREATEST(similarity(name_ar, query), similarity(name_en, query)) DESC
  LIMIT result_limit;
$$;
