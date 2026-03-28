# digitise-shajra

Start the OCR digitisation pipeline for an uploaded Urdu shajra PDF.

Usage: `/digitise-shajra <path-to-pdf>`

## Instructions

The argument is the path to the Urdu shajra PDF file: $ARGUMENTS

1. **Validate the file:**
   - Confirm it's a PDF (`file` command or magic bytes check)
   - Check file size (warn if > 50MB)
   - Count pages

2. **Upload to Supabase Storage** bucket `shajra-source-docs`:
   ```bash
   npx supabase storage cp "$FILE" ss://shajra-source-docs/$(basename "$FILE")
   ```

3. **Create an OCR job record** in the `ocr_jobs` table with status `processing`.

4. **Convert PDF pages to images** (requires poppler installed):
   ```bash
   pdftoppm -r 300 "$FILE" /tmp/shajra-pages/page
   ```

5. **Run Google Cloud Vision** on each page image using `lib/ocr/vision.ts`. Save extracted text per page.

6. **Parse the raw text** using `lib/ocr/parser.ts` to extract name/relationship structures.

7. **Open the correction UI** — tell the user to navigate to `/admin/ocr/{job_id}` to review and correct the extracted names before final import.

8. **Print a progress summary:**
   ```
   Pages processed: {n}
   Names extracted: {n}
   Confidence high (>90%): {n}
   Needs manual review: {n}
   Job ID: {uuid} → /admin/ocr/{uuid}
   ```

This command only starts the pipeline. Final insertion into `persons` happens after manual review in the admin UI.
