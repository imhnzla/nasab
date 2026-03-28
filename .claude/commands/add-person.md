# add-person

Add a verified historical person node to the NASAB family tree.

Usage: `/add-person` (interactive) or `/add-person <name in Arabic>`

## Instructions

The argument (if provided) is the person's Arabic name: $ARGUMENTS

Guide through adding a complete, verified person record:

1. **Collect required fields:**
   - `name_ar` — full Arabic name (required)
   - `name_en` — English transliteration (required)
   - `father_id` — search existing `persons` table by name and confirm the correct match
   - `branch` — one of: `hasanid`, `husaynid`, `hashemite`
   - `scholarly_tradition` — `sunni`, `shia`, or `both`
   - `generation` — integer, counted from Prophet Muhammad (pbuh) = generation 1
   - `sources` — at least one source: `[{ title, author?, url? }]`

2. **Validate before insert:**
   - Confirm no duplicate exists (search by `name_ar`)
   - Confirm the father exists in the tree
   - Generation must equal father's generation + 1

3. **Generate the SQL insert** or tRPC call and show it to the user for confirmation before executing.

4. **After insertion**, update `docs/build-logs/phase-1.md` with a note of the new person added.

Always show the Arabic name in its canonical vowelled form if possible, and check that the English transliteration follows the IJMES (International Journal of Middle East Studies) transliteration standard.
