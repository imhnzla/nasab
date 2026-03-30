// Web Worker — hierarchical layout for the NASAB family tree
// Phase 1 (Features 1–5): persons + marriages → positioned nodes + edges
//
// Outputs:
// - person nodes (rectangular, or oval for female)
// - spouse nodes (oval, offset right of husband)
// - junction nodes (invisible midpoints between husband+wife)
// - bracket nodes (mother-label above her children group)
// - smoothstep edges (parent → child)
// - marriage edges (husband → junction, wife → junction)
// - crossMarriage edges (husband ↔ wife from different branches, floating arc)

// ─── Inline types (worker cannot import from lib/) ───────────────────────────
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
  type: 'person' | 'spouse' | 'junction' | 'bracket'
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export type LayoutEdge = {
  id: string
  source: string
  target: string
  type: 'smoothstep' | 'marriage' | 'crossMarriage'
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

// ─── Constants ───────────────────────────────────────────────────────────────
const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const H_GAP = 24 // horizontal gap between siblings
const V_GAP = 48 // vertical gap between generations
const SPOUSE_OFFSET_X = NODE_WIDTH + 80 // wife column right of husband
const SPOUSE_V_GAP = NODE_HEIGHT + 28 // vertical stacking between wives
const JUNCTION_OFFSET_Y = NODE_HEIGHT + 32 // junction below husband/wife midpoint
const BRACKET_OFFSET_Y = 30 // bracket above children row
const SPOUSE_SUBTREE_EXTRA = NODE_WIDTH + 100 // extra width per married node

// ─── Hierarchy types ─────────────────────────────────────────────────────────
type HierarchyNode = {
  id: string
  x: number
  y: number
  data: PersonRow
  parent: HierarchyNode | null
  children: HierarchyNode[]
  marriageCount: number // number of wives — widens subtree
}

// ─── Build tree hierarchy from persons ───────────────────────────────────────
function buildHierarchy(
  persons: PersonRow[],
  marriages: MarriageRow[],
): HierarchyNode | null {
  if (persons.length === 0) return null

  // Count marriages per husband to widen their subtree
  const marriageCountByHusband = new Map<string, number>()
  for (const m of marriages) {
    marriageCountByHusband.set(m.husband_id, (marriageCountByHusband.get(m.husband_id) ?? 0) + 1)
  }

  const map = new Map<string, HierarchyNode>()
  for (const p of persons) {
    map.set(p.id, {
      id: p.id,
      x: 0,
      y: 0,
      data: p,
      parent: null,
      children: [],
      marriageCount: marriageCountByHusband.get(p.id) ?? 0,
    })
  }

  let root: HierarchyNode | null = null
  for (const p of persons) {
    const node = map.get(p.id)!
    if (p.father_id && map.has(p.father_id)) {
      const parent = map.get(p.father_id)!
      node.parent = parent
      parent.children.push(node)
    } else {
      if (!root) root = node
    }
  }
  return root
}

// ─── Compute subtree width (accounting for spouse columns) ───────────────────
function subtreeWidth(node: HierarchyNode): number {
  const nodeSize = NODE_WIDTH + H_GAP
  const extra = node.marriageCount > 0 ? SPOUSE_SUBTREE_EXTRA : 0
  if (node.children.length === 0) return nodeSize + extra

  const childTotal = node.children.reduce((sum, c) => sum + subtreeWidth(c), 0)
  return Math.max(nodeSize + extra, childTotal)
}

// ─── Place all person nodes ───────────────────────────────────────────────────
function placeNode(node: HierarchyNode, depth: number, left: number): void {
  node.y = depth * (NODE_HEIGHT + V_GAP)

  if (node.children.length === 0) {
    node.x = left + NODE_WIDTH / 2
    return
  }

  let childLeft = left
  for (const child of node.children) {
    const w = subtreeWidth(child)
    placeNode(child, depth + 1, childLeft)
    childLeft += w
  }

  const first = node.children[0]
  const last = node.children[node.children.length - 1]
  node.x = (first.x + last.x) / 2
}

function collectPersonNodes(root: HierarchyNode): HierarchyNode[] {
  const result: HierarchyNode[] = []
  const queue: HierarchyNode[] = [root]
  while (queue.length > 0) {
    const n = queue.shift()!
    result.push(n)
    for (const c of n.children) queue.push(c)
  }
  return result
}

// ─── Main message handler ─────────────────────────────────────────────────────
self.onmessage = (event: MessageEvent<LayoutWorkerInput>): void => {
  const { persons, marriages = [] } = event.data

  if (persons.length === 0) {
    self.postMessage({ nodes: [], edges: [] } satisfies LayoutWorkerOutput)
    return
  }

  if (persons.length === 1) {
    const p = persons[0]
    self.postMessage({
      nodes: [{
        id: p.id,
        type: 'person',
        position: { x: 0, y: 0 },
        data: { person: p }
      }],
      edges: [],
    } satisfies LayoutWorkerOutput)
    return
  }

  // ── Pass 1: place person nodes ──────────────────────────────────────────
  const root = buildHierarchy(persons, marriages)
  if (!root) {
    self.postMessage({ nodes: [], edges: [] } satisfies LayoutWorkerOutput)
    return
  }

  placeNode(root, 0, 0)
  const allPersonNodes = collectPersonNodes(root)

  // Build position map: personId → {x, y}
  const posMap = new Map<string, { x: number; y: number }>()
  for (const n of allPersonNodes) posMap.set(n.id, { x: n.x, y: n.y })

  // Build person data map
  const personMap = new Map<string, PersonRow>()
  for (const p of persons) personMap.set(p.id, p)

  // ── Pass 2: group marriages by husband ──────────────────────────────────
  const marriagesByHusband = new Map<string, MarriageRow[]>()
  for (const m of marriages) {
    if (!marriagesByHusband.has(m.husband_id)) marriagesByHusband.set(m.husband_id, [])
    marriagesByHusband.get(m.husband_id)!.push(m)
  }

  // Sort each husband's wives by order_num
  for (const list of marriagesByHusband.values()) {
    list.sort((a, b) => a.order_num - b.order_num)
  }

  // ── Pass 3: compute spouse / junction / bracket positions ───────────────
  const outputNodes: LayoutNode[] = []
  const outputEdges: LayoutEdge[] = []

  // motherBranch lookup: childId → wife branch
  const motherBranchMap = new Map<string, PersonRow['branch']>()
  for (const p of persons) {
    if (p.mother_id) {
      const mother = personMap.get(p.mother_id)
      if (mother) motherBranchMap.set(p.id, mother.branch)
    }
  }

  for (const [husbandId, wifeMarriages] of marriagesByHusband.entries()) {
    const hPos = posMap.get(husbandId)
    if (!hPos) continue

    const husband = personMap.get(husbandId)

    for (const marriage of wifeMarriages) {
      const wifePerson = personMap.get(marriage.wife_id)
      if (!wifePerson) continue

      const orderIndex = marriage.order_num - 1
      const wifeX = hPos.x + SPOUSE_OFFSET_X
      const wifeY = hPos.y + orderIndex * SPOUSE_V_GAP

      const spouseNodeId = `spouse-${marriage.wife_id}`
      outputNodes.push({
        id: spouseNodeId,
        type: 'spouse',
        position: { x: wifeX, y: wifeY },
        data: {
          person: wifePerson,
          marriageId: marriage.id,
          marriageDate: marriage.date_hijri,
          order: marriage.order_num,
        },
      })

      const junctionId = `junction-${marriage.id}`
      const junctionX = (hPos.x + wifeX) / 2
      const junctionY = wifeY + JUNCTION_OFFSET_Y
      outputNodes.push({
        id: junctionId,
        type: 'junction',
        position: { x: junctionX, y: junctionY },
        data: {
          husbandId,
          wifeId: marriage.wife_id,
          marriageId: marriage.id,
        },
      })

      // Cross-branch vs same-branch marriage edge
      const isCrossBranch = husband?.branch !== wifePerson.branch
      if (isCrossBranch) {
        outputEdges.push({
          id: `crossmarriage-${marriage.id}`,
          source: husbandId,
          target: spouseNodeId,
          type: 'crossMarriage',
          data: {
            marriageId: marriage.id,
            marriageDate: marriage.date_hijri,
          },
        })
      } else {
        outputEdges.push({
          id: `marriage-h-${marriage.id}`,
          source: husbandId,
          target: junctionId,
          type: 'marriage',
          data: {
            marriageId: marriage.id,
            order: marriage.order_num,
            side: 'husband'
          },
        })
        outputEdges.push({
          id: `marriage-w-${marriage.id}`,
          source: spouseNodeId,
          target: junctionId,
          type: 'marriage',
          data: {
            marriageId: marriage.id,
            order: marriage.order_num,
            side: 'wife'
          },
        })
      }

      // Children of this marriage: persons whose marriage_id matches
      const marriageChildren = persons.filter(
        (p) => p.marriage_id === marriage.id && posMap.has(p.id)
      )

      // Replace smoothstep edges from father → child with junction → child
      for (const child of marriageChildren) {
        outputEdges.push({
          id: `parentchild-${junctionId}-${child.id}`,
          source: junctionId,
          target: child.id,
          type: 'smoothstep',
          data: { marriageId: marriage.id },
        })
      }

      // Bracket node above this wife's children group
      if (marriageChildren.length > 0) {
        const childPositions = marriageChildren
          .map((c) => posMap.get(c.id)!)
          .filter(Boolean)

        const leftmost = Math.min(...childPositions.map((p) => p.x - NODE_WIDTH / 2))
        const rightmost = Math.max(...childPositions.map((p) => p.x + NODE_WIDTH / 2))
        const childY = childPositions[0].y
        const spanPx = rightmost - leftmost

        outputNodes.push({
          id: `bracket-${marriage.id}`,
          type: 'bracket',
          position: { x: leftmost, y: childY - BRACKET_OFFSET_Y },
          data: {
            motherName_ar: wifePerson.name_ar,
            motherName_en: wifePerson.name_en,
            motherBranch: wifePerson.branch,
            spanPx,
          },
        })
      }
    }
  }

  // Set of children already connected via junction (skip plain father edge for those)
  const junctionChildIds = new Set<string>(
    persons
      .filter((p) => p.marriage_id !== null)
      .map((p) => p.id)
  )

  // ── Pass 4: emit all person nodes + standard parent-child edges ──────────
  for (const n of allPersonNodes) {
    const mb = motherBranchMap.get(n.id) ?? null

    outputNodes.push({
      id: n.id,
      type: 'person',
      position: { x: n.x, y: n.y },
      data: {
        person: n.data,
        motherBranch: mb,
      },
    })

    // Standard father→child edge — skip if child has a junction edge
    if (n.parent && !junctionChildIds.has(n.id)) {
      outputEdges.push({
        id: `e-${n.parent.id}-${n.id}`,
        source: n.parent.id,
        target: n.id,
        type: 'smoothstep',
      })
    }
  }

  self.postMessage({
    nodes: outputNodes,
    edges: outputEdges
  } satisfies LayoutWorkerOutput)
}
