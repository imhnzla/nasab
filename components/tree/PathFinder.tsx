'use client'
import React, { useState } from 'react'

type PersonResult = { id: string; name_ar: string; name_en: string; generation: number | null }

type PathFinderProps = {
  onHighlight: (ids: string[]) => void
  onClear: () => void
}

export function PathFinder({ onHighlight, onClear }: PathFinderProps): React.ReactElement {
  const [fromId, setFromId] = useState('')
  const [toId, setToId]     = useState('')
  const [path, setPath]     = useState<PersonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleFind(): Promise<void> {
    if (!fromId || !toId) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/path?from=${fromId}&to=${toId}`)
      const data = await res.json() as { path: PersonResult[]; lca?: string; message?: string }
      if (data.path.length === 0) {
        setError(data.message ?? 'No path found')
        onClear()
      } else {
        setPath(data.path)
        onHighlight(data.path.map((p) => p.id))
      }
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-t border-gray-200 mt-3">
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Path finder</p>
      <input
        placeholder="From person ID…"
        value={fromId}
        onChange={(e) => setFromId(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-xs"
      />
      <input
        placeholder="To person ID…"
        value={toId}
        onChange={(e) => setToId(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-xs"
      />
      <div className="flex gap-2">
        <button
          onClick={() => void handleFind()}
          disabled={loading}
          className="flex-1 rounded bg-gray-800 px-2 py-1 text-xs text-white disabled:opacity-50"
        >
          {loading ? '…' : 'Find path'}
        </button>
        <button
          onClick={() => { setPath([]); onClear() }}
          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600"
        >
          Clear
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {path.length > 0 && (
        <div className="mt-1 text-xs text-gray-600">
          <p className="font-medium mb-1">{path.length} steps</p>
          {path.map((p, i) => (
            <p key={p.id}>{i + 1}. {p.name_en}</p>
          ))}
        </div>
      )}
    </div>
  )
}
