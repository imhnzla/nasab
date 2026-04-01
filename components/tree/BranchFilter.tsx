'use client'
// Phase 1 — Sidebar with toggle buttons for Hasanid / Husaynid / Hashemite branches

import React from 'react'
import type { Branch } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

export type BranchFilterProps = {
  activeBranches: Branch[]
  onChange: (branches: Branch[]) => void
  showWives: boolean
  onShowWivesChange: (v: boolean) => void
}

type BranchConfig = {
  value: Branch
  label: string
  labelAr: string
}

const BRANCHES: BranchConfig[] = [
  { value: 'hasanid', label: 'Hasanid', labelAr: 'الحسنيون' },
  { value: 'husaynid', label: 'Husaynid', labelAr: 'الحسينيون' },
  { value: 'hashemite', label: 'Hashemite', labelAr: 'الهاشميون' },
]

const ALL_BRANCHES: Branch[] = ['hasanid', 'husaynid', 'hashemite']

export function BranchFilter({ activeBranches, onChange, showWives, onShowWivesChange }: BranchFilterProps): React.ReactElement {
  const allActive = ALL_BRANCHES.every((b) => activeBranches.includes(b))

  function handleAllToggle(): void {
    onChange(allActive ? [] : ALL_BRANCHES)
  }

  function handleBranchToggle(branch: Branch): void {
    if (activeBranches.includes(branch)) {
      onChange(activeBranches.filter((b) => b !== branch))
    } else {
      onChange([...activeBranches, branch])
    }
  }

  return (
    <div
      className="flex flex-row flex-wrap gap-2 md:flex-col"
      role="group"
      aria-label="Filter by branch"
    >
      {/* All button */}
      <button
        type="button"
        onClick={handleAllToggle}
        className={[
          'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
          allActive
            ? 'border-gray-700 bg-gray-700 text-white'
            : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-50',
        ].join(' ')}
        aria-pressed={allActive}
      >
        All / الكل
      </button>

      {/* Branch toggles */}
      {BRANCHES.map(({ value, label, labelAr }) => {
        const isActive = activeBranches.includes(value)
        const colour = BRANCH_COLOURS[value]

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleBranchToggle(value)}
            aria-pressed={isActive}
            className="rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              isActive
                ? {
                    backgroundColor: colour,
                    borderColor: colour,
                    color: '#ffffff',
                  }
                : {
                    backgroundColor: '#ffffff',
                    borderColor: colour,
                    color: colour,
                  }
            }
          >
            {label}
            <span className="ms-1 opacity-70">{labelAr}</span>
          </button>
        )
      })}

      {/* Show wives toggle */}
      <div
        style={{ borderTop: '1px solid #E5E7EB', marginTop: 12, paddingTop: 12 }}
        className="w-full"
      >
        <label
          className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none"
          htmlFor="show-wives-toggle"
        >
          <input
            id="show-wives-toggle"
            type="checkbox"
            checked={showWives}
            onChange={(e) => onShowWivesChange(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Wives / الزوجات</span>
        </label>
      </div>
    </div>
  )
}
