// Phase 1 — Person detail page (also linked from tree node)
// Next.js 16: params is a Promise
export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>Person {id} — Phase 1</div>
}
