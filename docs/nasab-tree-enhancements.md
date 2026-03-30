# Nasab Tree — Enhancement Suggestions

---

## 1. Core Gaps: Marriage & Lineage

### 1.1 Spouse Nodes & Marriage Edges

**What:** Show wives as distinct oval nodes linked to the husband with a horizontal double-line edge (the classical genealogy marriage symbol).

**Implementation:**
- New DB table: `marriages(id, husband_id, wife_id, date_hijri, date_gregorian, is_verified)`
- New node type: `spouse` alongside existing `person` — oval shape, lighter fill, no generation badge
- New edge type: `marriage` — horizontal dashed double-line between husband and wife nodes, with a marriage date label
- Spouses rendered at the same Y-level as their partner, offset left or right depending on branch
- Clicking a spouse node opens their bio, titles, dates, and a list of children from that union

---

### 1.2 Multiple Wives Per Person

**What:** Support up to 4 simultaneous spouses with numbered marriage labels and sequential date ranges.

**Implementation:**
- `marriages` table supports multiple rows per `husband_id` — no changes to `persons` table needed
- Wives stack vertically to the right of the husband node, labeled Wife 1, Wife 2…
- Each marriage edge shows the Hijri year range (e.g. "m. 245–260 AH")
- "Show all wives / Show mothers only" toggle added to BranchFilter panel
- Each marriage gets a soft tint; children inherit that tint as a small indicator dot on their node

---

### 1.3 Children → Spouse Grouping

**What:** Visually cluster children under the specific mother they belong to, using a shared bracket or sub-row.

**Implementation:**
- Draw a thin horizontal bracket above each mother's children group, labeled with the mother's name
- Child edges originate from a shared "virtual" mid-point node between husband and wife, not from the father directly
- Add `mother_id` and `marriage_id` columns to `persons`: `persons.mother_id → marriages.wife_id`
- Clicking the bracket collapses or expands that wife's subtree independently of others

---

## 2. Visualisation & Layout

### 2.1 3D Layered View (WebGL)

**What:** Render generations as horizontal planes stacked in depth — pan through centuries.

**Implementation:**
- Library: `react-three-fiber` + `@react-three/drei` — each generation is a flat `<mesh>` plane
- "2D / 3D" toggle in the Navbar; view state persists in URL via `?view=3d`
- Orbit controls: scroll to zoom through generations, drag to rotate
- Node labels rendered as floating `<Html>` billboards from `drei` — tap to open DetailPanel
- Edges rendered as bezier `<Line>` curves connecting planes, colored by branch
- Performance: frustum culling — only render nodes within 5 generations of camera focus

---

### 2.2 Radial / Sunburst Mode

**What:** Center on any ancestor and radiate outward — useful for showing how far a branch spreads from a single root.

**Implementation:**
- Library: D3's `d3.tree()` with a polar coordinate transform
- "Radial" toggle appears in the top toolbar alongside the existing branch filter
- Root node sits at the center; each ring outward = one generation
- Branch colors (green/navy/gold) tint each arc segment
- Clicking any node re-roots the diagram at that person

---

### 2.3 Timeline Axis Overlay

**What:** Pin a horizontal Hijri/Gregorian timeline ruler to the left edge; nodes snap to their birth year on the Y-axis.

**Implementation:**
- A fixed SVG ruler overlays the left 60px of the canvas, showing century markers in both calendars
- Nodes with known `birth_date_hijri` are anchored vertically to their birth year
- Nodes with missing birth dates float to a "Unplaced" lane at the bottom
- Toggle: "Chronological / Hierarchical" layout switch in the toolbar

---

### 2.4 Collapse / Expand Subtrees

**What:** Click any node to collapse its entire descendant subtree into a compact "N members" badge.

**Implementation:**
- Add a `collapsed` boolean to node state in `useNodesState`
- On collapse, hide all descendant nodes and edges; show a pill badge on the collapsed node: e.g. "▶ 47 members"
- Persist collapsed state in `localStorage` keyed to the tree root + person ID
- "Expand all / Collapse all" buttons in the Controls panel

---

## 3. Person Node Enhancements

### 3.1 Female Members

**What:** Add women to the tree — not just as spouses but as daughters, scholars, and named individuals in their own right.

**Implementation:**
- Add `gender` column to `persons`: `text CHECK (gender IN ('male', 'female', 'unknown'))`
- Female nodes use an oval/ellipse shape instead of a rectangle, with the same branch color border
- The `PersonNode` component conditionally renders `<ellipse>` vs `<rect>` based on `person.gender`
- Lineage descent through the female line supported via a separate edge type: `maternal`

---

### 3.2 Photo / Avatar Support

**What:** Display a small portrait thumbnail inside verified nodes.

**Implementation:**
- Add `photo_url text` column to `persons`, pointing to Supabase Storage
- PersonNode renders a 32×32px circular `<image>` element when `photo_url` is present
- Admin PersonEditor gets an image upload field (PDF/image, max 2MB)
- Fallback: initials avatar using the first letter of `name_ar`

---

### 3.3 Scholarly Tradition Color Ring

**What:** Show Sunni / Shia / Both attestation as a colored inner ring on the node border, distinct from the branch color.

**Implementation:**
- Sunni: green inner ring; Shia: navy; Both: split half-and-half
- Rendered as a second `<rect>` or `<circle>` with a 2px offset inside the main border
- Hovering the ring shows a tooltip: "Attested in Sunni sources / Shia sources / Both"

---

### 3.4 Living Person Privacy Mask

**What:** Nodes where `is_living = true` are shown as blurred/redacted placeholders to logged-out users.

**Implementation:**
- Apply a CSS `filter: blur(4px)` to the node content for unauthenticated sessions
- Node still appears in the tree for layout continuity; label reads "Living member (private)"
- Authenticated users linked to that person via `users.linked_person_id` can see their own node in full

---

## 4. Search & Navigation

### 4.1 Ancestry Path Finder

**What:** Select any two people and highlight the shortest ancestry path between them on the canvas.

**Implementation:**
- BFS/DFS traversal on the `persons` graph via `father_id` links
- The path edges are highlighted in amber; non-path nodes dim to 20% opacity
- Result panel shows the chain: "Person A → Person B → … → Common ancestor" with generation count
- Expose as a REST endpoint: `GET /api/path?from=uuid&to=uuid` (Phase 5 API)

---

### 4.2 Generation Jump

**What:** A numeric input in the toolbar that instantly centers the view on a specific generation number.

**Implementation:**
- Input range: 1 to max generation in the dataset
- On submit, `reactFlow.fitView()` called with nodes filtered to that generation number
- Also adds a "You are here: Generation N" breadcrumb above the canvas

---

### 4.3 Saved Bookmarks

**What:** Let authenticated users bookmark up to 20 nodes; bookmarks appear as a quick-access panel.

**Implementation:**
- New table: `bookmarks(user_id, person_id, label, created_at)`
- Bookmark icon (⭐) appears on hover over any node
- Bookmarks panel slides in from the right sidebar, listing saved people with branch badge and generation
- Clicking a bookmark flies the canvas to that node and opens DetailPanel

---

## 5. Data & Schema

### 5.1 Maternal Lineage (New Table)

```sql
CREATE TABLE marriages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  husband_id       uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  wife_id          uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  date_hijri       text,
  date_gregorian   date,
  order_num        integer DEFAULT 1,  -- 1st wife, 2nd wife, etc.
  is_verified      boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

Changes to `persons`:

```sql
ALTER TABLE persons ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'unknown')) DEFAULT 'male';
ALTER TABLE persons ADD COLUMN mother_id uuid REFERENCES persons(id) ON DELETE SET NULL;
ALTER TABLE persons ADD COLUMN marriage_id uuid REFERENCES marriages(id) ON DELETE SET NULL;
ALTER TABLE persons ADD COLUMN photo_url text;
```

---

### 5.2 Geographic Data

**What:** Add birth city / death city fields and render a geographic distribution map in the Stats panel.

**New columns:**

```sql
ALTER TABLE persons ADD COLUMN birth_city text;
ALTER TABLE persons ADD COLUMN birth_country text;
ALTER TABLE persons ADD COLUMN death_city text;
ALTER TABLE persons ADD COLUMN death_country text;
ALTER TABLE persons ADD COLUMN birth_coords point;  -- PostGIS or simple lat/lng
```

**Map view:** A Leaflet.js panel showing dots for birth locations, colored by branch — accessible from the Navbar as "Map" alongside "Tree."

---

## 6. Admin & Moderation

### 6.1 Merge Duplicate Persons

**What:** A tool to detect and merge duplicate entries (same name, similar dates) into a single canonical node.

**Implementation:**
- Fuzzy-match query on `name_ar` using the existing trigram index, surfacing pairs with >85% similarity
- Admin review UI shows the two candidate records side-by-side with a "Merge →" button
- Merge operation: keep one `id`, repoint all `father_id` / `mother_id` foreign keys, log to `audit_log`

---

### 6.2 Bulk Import from CSV / Excel

**What:** Let admins upload a structured spreadsheet to add many persons at once.

**Implementation:**
- Expected columns: `name_ar, name_en, father_name_ar, generation, birth_date_hijri, branch`
- Parse with `papaparse`; validate each row; show a preview table before committing
- Unknown `father_name_ar` values queue for manual linking in a post-import review step

---

### 6.3 Change Request Workflow (Community Edits)

**What:** Verified users can propose edits to existing nodes (corrections, added sources) without direct write access.

**Implementation:**
- New table: `change_requests(id, person_id, user_id, proposed_changes jsonb, status, reviewer_id)`
- Change request appears in AdminDashboard → SubmissionQueue alongside new lineage claims
- Approved changes are applied via the existing audit-logged update path

---

## 7. Export & Sharing

### 7.1 Subtree PDF Export

**What:** Export any selected subtree as a print-ready PDF with Arabic typography.

**Implementation:**
- Library: `html2canvas` + `jspdf` or a server-side Puppeteer render
- User selects a root node; PDF includes all descendants up to a configurable depth (default: 5 generations)
- Header shows the root person's full name in Arabic + English, generation, and branch
- Footer shows the Nasab logo, export date (Hijri and Gregorian), and "nasab.app"

---

### 7.2 Shareable Node Links

**What:** Every person node gets a permanent URL: `nasab.app/person/{id}` that opens the tree centered on that node.

**Implementation:**
- Next.js dynamic route: `app/[locale]/person/[id]/page.tsx`
- On load, fetch the person, render the tree, call `reactFlow.setCenter()` to that node, open DetailPanel
- OpenGraph meta tags for social preview: name, generation, branch color

---

### 7.3 GEDCOM Export

**What:** Export the full tree or a subtree in GEDCOM 5.5.1 format for import into tools like Ancestry, Family Tree Maker, etc.

**Implementation:**
- Server-side route: `GET /api/export/gedcom?root=uuid&depth=N`
- Maps `persons` → `INDI` records, `marriages` → `FAM` records
- Includes `BIRT`/`DEAT` dates in both Hijri (custom tag `_HIJRI`) and Gregorian
- Requires admin role; rate-limited to 3 exports per day per user

---

## 8. Internationalisation & Accessibility

### 8.1 Urdu Node Labels

**What:** Add `name_ur` (Urdu) as a third name field, displayed when the user's locale is `ur`.

**New column:** `ALTER TABLE persons ADD COLUMN name_ur text;`

Display logic: show `name_ur` if present and locale is Urdu, otherwise fall back to `name_ar`.

---

### 8.2 Screen Reader Mode

**What:** A linearised, text-only view of the tree for assistive technology users.

**Implementation:**
- Toggle "Accessible view" in Settings renders a nested `<ul>` / `<li>` list instead of the canvas
- Each `<li>` includes the full name, generation, dates, and a link to the DetailPanel
- ARIA roles: `role="tree"` on the root list, `role="treeitem"` on each node, `aria-expanded` on collapsible nodes

---

## Priority Order (Suggested)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Spouse nodes & marriage edges | Medium | Very High |
| 2 | Children → spouse grouping | Medium | Very High |
| 3 | Multiple wives per person | Low | High |
| 4 | Female members (gender field) | Low | High |
| 5 | Collapse / expand subtrees | Low | High |
| 6 | Ancestry path finder | Medium | High |
| 7 | Subtree PDF export | Medium | Medium |
| 8 | Shareable node links | Low | Medium |
| 9 | Timeline axis overlay | High | Medium |
| 10 | 3D layered view | High | Medium |
| 11 | GEDCOM export | Medium | Medium |
| 12 | Geographic data + map | High | Medium |
| 13 | Merge duplicate persons | Medium | Medium |
| 14 | Bulk CSV import | Medium | Medium |
| 15 | Urdu node labels | Low | Low |
