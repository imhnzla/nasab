// Phase 2 — OCR correction UI (side-by-side PDF + extracted names)
// Next.js 16: params is a Promise
export default async function OcrJobPage({
  params,
}: {
  params: Promise<{ job_id: string }>
}) {
  const { job_id } = await params
  return <div>OCR Job {job_id} — Phase 2</div>
}
