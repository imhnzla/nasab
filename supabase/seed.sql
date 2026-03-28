-- NASAB Seed Data
-- Phase 0 — Root node only. Run /seed-tree to generate full historical seed.
-- Apply with: npx supabase db reset

INSERT INTO persons (name_ar, name_en, branch, scholarly_tradition, generation, sources, is_verified)
VALUES (
  'محمد بن عبد الله',
  'Muhammad ibn Abdullah',
  'hashemite',
  'both',
  1,
  '[{"title": "Al-Sira al-Nabawiyya", "author": "Ibn Hisham", "type": "classical_text"}]',
  true
);
