# verify-submission

Walk through the full verification workflow for a pending lineage submission.

Usage: `/verify-submission <submission-id>`

## Instructions

The argument is the submission ID (UUID): $ARGUMENTS

1. **Fetch the submission** from the database including:
   - Submitter details
   - Claimed father node
   - All proof documents (generate signed URLs)
   - Current status and history from `audit_log`

2. **Display a structured review summary:**
   ```
   Submission: {id}
   Submitted by: {user email}
   Claimed full name (AR): {name_ar}
   Claimed full name (EN): {name_en}
   Claimed father: {father name} (generation {n})
   Proof documents: {count} file(s)
   Status: {current status}
   ```

3. **Guide the review** by asking:
   - Does the Arabic name follow established naming conventions for this lineage?
   - Do the proof documents match the accepted proof types? (physical shajra, official certificate, scholar attestation, corroborating sources)
   - Is there any conflict with existing tree data?

4. **Prompt for decision:** approve, reject, or request additional evidence.
   - If approve: generate the SQL to insert a new `persons` record and update submission status
   - If reject: ask for rejection reason text (will be sent to user via email)
   - If request evidence: ask what specific evidence is needed

5. **Log the action** in `audit_log` and update `docs/build-logs/phase-4.md`.

Never approve a submission without at least one accepted proof document on file.
