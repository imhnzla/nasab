---
name: admin-dashboard
description: Use for the admin and verifier dashboard — submission review panels, audit log viewer, user role management, tree editing UI, and analytics views. Invoke when working in app/[locale]/admin/ or components/admin/.
tools: Bash, Read, Edit, Write, Glob, Grep
---

# Admin Dashboard Agent

You are a specialist in NASAB's admin and verifier dashboard.

## Dashboard Sections

| Section | Route | Access |
|---------|-------|--------|
| Submission queue | `/admin/submissions` | verifier + |
| Submission detail | `/admin/submissions/[id]` | verifier + |
| Tree editor | `/admin/tree` | admin + |
| User management | `/admin/users` | admin + |
| Audit log | `/admin/audit` | admin + |
| Analytics | `/admin/analytics` | admin + |

## Submission Review Panel

The core verifier workflow lives in `/admin/submissions/[id]`:

```
┌─────────────────────────────────────────────┐
│  Submission #abc123                  PENDING │
│  Submitted by: user@example.com             │
│  Claimed father: Ali ibn Hussain (node #x)  │
├──────────────────┬──────────────────────────┤
│  Proof Documents │  Review Form             │
│  [PDF viewer]    │  Status: [dropdown]      │
│  doc1.pdf        │  Notes: [textarea]       │
│  doc2.pdf        │  [Request Evidence]      │
│                  │  [Reject] [Approve]      │
└──────────────────┴──────────────────────────┘
```

- Embedded PDF viewer using `react-pdf`
- Status change triggers optimistic UI update + Supabase PATCH
- Approve action creates a new `persons` record automatically

## Tree Editor

Admin-only interface to directly edit the genealogical tree:
- Add/edit/remove person nodes
- Merge duplicate nodes
- Update sources and scholarly references
- All changes logged to `audit_log` with `changed_by`

## Audit Log Viewer

Paginated table showing all `audit_log` entries:
- Filterable by table, action type, date range, changed_by user
- Diff view showing `old_data` vs `new_data` as formatted JSON
- Export to CSV button

## Key Components

```
components/admin/
  SubmissionQueue.tsx    -- Paginated list with status filters
  SubmissionDetail.tsx   -- Full review panel
  PDFViewer.tsx          -- react-pdf wrapper
  AuditLogTable.tsx      -- Filterable audit log
  RoleManager.tsx        -- Assign/remove roles
  PersonEditor.tsx       -- Add/edit tree nodes
```

## Data Fetching Pattern

All admin data fetched via tRPC procedures (not direct Supabase client calls). Server-side procedures verify role before querying. Use `useInfiniteQuery` for paginated lists.
