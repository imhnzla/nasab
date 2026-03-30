'use client'
// Phase 1 — Client wrapper for the interactive family tree page
// Manages: layout worker, branch filter state, detail panel, search overlay, export

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { PersonRow, Branch, PersonFlowNode, FamilyEdge, SearchHit } from '@/lib/tree/types'
import type { LayoutNode, LayoutWorkerOutput } from '@/lib/workers/layout.worker'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { BranchFilter } from '@/components/tree/BranchFilter'
import { DetailPanel } from '@/components/tree/DetailPanel'
import { SearchOverlay } from '@/components/tree/SearchOverlay'
import { ExportButton } from '@/components/tree/ExportButton'

type TreePageClientInnerProps = {
  persons: PersonRow[]
}

const ALL_BRANCHES: Branch[] = ['hasanid', 'husaynid', 'hashemite']

function layoutNodesToFlowNodes(layoutNodes: LayoutNode[]): PersonFlowNode[] {
  return layoutNodes.map((n) => ({
    id: n.id,
    type: 'person' as const,
    position: n.position,
    data: { person: n.data.person as PersonRow },
  }))
}

function TreePageClientInner({ persons }: TreePageClientInnerProps): React.ReactElement {
  const { setCenter } = useReactFlow()

  const [nodes, setNodes] = useState<PersonFlowNode[]>([])
  const [edges, setEdges] = useState<FamilyEdge[]>([])
  const [activeBranches, setActiveBranches] = useState<Branch[]>(ALL_BRANCHES)
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const treeContainerRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)

  // Run layout worker whenever persons or branch filter changes
  useEffect(() => {
    // Filter persons by active branches
    // Persons with null branch are always shown (e.g. the root Prophet ﷺ)
    const filtered = persons.filter((p) => p.branch === null || activeBranches.includes(p.branch))

    // Create or reuse worker
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
    worker.postMessage({ persons: filtered })

    return () => {
      worker.removeEventListener('message', handleMessage)
    }
  }, [persons, activeBranches])

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

  const handleSearchSelect = useCallback(
    (hit: SearchHit) => {
      // SearchHit is the lean tRPC return type (no Json fields). Resolve the full
      // PersonRow from the persons prop so DetailPanel gets sources, bio, dates etc.
      const person = persons.find((p) => p.id === hit.id) ?? null
      setSelectedPerson(person)
      setIsSearchOpen(false)

      // Pan the canvas to that node
      const node = nodes.find((n) => n.id === hit.id)
      if (node) {
        setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 600 })
      }
    },
    [persons, nodes, setCenter]
  )

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <h1 className="text-sm font-bold text-gray-900">
          شجرة النسب الشريف{' '}
          <span className="ms-1 font-normal text-gray-500">NASAB Family Tree</span>
        </h1>

        <div className="flex items-center gap-3">
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
          <BranchFilter activeBranches={activeBranches} onChange={setActiveBranches} />
        </aside>

        {/* Tree canvas */}
        <main className="relative flex-1 overflow-hidden" ref={treeContainerRef}>
          <TreeCanvas nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
        </main>
      </div>

      {/* Detail panel */}
      <DetailPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onSelect={handleSearchSelect}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}

export function TreePageClient({ persons }: TreePageClientInnerProps): React.ReactElement {
  return (
    <ReactFlowProvider>
      <TreePageClientInner persons={persons} />
    </ReactFlowProvider>
  )
}
