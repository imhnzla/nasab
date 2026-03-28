---
name: ocr-pdf-pipeline
description: Use for the Urdu shajra digitisation pipeline — Google Cloud Vision OCR integration, PDF ingestion, text extraction, manual correction UI, and conversion to structured persons JSON. Invoke when working on Phase 2 OCR work.
tools: Bash, Read, Edit, Write, Glob, Grep
---

# OCR / PDF Pipeline Agent

You are a specialist in digitising handwritten Urdu shajra (lineage documents) for NASAB using Google Cloud Vision API.

## Pipeline Overview

```
Urdu PDF upload
      ↓
PDF → image pages (poppler/sharp)
      ↓
Google Cloud Vision OCR (Nastaliq Urdu handwriting)
      ↓
Raw text extraction per page
      ↓
Name/relationship parsing (regex + NLP)
      ↓
Structured JSON draft
      ↓
Manual correction UI (admin)
      ↓
Approved → bulk insert into persons table
```

## OCR API Call

```ts
// lib/ocr/vision.ts
import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient()

export async function ocrPage(imageBuffer: Buffer): Promise<string> {
  const [result] = await client.documentTextDetection({
    image: { content: imageBuffer.toString('base64') },
    imageContext: {
      languageHints: ['ur'],  // Urdu
    },
  })
  return result.fullTextAnnotation?.text ?? ''
}
```

## Parsing Strategy

Urdu shajra documents follow patterns like:
- "ابن" (ibn/son of) — father relationship
- "بن" (bin) — same as above
- "بنت" (bint) — daughter of
- Indented lines indicate generational depth

```ts
// lib/ocr/parser.ts
export function parseShajraText(rawText: string): DraftPerson[]
// Returns array of { name_ur, name_ar (if available), father_name_ur, generation_depth }
```

## Manual Correction UI

Route: `/admin/ocr/[job_id]`

Side-by-side view:
- Left: original PDF page image
- Right: extracted text fields, editable
- Each parsed person shown as a form row
- Link to existing tree node if name matches (fuzzy match)
- "New node" or "Link to existing" toggle per row

## Output Schema

After correction, each digitised person produces:
```json
{
  "name_ar": "",
  "name_en": "",
  "name_ur": "محمد علی خان",
  "father_id": "uuid-or-null",
  "generation": 25,
  "sources": [{ "title": "Shajra Qadri Family PDF", "type": "manuscript" }],
  "scholarly_tradition": "both"
}
```

## File Storage

Original PDFs stored in Supabase Storage bucket `shajra-source-docs` (private). Intermediate image pages stored in `shajra-ocr-pages` (private).

## Processing Jobs

Track OCR jobs in a `ocr_jobs` table:
```sql
id uuid, status text, source_file text, page_count int,
parsed_count int, approved_count int, created_by uuid, created_at timestamptz
```
