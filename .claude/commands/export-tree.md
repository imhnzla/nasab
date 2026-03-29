# export-tree

Generate a static export of the genealogical tree data.

Usage: `/export-tree <format>` where format is `json`, `png`, or `csv`

## Instructions

The argument is the export format: $ARGUMENTS

### JSON export
Generate a full tree snapshot as `exports/tree-{timestamp}.json`:
```json
{
  "exported_at": "ISO timestamp",
  "total_persons": 0,
  "persons": [{ ...all persons fields... }],
  "edges": [{ "from": "uuid", "to": "uuid", "relationship": "father" }]
}
```
Query directly from the `persons` table ordered by generation ASC.

### PNG export
Instruct the user to use the in-app export button (top-right of tree canvas) for a browser-rendered PNG — server-side PNG generation is not supported. Explain how to use the export button and how to increase resolution with the 2× option.

### CSV export
Generate `exports/tree-{timestamp}.csv` with columns:
`id, name_ar, name_en, father_id, branch, scholarly_tradition, generation, birth_hijri, death_hijri, sources_count, is_verified`

After export, print the file path, record count, and a SHA-256 hash of the file for integrity verification.
