// Phase 1 — Person detail page (also linked from tree node)
export default function PersonPage({ params }: { params: { id: string } }) {
  return <div>Person {params.id} — Phase 1</div>
}
