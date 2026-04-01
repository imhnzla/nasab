'use client'
import React, { useState } from 'react'
import type { PersonRow } from '@/lib/tree/types'

type AccessibleTreeViewProps = {
  persons: PersonRow[]
  onSelect: (personId: string) => void
}

type TreeNodeMap = Map<string, PersonRow & { children: string[] }>

function buildTree(persons: PersonRow[]): { map: TreeNodeMap; rootIds: string[] } {
  const map: TreeNodeMap = new Map(
    persons.map((p) => [p.id, { ...p, children: [] }])
  )
  const rootIds: string[] = []
  for (const p of persons) {
    if (p.father_id && map.has(p.father_id)) {
      map.get(p.father_id)!.children.push(p.id)
    } else {
      rootIds.push(p.id)
    }
  }
  return { map, rootIds }
}

function PersonItem({
  id, map, onSelect, depth,
}: {
  id: string; map: TreeNodeMap; onSelect: (id: string) => void; depth: number
}): React.ReactElement | null {
  const [expanded, setExpanded] = useState(depth < 2)
  const person = map.get(id)
  if (!person) return null
  const hasChildren = person.children.length > 0

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <button
        onClick={() => { onSelect(id); if (hasChildren) setExpanded((v) => !v) }}
        className="flex items-center gap-1 py-0.5 text-left text-sm text-gray-800 hover:text-gray-900"
        style={{ paddingLeft: depth * 16 }}
      >
        {hasChildren && (
          <span aria-hidden className="text-gray-400 text-xs w-3">
            {expanded ? '▾' : '▸'}
          </span>
        )}
        <span className="font-medium">{person.name_en}</span>
        <span dir="rtl" className="text-gray-500 text-xs">{person.name_ar}</span>
        {person.generation && (
          <span className="text-gray-400 text-xs">· Gen {person.generation}</span>
        )}
      </button>

      {hasChildren && expanded && (
        <ul role="group">
          {person.children.map((childId) => (
            <PersonItem key={childId} id={childId} map={map} onSelect={onSelect} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function AccessibleTreeView({ persons, onSelect }: AccessibleTreeViewProps): React.ReactElement {
  const { map, rootIds } = buildTree(persons)

  return (
    <div className="h-full overflow-y-auto p-4 bg-white" aria-label="Family tree — accessible view">
      <ul role="tree" className="space-y-0.5">
        {rootIds.map((id) => (
          <PersonItem key={id} id={id} map={map} onSelect={onSelect} depth={0} />
        ))}
      </ul>
    </div>
  )
}
