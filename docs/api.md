# API Design

## Two API Layers

| Layer | Purpose | Base Path | Auth |
|-------|---------|-----------|------|
| tRPC | Internal (Next.js frontend only) | `/api/trpc/` | Session cookie |
| REST v1 | Public (external developers) | `/api/v1/` | None (read) / Bearer (write) |

---

## Public REST API v1

**Base URL:** `https://nasab.org/api/v1`
**Rate limit:** 100 requests/minute per IP. Returns `429` with `Retry-After` header when exceeded.
**Format:** JSON. All responses wrapped in an envelope.

### Response Envelope

```json
{
  "data": { ... },
  "meta": {
    "version": "1",
    "timestamp": "2026-01-01T00:00:00Z",
    "total": 1234,
    "page": 1,
    "per_page": 50
  }
}
```

Error responses:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Person not found"
  }
}
```

---

### Endpoints

#### GET /persons
List all verified persons (paginated).

Query params:
- `page` (default: 1)
- `per_page` (default: 50, max: 200)
- `branch` — filter by `hasanid`, `husaynid`, `hashemite`
- `tradition` — filter by `sunni`, `shia`, `both`
- `generation` — filter by generation number

#### GET /persons/:id
Single person with full biography and sources.

Response includes:
- Full person fields
- `ancestry_path`: array of ancestors from root to this person
- `children_count`: number of direct children

#### GET /persons/:id/descendants
Subtree rooted at this person.

Query params:
- `depth` (default: 3, max: 10) — how many generations down

#### GET /search
Fuzzy search across persons.

Query params:
- `q` (required) — search query, supports Arabic and English
- `tradition` — optional filter
- `branch` — optional filter

#### GET /branches
Summary statistics per branch.

```json
{
  "data": {
    "hasanid": { "total": 450, "verified": 320 },
    "husaynid": { "total": 680, "verified": 510 },
    "hashemite": { "total": 120, "verified": 90 }
  }
}
```

#### POST /submissions *(requires Bearer token)*
Submit a lineage claim. Multipart form data.

Fields: `full_name_ar`, `full_name_en`, `claimed_father_id`, `proof_documents[]` (PDF files)

#### GET /submissions/:id *(requires Bearer token)*
Status of own submission.

---

## tRPC Routers (Internal)

| Router | Key Procedures |
|--------|---------------|
| `persons` | `list`, `byId`, `create` (admin), `update` (admin), `search` |
| `submissions` | `create`, `mySubmissions`, `byId`, `updateStatus` (verifier+) |
| `users` | `me`, `updateProfile`, `updateRole` (admin) |
| `admin` | `allSubmissions`, `auditLog`, `ocrJobs` |
| `search` | `fuzzy` |

All tRPC procedures use Zod for input validation. Error codes follow tRPC's `TRPCError` conventions.

---

## Authentication for REST API

For authenticated endpoints, send a Supabase JWT:
```
Authorization: Bearer <supabase-access-token>
```

Obtain the token from Supabase Auth after login. Tokens expire after 1 hour; use the refresh token to get a new one.
