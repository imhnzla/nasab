'use client'
import React, { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

type CsvRow = {
  name_ar: string
  name_en: string
  father_name_ar?: string
  generation?: string
  birth_date_hijri?: string
  branch?: string
  gender?: string
}

export function BulkImport(): React.ReactElement {
  const [rows, setRows] = useState<CsvRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [committed, setCommitted] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return

    const { default: Papa } = await import('papaparse')
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const errs: string[] = []
        result.data.forEach((row, i) => {
          if (!row.name_ar) errs.push(`Row ${i + 2}: missing name_ar`)
          if (!row.name_en) errs.push(`Row ${i + 2}: missing name_en`)
        })
        setErrors(errs)
        setRows(result.data)
      },
    })
  }

  // persons.bulkCreate — add to persons tRPC router
  const bulkMutation = trpc.persons.bulkCreate.useMutation({
    onSuccess: () => setCommitted(true)
  })

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Bulk CSV Import</h2>
      <p className="text-xs text-gray-500 mb-4">
        Required columns: <code>name_ar</code>, <code>name_en</code>.<br />
        Optional: <code>father_name_ar</code>, <code>generation</code>,
        <code>birth_date_hijri</code>, <code>branch</code>, <code>gender</code>.
      </p>

      <label className="cursor-pointer rounded-md border border-dashed border-gray-300 p-6 flex flex-col items-center gap-2 text-sm text-gray-500 hover:border-gray-400 mb-4">
        Upload CSV file
        <input type="file" accept=".csv" className="sr-only" onChange={(e) => void handleFileChange(e)} />
      </label>

      {errors.length > 0 && (
        <div className="mb-3 rounded bg-red-50 p-3">
          {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
        </div>
      )}

      {rows.length > 0 && errors.length === 0 && !committed && (
        <>
          <div className="rounded border border-gray-200 overflow-auto max-h-60 mb-4">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {Object.keys(rows[0]).map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium text-gray-600">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-1.5 text-gray-700">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="px-3 py-2 text-xs text-gray-400">… and {rows.length - 20} more rows</p>
            )}
          </div>

          <button
            onClick={() => bulkMutation.mutate({ rows })}
            disabled={bulkMutation.isPending}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {bulkMutation.isPending ? 'Importing…' : `Import ${rows.length} persons`}
          </button>
        </>
      )}

      {committed && (
        <p className="text-sm text-emerald-600 font-medium">
          ✓ Import complete — {rows.length} persons added.
        </p>
      )}
    </div>
  )
}
