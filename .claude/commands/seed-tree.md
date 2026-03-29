# seed-tree

Seed the database with foundational historical tree data (Prophet Muhammad's immediate lineage).

Usage: `/seed-tree`

## Instructions

Generate and apply `supabase/seed.sql` with the core ancestral chain:

1. Start with **Prophet Muhammad ibn Abdullah** (pbuh) as generation 1, root node
2. Add his direct sons and daughters relevant to the lineage (Hasanid/Husaynid branches)
3. Seed the first 5–8 generations of both the Hasanid and Husaynid lines with historically attested figures
4. All seed records must include:
   - Both Arabic canonical name and English transliteration
   - `scholarly_tradition: 'both'` (agreed upon by all schools)
   - At least one scholarly source in the `sources` field
   - Approximate Hijri birth/death dates where known

Before generating the seed data, search for any existing seed file to avoid duplicates.

After generating, show the full SQL for review before applying. Then run:
```bash
npx supabase db reset  # resets local DB and applies migrations + seed
```

Update `docs/build-logs/phase-0.md` with the seed data summary.
