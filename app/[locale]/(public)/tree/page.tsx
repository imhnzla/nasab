// Phase 1 — Interactive Family Tree
// Public route: /[locale]/tree
// See docs/build-plan.md#phase-1 and .claude/agents/tree-visualisation.md

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Family Tree',
  description: 'Explore the verified lineage of Prophet Muhammad ﷺ across 8+ generations.',
  openGraph: {
    title: 'NASAB Family Tree | شجرة النسب الشريف',
    description: 'Explore the verified lineage of Prophet Muhammad ﷺ across 8+ generations.',
    type: 'website',
  },
}

export default function TreePage(): JSX.Element {
  // TODO: Phase 1 — render TreeCanvas + BranchFilter + SearchOverlay + DetailPanel
  return <div>Tree — Phase 1</div>
}
