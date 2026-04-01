'use client'
// Phase 1 — Client wrapper for the interactive family tree page
// Manages: layout worker, branch filter state, detail panel, search overlay, export, view modes, path finder, timeline, bookmarks

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useReactFlow, ReactFlowProvider } from '@xyflow/react'
import dynamic from 'next/dynamic'
import '@xyflow/react/dist/style.css'

import type { AnyFlowNode, PersonRow, Branch, FamilyEdge, SearchHit, MarriageRow } from '@/lib/tree/types'
import type { LayoutNode, LayoutWorkerOutput } from '@/lib/workers/layout.worker'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { BranchFilter } from '@/components/tree/BranchFilter'
import { DetailPanel } from '@/components/tree/DetailPanel'
import { SearchOverlay } from '@/components/tree/SearchOverlay'
import { ExportButton } from '@/components/tree/ExportButton'
import { PathFinder } from '@/components/tree/PathFinder'
import { TimelineAxis } from '@/components/tree/TimelineAxis'
import { AccessibleTreeView } from '@/components/tree/AccessibleTreeView'
import { BookmarkStar } from '@/components/tree/BookmarkStar'

// Dynamically import the 3D canvas to avoid SSR issues with Three.js
const TreeCanvas3D = dynamic(
  () => import('@/components/tree/TreeCanvas3D').then((m) => ({ default: m.TreeCanvas3D })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400 animate-pulse">Loading 3D view…</span>
      </div>
    ),
  },
)

// Dynamically import the radial canvas
const TreeCanvasRadial = dynamic(
  () => import('@/components/tree/TreeCanvasRadial').then((m) => ({ default: m.TreeCanvasRadial })),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-50" /> },
)

type TreePageClientInnerProps = {
  persons: PersonRow[]
  marriages: MarriageRow[]
}

const ALL_BRANCHES: Branch[] = ['hasanid', 'husaynid', 'hashemite']

function layoutNodesToFlowNodes(layoutNodes: LayoutNode[]): AnyFlowNode[] {
  return layoutNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  })) as AnyFlowNode[]
}

// ---------- Collapse helpers ----------
function buildChildrenMap(edges: FamilyEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const e of edges) {
    if (!map.has(e.source)) map.set(e.source, new Set())
    map.get(e.source)!.add(e.target)
  }
  return map
}

function getHiddenIds(
  collapsedIds: Set<string>,
  childrenOf: Map<string, Set<string>>,
): Set<string> {
  const hidden = new Set<string>()
  const queue = [...collapsedIds]
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const childId of childrenOf.get(id) ?? []) {
      if (!hidden.has(childId)) {
        hidden.add(childId)
        queue.push(childId)
      }
    }
  }
  return hidden
}

function countDescendants(
  id: string,
  childrenOf: Map<string, Set<string>>,
): number {
  let count = 0
  const queue = [id]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const child of childrenOf.get(cur) ?? []) {
      count++
      queue.push(child)
    }
  }
  return count
}
// --------------------------------------

function TreePageClientInner({ persons, marriages }: TreePageClientInnerProps): React.ReactElement {
  const { setCenter } = useReactFlow()

  const [nodes, setNodes] = useState<AnyFlowNode[]>([])
  const [edges, setEdges] = useState<FamilyEdge[]>([])
  const [activeBranches, setActiveBranches] = useState<Branch[]>(ALL_BRANCHES)
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showWives, setShowWives] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'radial' | 'accessible'>('2d')
  const [showTimeline, setShowTimeline] = useState(false)
  const [pathHighlightIds, setPathHighlightIds] = useState<Set<string>>(new Set())
  const [scrollY, setScrollY] = useState(0)

  // Collapse state (persisted in localStorage)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const saved = localStorage.getItem('nasab-collapsed')
      return saved ? new Set<string>(JSON.parse(saved) as string[]) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  })

  const toggleCollapse = useCallback((personId: string): void => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      next.has(personId) ? next.delete(personId) : next.add(personId)
      try {
        localStorage.setItem('nasab-collapsed', JSON.stringify([...next]))
      } catch {
        // storage quota exceeded, ignore
      }
      return next
    })
  }, [])

  const treeContainerRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)

  // Run layout worker whenever persons or branch filter changes
  useEffect(() => {
    const filtered = persons.filter((p) => p.branch === null || activeBranches.includes(p.branch))

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('@/lib/workers/layout.worker.ts', import.meta.url), {
        type: 'module',
      })
    }

    const worker = workerRef.current

    const handleMessage = (e: MessageEvent<LayoutWorkerOutput>): void => {
      const { nodes: layoutNodes, edges: layoutEdges } = e.data
      setNodes(layoutNodesToFlowNodes(layoutNodes))
      setEdges(layoutEdges as FamilyEdge[])
    }

    worker.addEventListener('message', handleMessage)
    worker.postMessage({ persons: filtered, marriages })

    return () => {
      worker.removeEventListener('message', handleMessage)
    }
  }, [persons, activeBranches, marriages])

  // Terminate worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNodeClick = useCallback(
    (personId: string) => {
      const person = persons.find((p) => p.id === personId) ?? null
      setSelectedPerson(person)
    },
    [persons]
  )

  const handleFlyTo = useCallback(
    (personId: string) => {
      const node = nodes.find((n) => n.id === personId)
      if (node) {
        setCenter(node.position.x + 90, node.position.y + 32, { zoom: 1.4, duration: 700 })
      }
      const person = persons.find((p) => p.id === personId) ?? null
      setSelectedPerson(person)
    },
    [nodes, persons, setCenter]
  )

  const handleSearchSelect = useCallback(
    (hit: SearchHit) => {
      const person = persons.find((p) => p.id === hit.id) ?? null
      setSelectedPerson(person)
      setIsSearchOpen(false)

      const node = nodes.find((n) => n.id === hit.id)
      if (node) {
        setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 600 })
      }
    },
    [persons, nodes, setCenter]
  )

  // Generation jump
  const maxGeneration = useMemo(
    () => Math.max(...persons.map((p) => p.generation ?? 0), 0),
    [persons],
  )

  function jumpToGeneration(gen: number): void {
    const genNodes = displayNodes.filter((n) => {
      if (n.type !== 'person') return false
      const person = (n.data as { person: PersonRow }).person
      return person.generation === gen
    })
    if (genNodes.length === 0) return
    const avgX = genNodes.reduce((s, n) => s + n.position.x, 0) / genNodes.length
    const y    = genNodes[0].position.y
    setCenter(avgX, y + 32, { zoom: 1.0, duration: 500 })
  }

  // Combined memo: filter by showWives + inject collapse callbacks + hide collapsed subtrees
  const { displayNodes, displayEdges } = useMemo(() => {
    // Step 1: filter spouses when showWives is off
    let filteredNodes: AnyFlowNode[] = showWives
      ? nodes
      : nodes.filter((n) => n.type === 'person')

    let filteredEdges: FamilyEdge[] = showWives
      ? edges
      : edges.filter((e) => e.type === 'smoothstep')

    // Step 2: inject collapse callbacks into person nodes
    const childrenOf = buildChildrenMap(filteredEdges)

    filteredNodes = filteredNodes.map((n): AnyFlowNode => {
      if (n.type !== 'person') return n
      const isCollapsed = collapsedIds.has(n.id)
      const isHighlighted = pathHighlightIds.has(n.id)
      const isDimmed = pathHighlightIds.size > 0 && !pathHighlightIds.has(n.id)
      return {
        ...n,
        data: {
          ...n.data,
          onToggleCollapse: toggleCollapse,
          collapsedCount: isCollapsed
            ? countDescendants(n.id, childrenOf)
            : undefined,
          highlighted: isHighlighted,
          dimmed: isDimmed,
        },
      }
    })

    // Step 3: hide descendants of collapsed nodes
    if (collapsedIds.size > 0) {
      const hidden = getHiddenIds(collapsedIds, childrenOf)
      filteredNodes = filteredNodes.filter((n) => !hidden.has(n.id))
      filteredEdges = filteredEdges.filter(
        (e) => !hidden.has(e.source) && !hidden.has(e.target),
      )
    }

    return { displayNodes: filteredNodes, displayEdges: filteredEdges }
  }, [nodes, edges, showWives, collapsedIds, toggleCollapse, pathHighlightIds])

  // Generation Y map for timeline
  const generationY = useMemo(() => {
    const map = new Map<number, number>()
    for (const n of displayNodes) {
      if (n.type !== 'person') continue
      const p = (n.data as { person: PersonRow }).person
      if (p.generation !== null && !map.has(p.generation)) {
        map.set(p.generation, n.position.y)
      }
    }
    return map
  }, [displayNodes])

  // Listen to scroll events for timeline positioning (if canvas scrolls)
  useEffect(() => {
    const container = treeContainerRef.current
    if (!container) return
    const handleScroll = () => setScrollY(container.scrollTop)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Cycle view modes: 2D → Radial → 3D → Accessible → back to 2D
  const cycleViewMode = useCallback(() => {
    setViewMode((prev) => {
      switch (prev) {
        case '2d': return 'radial'
        case 'radial': return '3d'
        case '3d': return 'accessible'
        default: return '2d'
      }
    })
  }, [])

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <h1 className="text-sm font-bold text-gray-900">
          شجرة النسب الشريف{' '}
          <span className="ms-1 font-normal text-gray-500">NASAB Family Tree</span>
        </h1>

        <div className="flex items-center gap-3">
          {/* Collapse controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nonLeafIds = new Set(edges.map((e) => e.source))
                setCollapsedIds(nonLeafIds)
                try {
                  localStorage.setItem('nasab-collapsed', JSON.stringify([...nonLeafIds]))
                } catch {
                  // ignore
                }
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Collapse all
            </button>
            <button
              type="button"
              onClick={() => {
                setCollapsedIds(new Set())
                localStorage.removeItem('nasab-collapsed')
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Expand all
            </button>
          </div>

          {/* Generation jump */}
          <div className="flex items-center gap-1">
            <label htmlFor="gen-jump" className="text-xs text-gray-500 whitespace-nowrap">
              Gen:
            </label>
            <input
              id="gen-jump"
              type="number"
              min={1}
              max={maxGeneration}
              className="w-14 rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') jumpToGeneration(Number((e.target as HTMLInputElement).value))
              }}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v >= 1 && v <= maxGeneration) jumpToGeneration(v)
              }}
            />
          </div>

          {/* View mode cycle button */}
          <button
            type="button"
            onClick={cycleViewMode}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            aria-label={`Current view: ${viewMode}. Click to change.`}
          >
            {viewMode === '2d' && '2D'}
            {viewMode === '3d' && '3D ↗'}
            {viewMode === 'radial' && 'Radial ◎'}
            {viewMode === 'accessible' && 'Accessible ♿'}
          </button>

          {/* Timeline toggle */}
          <button
            type="button"
            onClick={() => setShowTimeline((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs ${
              showTimeline ? 'bg-gray-100 border-gray-400 text-gray-700' : 'border-gray-300 bg-white text-gray-600'
            } hover:bg-gray-50`}
          >
            Timeline
          </button>

          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            aria-label="Open search"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            Search
            <kbd className="rounded border border-gray-200 px-1 py-0.5 text-[9px] text-gray-400">
              ⌘K
            </kbd>
          </button>

          <ExportButton treeContainerRef={treeContainerRef} filename="nasab-tree.png" />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Branch filter sidebar */}
        <aside className="w-32 flex-shrink-0 border-e border-gray-200 bg-white p-3 shadow-sm md:w-36">
          <p className="mb-2 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            Branches
          </p>
          <BranchFilter
            activeBranches={activeBranches}
            onChange={setActiveBranches}
            showWives={showWives}
            onShowWivesChange={setShowWives}
          />

          {/* Path finder */}
          <PathFinder
            onHighlight={(ids) => setPathHighlightIds(new Set(ids))}
            onClear={() => setPathHighlightIds(new Set())}
          />

          {/* Bookmarks panel */}
          <div className="mt-4 border-t border-gray-200 pt-3">
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              Bookmarks
            </p>
            <div className="text-xs text-gray-600">
              {/* This will be populated by a tRPC query, but for now it's a placeholder */}
              <p className="text-gray-400">No bookmarks yet</p>
            </div>
          </div>
        </aside>

        {/* Tree canvas — conditionally render based on viewMode */}
        <main className="relative flex-1 overflow-hidden" ref={treeContainerRef}>
          {viewMode === '2d' && (
            <div className="relative h-full w-full">
              <TreeCanvas
                nodes={displayNodes}
                edges={displayEdges}
                onNodeClick={handleNodeClick}
              />
              {showTimeline && (
                <TimelineAxis
                  persons={persons}
                  generationY={generationY}
                  canvasHeight={treeContainerRef.current?.clientHeight ?? 0}
                  scrollY={scrollY}
                />
              )}
            </div>
          )}
          {viewMode === '3d' && (
            <TreeCanvas3D
              persons={persons}
              marriages={marriages}
              nodes={nodes as LayoutNode[]} // LayoutNode matches what the worker returns; safe cast
              onNodeClick={handleNodeClick}
            />
          )}
          {viewMode === 'radial' && (
            <TreeCanvasRadial persons={persons} onNodeClick={handleNodeClick} />
          )}
          {viewMode === 'accessible' && (
            <AccessibleTreeView persons={persons} onSelect={handleNodeClick} />
          )}
        </main>
      </div>

      {/* Detail panel */}
      <DetailPanel
        person={selectedPerson}
        marriages={marriages}
        persons={persons}
        onClose={() => setSelectedPerson(null)}
        onFlyTo={handleFlyTo}
      />

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onSelect={handleSearchSelect}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}

export function TreePageClient({ persons, marriages }: TreePageClientInnerProps): React.ReactElement {
  return (
    <ReactFlowProvider>
      <TreePageClientInner persons={persons} marriages={marriages} />
    </ReactFlowProvider>
  )
}
