// Phase 1 — Search page
// Public route: /[locale]/search

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for ancestors and descendants in the verified lineage of Prophet Muhammad ﷺ.',
}

export default function SearchPage(): JSX.Element {
  // TODO: Phase 1 — render full-page search UI backed by tRPC search.fuzzy
  return <div>Search — Phase 1</div>
}
