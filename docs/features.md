# Features

## Core Launch Features (Phase 1–4)

### 1. Interactive Family Tree Visualisation
- Top-down hierarchical tree rooted at Prophet Muhammad (pbuh)
- Zoom, pan, and collapse/expand subtrees
- Branch filtering: Hasanid (green), Husaynid (navy), Hashemite (gold)
- Colour-coded nodes by scholarly tradition (Sunni / Shia / Both)
- Generation number badge on every node
- Mobile-responsive with touch gesture support

### 2. Person Detail Panel
- Full Arabic canonical name + English transliteration
- Dates: Hijri and Gregorian (birth and death)
- Honorific titles (Imam, Sayyid, Sharif, etc.)
- Generation count from the Prophet
- Biography in Arabic and English
- Scholarly sources (clickable references)
- Sunni and Shia attestation status shown side-by-side if they differ

### 3. Search
- Search by Arabic name (diacritic-insensitive fuzzy match)
- Search by English transliteration
- Results show generation number and branch
- Clicking a result centres the tree on that node and opens the detail panel

### 4. User Accounts
- Email/password registration with email confirmation
- Google OAuth login
- User dashboard: view submitted claims, status tracking
- Privacy settings: choose whether to appear publicly in the tree

### 5. Lineage Submission Portal
- Multi-step form to submit a personal lineage claim
- Upload proof documents (PDF only, max 20MB each)
- Real-time status tracking (pending → under review → approved/rejected)
- Email notifications at each status change
- Resubmission allowed 30 days after rejection

### 6. Verification System
- Role-based verifier accounts (appointed by admins)
- Submission review panel with embedded PDF viewer
- Evidence request workflow (email-based)
- Approval creates a new verified node in the tree automatically

### 7. Admin Dashboard
- Submission queue with filters and bulk actions
- Tree editing interface (add/edit/merge nodes)
- User and role management
- Audit log with full change history
- OCR job management

### 8. Urdu PDF Digitisation (Phase 2)
- Upload handwritten Urdu shajra PDFs
- Google Cloud Vision OCR pipeline
- Manual correction UI for extracted names
- Bulk import to the tree after review

## Planned Future Features (Phase 5+)

### Public API (Phase 5)
Read-only REST API for researchers and institutional partners:
- Paginated person list
- Subtree traversal
- Ancestry path query (shortest path between two nodes)
- Bulk export (JSON / CSV)

### Institutional Partnerships (Phase 6)
- Verified institution badges on person nodes
- Bulk import from partner databases
- White-label embed for institutional websites

### Scale & Polish (Phase 7)
- Urdu and Persian language support
- Academic citation export (BibTeX, Chicago)
- Advanced analytics (lineage statistics, geographic distribution)
- Mobile app (React Native)

## User Roles

| Role | What They Can Do |
|------|-----------------|
| Anonymous | Browse tree, search, view person details |
| User | All anonymous + submit lineage claims, manage own profile |
| Verifier | All user + review assigned submissions, approve/reject |
| Admin | All verifier + edit tree directly, manage users and roles |
| Superadmin | All admin + delete records, system configuration |
