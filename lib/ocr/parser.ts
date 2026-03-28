// Urdu shajra text parser — extracts name/relationship structure
// Phase 2 — See .claude/agents/ocr-pdf-pipeline.md

export interface DraftPerson {
  name_ur: string
  name_ar?: string
  father_name_ur?: string
  generation_depth: number
}

/** Parse raw OCR text from a shajra page into draft person records */
export function parseShajraText(rawText: string): DraftPerson[] {
  // TODO: Phase 2 — implement ibn/bin/bint pattern matching + indentation depth
  return []
}
