'use client'
import React, { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export function MergePersons(): React.ReactElement {
  const [query, setQuery] = useState('')
  const [keepId, setKeepId]     = useState('')
  const [mergeId, setMergeId]   = useState('')

  const searchQuery = trpc.search.fuzzy.useQuery(
    { q: query, limit: 10 },
    { enabled: query.length > 2 }
  )

  // Add a persons.merge mutation to the persons router:
  // takes keepId + mergeId, re-points all father_id/mother_id references,
  // deletes the merged person, logs to audit_log
  const mergeMutation = trpc.persons.merge.useMutation()

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-sm font-bold text-gray-900 mb-4">Merge Duplicate Persons</h2>

      <input
        placeholder="Search by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm mb-3"
      />

      {searchQuery.data && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Keep this person:</p>
            {searchQuery.data.map((p) => (
              <button
                key={p.id}
                onClick={() => setKeepId(p.id)}
                className={`block w-full text-left rounded px-3 py-1.5 text-xs mb-1 border ${
                  keepId === p.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                {p.name_en} — {p.name_ar}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Merge (delete) this one:</p>
            {searchQuery.data.map((p) => (
              <button
                key={p.id}
                onClick={() => setMergeId(p.id)}
                className={`block w-full text-left rounded px-3 py-1.5 text-xs mb-1 border ${
                  mergeId === p.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                {p.name_en} — {p.name_ar}
              </button>
            ))}
          </div>
        </div>
      )}

      {keepId && mergeId && keepId !== mergeId && (
        <button
          onClick={() => mergeMutation.mutate({ keepId, mergeId })}
          disabled={mergeMutation.isPending}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {mergeMutation.isPending ? 'Merging…' : `Merge → keep ${keepId.slice(0, 8)}…`}
        </button>
      )}
    </div>
  )
}
