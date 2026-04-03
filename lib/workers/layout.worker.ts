// Web Worker — Premium 2D layout for the NASAB family tree
//
// Algorithm: Modified Reingold-Tilford with inline wife nodes
//
// Key design decisions:
//   • "Lateral entries" (father_id=null, generation=null) are wives/in-laws
//     who connect via marriage only — they render as WifeNodeCard, not PersonNodeCard
//   • Children are grouped by mother (mother_id field) under their mother's wife card
//   • Multiple patrilineal roots (e.g. the Prophet + Ali ibn Abi Talib) are laid
//     out side-by-side with ROOT_GAP between them
//   • Subtree widths are computed bottom-up; X positions assigned top-down
//   • Y = (generation - 1) * LANE_HEIGHT for person rows
//   • Y = personY + WIFE_ROW_OFFSET for wife card rows

// ─── Inline types (worker cannot import from lib/) ────────────────────────────
export type PersonRow = {
  id: string
  name_ar: string
  name_en: string
  father_id: string | null
  branch: 'hasanid' | 'husaynid' | 'hashemite' | null
  scholarly_tradition: 'sunni' | 'shia' | 'both' | null
  generation: number | null
  birth_date_hijri: string | null
  death_date_hijri: string | null
  birth_date_gregorian: string | null
  death_date_gregorian: string | null
  bio_ar: string | null
  bio_en: string | null
  sources: unknown
  titles: unknown
  is_verified: boolean
  is_living: boolean
  gender: 'male' | 'female' | 'unknown'
  mother_id: string | null
  marriage_id: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type MarriageRow = {
  id: string
  husband_id: string
  wife_id: string
  date_hijri: string | null
  date_gregorian: string | null
  order_num: number
  is_verified: boolean
  notes_ar: string | null
  notes_en: string | null
  created_at: string
  updated_at: string
}

export type LayoutNode = {
  id: string
  type: 'person' | 'wife'
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export type LayoutEdge = {
  id: string
  source: string
  target: string
  type: 'parentChild' | 'fatherToWife' | 'wifeToChild' | 'marriageArc'
  data?: Record<string, unknown>
}

export type LayoutWorkerInput = {
  persons: PersonRow[]
  marriages: MarriageRow[]
}

export type LayoutWorkerOutput = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
}

// ─── Layout constants (must mirror lib/tree/constants2d.ts) ──────────────────
const NODE_W = 160
const NODE_H = 96
const WIFE_W = 120
const LANE_HEIGHT = 240
const WIFE_ROW_OFFSET = 110
const H_GAP = 24
const WIFE_H_GAP = 12
const GROUP_GAP = 44
const ROOT_GAP = 200

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A "lateral entry" connects to the tree only via marriage (not patrilineal descent).
 *  Characteristics: no father_id in the dataset AND no generation assigned.
 *  These persons render as WifeNodeCard beside their husband, not as PersonNodeCard. */
function isLateralEntry(p: PersonRow, personMap: Map<string, PersonRow>): boolean {
  if (p.generation !== null && p.generation !== undefined) return false
  if (p.father_id && personMap.has(p.father_id)) return false
  return true
}

// ─── Main message handler ─────────────────────────────────────────────────────
self.onmessage = (event: MessageEvent<LayoutWorkerInput>): void => {
  const { persons, marriages = [] } = event.data

  if (persons.length === 0) {
    self.postMessage({ nodes: [], edges: [] } satisfies LayoutWorkerOutput)
    return
  }

  // ── Step 1: Build lookup maps ───────────────────────────────────────────────
  const personMap = new Map<string, PersonRow>(persons.map((p) => [p.id, p]))

  // Separate lateral entries from tree persons
  const treePersons = persons.filter((p) => !isLateralEntry(p, personMap))
  const lateralMap = new Map<string, PersonRow>(
    persons.filter((p) => isLateralEntry(p, personMap)).map((p) => [p.id, p])
  )

  // childrenOf[fatherId] → sorted child IDs (by generation, then name for stability)
  const childrenOf = new Map<string, string[]>()
  for (const p of treePersons) {
    if (p.father_id && personMap.has(p.father_id)) {
      if (!childrenOf.has(p.father_id)) childrenOf.set(p.father_id, [])
      childrenOf.get(p.father_id)!.push(p.id)
    }
  }

  // wivesOf[husbandId] → marriages sorted by order_num
  const wivesOf = new Map<string, MarriageRow[]>()
  for (const m of marriages) {
    if (!wivesOf.has(m.husband_id)) wivesOf.set(m.husband_id, [])
    wivesOf.get(m.husband_id)!.push(m)
  }
  for (const list of wivesOf.values()) {
    list.sort((a, b) => a.order_num - b.order_num)
  }

  // ── Step 2: Group each person's children by their mother ───────────────────
  // childrenByMother[personId][wifeId | null] → childIds
  const childrenByMother = new Map<string, Map<string | null, string[]>>()

  function buildChildGroups(personId: string): void {
    const children = childrenOf.get(personId) ?? []
    const wives = wivesOf.get(personId) ?? []

    const byMother = new Map<string | null, string[]>()
    // Pre-populate slots for known wives (preserves order_num ordering)
    for (const m of wives) byMother.set(m.wife_id, [])
    byMother.set(null, []) // slot for children with unknown/unlisted mother

    for (const childId of children) {
      const child = personMap.get(childId)
      const motherWifeId = child?.mother_id ?? null
      // Only group under a wife if she is one of this person's listed wives
      const key = motherWifeId && byMother.has(motherWifeId) ? motherWifeId : null
      if (!byMother.has(key)) byMother.set(key, [])
      byMother.get(key)!.push(childId)
    }

    childrenByMother.set(personId, byMother)
    for (const childId of children) buildChildGroups(childId)
  }

  // ── Step 3: Find all patrilineal roots ────────────────────────────────────
  // A root is a tree person with no father in the dataset.
  //
  // We split roots into two groups:
  //   mainRoots    — roots that HAVE children → laid out as the primary tree
  //   satelliteRoots — roots with NO children in the dataset (e.g. Ali ibn Abi
  //                    Talib whose children Hasan/Husayn have father_id=Fatimah).
  //                    These are placed adjacent to their spouse after main layout
  //                    rather than as separate subtrees, avoiding a massive spanning arc.

  const allRoots = treePersons.filter((p) => !(p.father_id && personMap.has(p.father_id)))

  const roots = allRoots.filter((p) => (childrenOf.get(p.id) ?? []).length > 0)
  const satelliteRoots = allRoots.filter((p) => (childrenOf.get(p.id) ?? []).length === 0)

  // Sort main roots by generation (ascending), then name for stability
  roots.sort(
    (a, b) => (a.generation ?? 1) - (b.generation ?? 1) || a.name_en.localeCompare(b.name_en)
  )

  for (const root of roots) buildChildGroups(root.id)
  // Build child groups for satellites too (so edge emission is correct)
  for (const sat of satelliteRoots) buildChildGroups(sat.id)

  // ── Step 4: Compute subtree widths (bottom-up) ────────────────────────────
  const widthCache = new Map<string, number>()

  function subtreeWidth(personId: string): number {
    const cached = widthCache.get(personId)
    if (cached !== undefined) return cached

    const children = childrenOf.get(personId) ?? []
    const wives = wivesOf.get(personId) ?? []
    const byMother = childrenByMother.get(personId)

    // Childless wives do NOT inflate horizontal width — they are placed to the
    // right of the person node post-layout so they never push the subtree centre off.
    const wivesWithKids = wives.filter((m) => (byMother?.get(m.wife_id) ?? []).length > 0)

    if (children.length === 0) {
      // No children: just own card width (childless wives placed beside node)
      const w = NODE_W + H_GAP
      widthCache.set(personId, w)
      return w
    }

    let totalW = 0

    // Width comes only from wives who have children
    for (let i = 0; i < wivesWithKids.length; i++) {
      const m = wivesWithKids[i]
      const groupChildren = byMother?.get(m.wife_id) ?? []
      const childGroupW = groupChildren.reduce((s, c) => s + subtreeWidth(c), 0)
      const groupW = Math.max(WIFE_W + WIFE_H_GAP, childGroupW)
      totalW += groupW
      if (i < wivesWithKids.length - 1) totalW += GROUP_GAP
    }

    // Width for unknown-mother children
    const unknownChildren = byMother?.get(null) ?? []
    const unknownW = unknownChildren.reduce((s, c) => s + subtreeWidth(c), 0)
    if (unknownW > 0) {
      if (wivesWithKids.length > 0) totalW += GROUP_GAP
      totalW += unknownW
    }

    const w = Math.max(NODE_W + H_GAP, totalW + H_GAP)
    widthCache.set(personId, w)
    return w
  }

  for (const root of roots) subtreeWidth(root.id)

  // ── Step 5: Assign X/Y positions (top-down) ───────────────────────────────
  // positions[id] = top-left {x, y} for React Flow
  const positions = new Map<string, { x: number; y: number }>()

  function assignPositions(personId: string, leftBound: number): void {
    const person = personMap.get(personId)!
    const gen = person.generation ?? 1
    const totalW = subtreeWidth(personId)
    const children = childrenOf.get(personId) ?? []
    const wives = wivesOf.get(personId) ?? []
    const byMother = childrenByMother.get(personId)

    // Split wives into those with / without children — same logic as subtreeWidth
    const wivesWithKids = wives.filter((m) => (byMother?.get(m.wife_id) ?? []).length > 0)
    const wivesNoKids = wives.filter((m) => (byMother?.get(m.wife_id) ?? []).length === 0)

    // Person card: top-left = (centreX - NODE_W/2, (gen-1)*LANE_HEIGHT)
    const centreX = leftBound + totalW / 2
    const personX = centreX - NODE_W / 2
    const personY = (gen - 1) * LANE_HEIGHT
    positions.set(personId, { x: personX, y: personY })

    // Childless wives: float to the right of the person node at the wife row Y.
    // They contribute zero to subtreeWidth so they don't displace any children.
    if (wivesNoKids.length > 0) {
      let wx = personX + NODE_W + H_GAP * 2
      for (const m of wivesNoKids) {
        positions.set(`wife-${m.id}`, { x: wx, y: personY + WIFE_ROW_OFFSET })
        wx += WIFE_W + WIFE_H_GAP
      }
    }

    if (children.length === 0) {
      // No children: wives-with-kids (rare) centred under person; then return
      if (wivesWithKids.length > 0) {
        const wifeRowW = wivesWithKids.length * (WIFE_W + WIFE_H_GAP) - WIFE_H_GAP
        let wx = centreX - wifeRowW / 2
        for (const m of wivesWithKids) {
          positions.set(`wife-${m.id}`, { x: wx, y: personY + WIFE_ROW_OFFSET })
          wx += WIFE_W + WIFE_H_GAP
        }
      }
      return
    }

    // Place wife-with-children groups and their children
    let currentX = leftBound

    for (let i = 0; i < wivesWithKids.length; i++) {
      const m = wivesWithKids[i]
      const groupChildren = byMother?.get(m.wife_id) ?? []
      const childGroupW = groupChildren.reduce((s, c) => s + subtreeWidth(c), 0)
      const groupW = Math.max(WIFE_W + WIFE_H_GAP, childGroupW)

      // Wife card: centred over her children group
      const wifeX = currentX + groupW / 2 - WIFE_W / 2
      const wifeY = personY + WIFE_ROW_OFFSET
      positions.set(`wife-${m.id}`, { x: wifeX, y: wifeY })

      // Place children centred under wife card
      const childStartX = currentX + Math.max(0, (groupW - childGroupW) / 2)
      let childX = childStartX
      for (const childId of groupChildren) {
        assignPositions(childId, childX)
        childX += subtreeWidth(childId)
      }

      currentX += groupW + (i < wivesWithKids.length - 1 ? GROUP_GAP : 0)
    }

    // Place unknown-mother children after all wife groups
    const unknownChildren = byMother?.get(null) ?? []
    if (unknownChildren.length > 0) {
      if (wivesWithKids.length > 0) currentX += GROUP_GAP
      for (const childId of unknownChildren) {
        assignPositions(childId, currentX)
        currentX += subtreeWidth(childId)
      }
    }
  }

  // Lay out each main-root subtree side by side
  let rootLeft = 0
  for (const root of roots) {
    assignPositions(root.id, rootLeft)
    rootLeft += subtreeWidth(root.id) + ROOT_GAP
  }

  // ── Step 5b: Place satellite roots adjacent to their spouse ───────────────
  // Satellite roots (e.g. Ali ibn Abi Talib) have no children in the dataset
  // so they'd otherwise appear as isolated nodes far from the main tree.
  // We place them at the same Y as their spouse, just to the left.
  for (const sat of satelliteRoots) {
    if (positions.has(sat.id)) continue

    // Case A: satellite is a HUSBAND — look for his wives in the main tree
    const satMarriages = wivesOf.get(sat.id) ?? []
    let placed = false
    for (const m of satMarriages) {
      const spousePos = positions.get(m.wife_id)
      if (spousePos) {
        positions.set(sat.id, {
          x: spousePos.x - NODE_W - H_GAP * 4,
          y: spousePos.y,
        })
        placed = true
        break
      }
    }

    // Case B: satellite is a WIFE in someone else's marriage
    if (!placed) {
      outer: for (const [, ms] of wivesOf.entries()) {
        for (const m of ms) {
          if (m.wife_id === sat.id && positions.has(m.husband_id)) {
            const hPos = positions.get(m.husband_id)!
            positions.set(sat.id, {
              x: hPos.x - NODE_W - H_GAP * 4,
              y: hPos.y,
            })
            placed = true
            break outer
          }
        }
      }
    }
  }

  // ── Step 6: Emit LayoutNodes ──────────────────────────────────────────────
  const outputNodes: LayoutNode[] = []
  const outputEdges: LayoutEdge[] = []

  // Person nodes
  for (const p of treePersons) {
    const pos = positions.get(p.id)
    if (!pos) continue
    outputNodes.push({
      id: p.id,
      type: 'person',
      position: pos,
      data: { person: p },
    })
  }

  // Wife nodes (lateral entries placed beside their husband)
  for (const [husbandId, marriages_] of wivesOf.entries()) {
    const hPos = positions.get(husbandId)
    if (!hPos) continue

    for (const m of marriages_) {
      const wifePerson = lateralMap.get(m.wife_id) ?? personMap.get(m.wife_id)
      if (!wifePerson) continue

      const wifeNodeId = `wife-${m.id}`

      // Use pre-computed position if available; fall back to inline placement
      const wPos = positions.get(wifeNodeId) ?? {
        x: hPos.x + NODE_W + 16 + (m.order_num - 1) * (WIFE_W + WIFE_H_GAP),
        y: hPos.y + WIFE_ROW_OFFSET,
      }

      // Only emit as wife node if:
      //   (a) person is a lateral entry, OR
      //   (b) person is a tree person but we have a position slot for them as wife
      //       (i.e. they appear in both the tree AND as a wife — e.g. Fatimah)
      const isLateral = lateralMap.has(m.wife_id)
      const isTreePersonWife = !isLateral && positions.has(m.wife_id)

      if (isLateral) {
        outputNodes.push({
          id: wifeNodeId,
          type: 'wife',
          position: wPos,
          data: {
            person: wifePerson,
            marriageId: m.id,
            marriageDate: m.date_hijri,
            orderNum: m.order_num,
          },
        })

        // Father → wife connector edge
        outputEdges.push({
          id: `ftw-${m.id}`,
          source: husbandId,
          target: wifeNodeId,
          type: 'fatherToWife',
          data: { orderNum: m.order_num },
        })

        // Wife → each of her children
        const byMother = childrenByMother.get(husbandId)
        const wifeChildren = byMother?.get(m.wife_id) ?? []
        for (const childId of wifeChildren) {
          outputEdges.push({
            id: `wtc-${m.id}-${childId}`,
            source: wifeNodeId,
            target: childId,
            type: 'wifeToChild',
          })
        }
      } else if (isTreePersonWife) {
        // Tree person who is ALSO a wife (e.g. Fatimah al-Zahra):
        // draw a marriage arc between her PersonNodeCard and her husband
        outputEdges.push({
          id: `marriagearc-${m.id}`,
          source: m.wife_id, // her person node
          target: husbandId,
          type: 'marriageArc',
          data: { marriageDate: m.date_hijri },
        })
      }
    }
  }

  // ── Step 7: Parent-child edges ────────────────────────────────────────────
  // Connect father → child for children not already connected via a wife node
  const wiredChildren = new Set<string>()
  for (const [, marriages_] of wivesOf.entries()) {
    for (const m of marriages_) {
      const byMother = childrenByMother.get(m.husband_id)
      const wifeChildren = byMother?.get(m.wife_id) ?? []
      for (const c of wifeChildren) wiredChildren.add(c)
    }
  }

  for (const p of treePersons) {
    if (!p.father_id || !positions.has(p.id)) continue
    if (wiredChildren.has(p.id)) continue // already wired via wife node
    outputEdges.push({
      id: `pc-${p.father_id}-${p.id}`,
      source: p.father_id,
      target: p.id,
      type: 'parentChild',
    })
  }

  self.postMessage({ nodes: outputNodes, edges: outputEdges } satisfies LayoutWorkerOutput)
}
