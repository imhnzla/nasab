// Phase 4 — Submission detail and PDF review panel
// Next.js 16: params is a Promise
export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>Submission {id} — Phase 4</div>
}
