# Verification Workflow

## Overview

All lineage claims go through a structured 10-step verification process before appearing in the public tree. This ensures scholarly integrity and prevents fraudulent claims.

## Status Flow

```
                    ┌──────────────┐
                    │   pending    │  ← User submits claim
                    └──────┬───────┘
                           │ Auto-assigned to verifier
                    ┌──────▼───────┐
                    │ under_review │  ← Verifier reviewing
                    └──────┬───────┘
               ┌───────────┴───────────┐
        ┌──────▼──────┐         ┌──────▼──────┐
        │  approved   │         │  rejected   │
        └──────┬──────┘         └──────┬──────┘
               │                       │
       New persons node         Email to user
       created automatically    (can resubmit after 30 days)
```

## 10-Step Process

1. **User registers** and completes email verification
2. **User fills submission form** — full name in Arabic and English, claimed father (linked to existing tree node), uploads proof documents (PDF, max 20MB each, up to 5 files)
3. **System validates** file types (PDF only), file sizes, and that claimed father exists in the tree
4. **Submission stored** with status `pending`; user receives confirmation email
5. **System auto-assigns** to an available verifier (round-robin by current workload)
6. **Verifier notified** by email; submission appears in their review queue
7. **Verifier reviews** in the admin dashboard:
   - Reads proof documents in embedded PDF viewer
   - Checks name against Islamic naming conventions
   - Checks for conflicts with existing tree nodes
   - Assesses document authenticity and credibility
8. **Verifier decides:**
   - **Approve** → fills optional notes → submits → system creates `persons` record automatically → user notified
   - **Reject** → must provide reason → `can_resubmit_after` set to 30 days from now → user notified with reason
   - **Request evidence** → sends email to user specifying what's needed → status stays `under_review`
9. **On approval**, a full `audit_log` entry is created recording who approved, when, and what changed
10. **New node appears** in the public tree with `is_verified = true`

## Accepted Proof Types

| Type | Weight | Notes |
|------|--------|-------|
| Physical shajra manuscript (Urdu/Arabic PDF) | High | Must be legible, multi-generational |
| Official government lineage certificate | High | Common in Arab states, Pakistan, Iran |
| Scholar attestation letter | Medium | Must name the scholar with verifiable credentials |
| Two independent corroborating historical sources | Medium | Classical texts or academic papers |
| Oral tradition with supporting documents | Low | Insufficient alone; must accompany other evidence |

## Evidence Request Process

When a verifier needs more evidence:
1. Verifier clicks "Request Evidence" and types a specific request
2. System emails the submitter with the verifier's request
3. Submitter can upload additional documents via their dashboard
4. Submission returns to the top of the verifier's queue

## Roles and Permissions

| Action | User | Verifier | Admin | Superadmin |
|--------|------|----------|-------|------------|
| Submit claim | ✅ | ✅ | ✅ | ✅ |
| View own submissions | ✅ | ✅ | ✅ | ✅ |
| View all submissions | ❌ | ✅ (assigned only) | ✅ | ✅ |
| Approve / Reject | ❌ | ✅ | ✅ | ✅ |
| Assign verifiers | ❌ | ❌ | ✅ | ✅ |
| Delete submissions | ❌ | ❌ | ❌ | ✅ |

## Scholarly Standards

Where **Sunni and Shia traditions differ** on a lineage:
- Both traditions' versions are preserved as separate nodes or noted in the biography
- The `scholarly_tradition` field indicates which tradition attests the claim
- Nodes with `scholarly_tradition = 'both'` are agreed upon by all schools
- The platform takes no position on disputed claims — both are shown with their sources
