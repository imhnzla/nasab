// Phase 1 — Person detail page
// Public route: /[locale]/person/[id]
// Next.js 16: params is a Promise

import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  // TODO: Phase 1 — fetch person by id and generate dynamic title/description/OG image
  return {
    title: `Person ${id}`,
    description: "View the lineage and biography of this member of the Prophet's family tree.",
  }
}

export default async function PersonPage({ params }: PageProps): Promise<JSX.Element> {
  const { id } = await params
  // TODO: Phase 1 — fetch person, render full biography with sources
  return <div>Person {id} — Phase 1</div>
}
