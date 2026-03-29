'use client'
// Phase 1 — Custom @xyflow/react node
// Displays: Arabic name (primary), English name (secondary), branch colour border,
// generation badge, verified checkmark
// Branch colours: hasanid=#1B5E20  husaynid=#0D1B2A  hashemite=#C9A84C

import type { NodeProps } from '@xyflow/react'
import type { PersonFlowNode } from '@/lib/tree/types'

export function PersonNode(_props: NodeProps<PersonFlowNode>): JSX.Element {
  // TODO: Phase 1 — render styled node card using props.data.person
  return <div>PersonNode — Phase 1</div>
}
