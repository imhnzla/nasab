// Web Worker — D3 hierarchical layout for the NASAB family tree
// Phase 1: receives raw persons array, returns positioned nodes + edges
//
// Usage (from TreeCanvas):
//   const worker = new Worker(new URL('/workers/layout.worker.ts', import.meta.url))
//   worker.postMessage({ persons })
//   worker.onmessage = (e) => { setNodes(e.data.nodes); setEdges(e.data.edges) }

// Inline types — worker cannot import from lib/
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
  created_at: string
  updated_at: string
}

export type LayoutNode = {
  id: string
  type: 'person'
  position: { x: number; y: number }
  data: { person: PersonRow }
}

export type LayoutEdge = {
  id: string
  source: string
  target: string
  type: 'smoothstep'
}

export type LayoutWorkerInput = { persons: PersonRow[] }
export type LayoutWorkerOutput = { nodes: LayoutNode[]; edges: LayoutEdge[] }

// Inline constants — worker cannot import from lib/
const NODE_WIDTH = 180
const NODE_HEIGHT = 64

// Minimal d3-hierarchy types used here
type HierarchyNode = {
  id: string
  x: number
  y: number
  data: PersonRow
  parent: HierarchyNode | null
  children: HierarchyNode[] | null
}

function buildHierarchy(persons: PersonRow[]): HierarchyNode | null {
  if (persons.length === 0) return null

  const map = new Map<string, HierarchyNode>()

  // First pass: create all nodes
  for (const p of persons) {
    map.set(p.id, {
      id: p.id,
      x: 0,
      y: 0,
      data: p,
      parent: null,
      children: null,
    })
  }

  // Second pass: link parent-child
  let root: HierarchyNode | null = null
  for (const p of persons) {
    const node = map.get(p.id)!
    if (p.father_id && map.has(p.father_id)) {
      const parent = map.get(p.father_id)!
      node.parent = parent
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      // No father_id or father not in dataset — treat as root
      // If multiple roots, use first one encountered
      if (!root) root = node
    }
  }

  return root
}

function computeLayout(root: HierarchyNode): void {
  const nodeSize: [number, number] = [NODE_WIDTH + 24, NODE_HEIGHT + 48]

  // Use BFS to assign positions via Reingold-Tilford inspired approach
  // We implement a simple tidy tree algorithm directly (no d3 available in worker)
  const contours = new Map<number, number>() // depth → rightmost x so far

  function assignX(node: HierarchyNode, depth: number, offset: number): number {
    let subtreeWidth = 0

    if (!node.children || node.children.length === 0) {
      node.x = offset
      node.y = depth * nodeSize[1]
      subtreeWidth = nodeSize[0]
    } else {
      let childOffset = offset
      for (const child of node.children) {
        subtreeWidth += assignX(child, depth + 1, childOffset)
        childOffset = offset + subtreeWidth
      }
      // Centre parent over children
      const firstChild = node.children[0]
      const lastChild = node.children[node.children.length - 1]
      node.x = (firstChild.x + lastChild.x) / 2
      node.y = depth * nodeSize[1]
    }

    return subtreeWidth
  }

  // Use a proper width-based approach
  function subtreeWidth(node: HierarchyNode): number {
    if (!node.children || node.children.length === 0) return nodeSize[0]
    return node.children.reduce((sum, c) => sum + subtreeWidth(c), 0)
  }

  function placeNode(node: HierarchyNode, depth: number, left: number): void {
    node.y = depth * nodeSize[1]
    if (!node.children || node.children.length === 0) {
      node.x = left + nodeSize[0] / 2
      return
    }
    let childLeft = left
    for (const child of node.children) {
      const w = subtreeWidth(child)
      placeNode(child, depth + 1, childLeft)
      childLeft += w
    }
    const firstChild = node.children[0]
    const lastChild = node.children[node.children.length - 1]
    node.x = (firstChild.x + lastChild.x) / 2
  }

  // Suppress unused variable warning
  void contours
  void assignX

  placeNode(root, 0, 0)
}

function collectNodes(root: HierarchyNode): HierarchyNode[] {
  const result: HierarchyNode[] = []
  const queue: HierarchyNode[] = [root]
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    if (node.children) {
      for (const child of node.children) queue.push(child)
    }
  }
  return result
}

self.onmessage = (event: MessageEvent<LayoutWorkerInput>): void => {
  const { persons } = event.data

  // Single-node case
  if (persons.length === 1) {
    const p = persons[0]
    const output: LayoutWorkerOutput = {
      nodes: [
        {
          id: p.id,
          type: 'person',
          position: { x: 0, y: 0 },
          data: { person: p },
        },
      ],
      edges: [],
    }
    self.postMessage(output)
    return
  }

  // Empty case
  if (persons.length === 0) {
    self.postMessage({ nodes: [], edges: [] } satisfies LayoutWorkerOutput)
    return
  }

  const root = buildHierarchy(persons)
  if (!root) {
    self.postMessage({ nodes: [], edges: [] } satisfies LayoutWorkerOutput)
    return
  }

  computeLayout(root)

  const allNodes = collectNodes(root)

  const layoutNodes: LayoutNode[] = allNodes.map((n) => ({
    id: n.id,
    type: 'person',
    position: { x: n.x, y: n.y },
    data: { person: n.data },
  }))

  const layoutEdges: LayoutEdge[] = allNodes
    .filter((n) => n.parent !== null)
    .map((n) => ({
      id: `e-${n.parent!.id}-${n.id}`,
      source: n.parent!.id,
      target: n.id,
      type: 'smoothstep',
    }))

  const output: LayoutWorkerOutput = { nodes: layoutNodes, edges: layoutEdges }
  self.postMessage(output)
}
