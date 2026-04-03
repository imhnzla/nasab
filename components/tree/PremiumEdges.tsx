'use client'
/**
 * PremiumEdges — custom React Flow edge components for the NASAB 2D tree.
 *
 * parentChild   → solid gold vertical line (father → child)
 * fatherToWife  → short lapis curved arc (father → wife card)
 * wifeToChild   → lapis-tinted gold line (wife card → child)
 * marriageArc   → lapis bezier arc (two tree-persons married to each other)
 */

import React from 'react'
import { getBezierPath, getStraightPath, BaseEdge } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import { COLOUR, EDGE_PARENT, EDGE_WIFE, EDGE_WIFE_CHILD, EDGE_MARRIAGE } from '@/lib/tree/constants2d'

// ─── Parent → Child ────────────────────────────────────────────────────────────
export function ParentChildEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps): React.ReactElement {
  const highlighted = (data as { highlighted?: boolean } | undefined)?.highlighted
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: highlighted ? COLOUR.goldLight : EDGE_PARENT,
        strokeWidth: highlighted ? 2.5 : 1.5,
        opacity: 0.85,
      }}
    />
  )
}

// ─── Father → Wife connector ───────────────────────────────────────────────────
export function FatherToWifeEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
}: EdgeProps): React.ReactElement {
  // Short straight line from the bottom-right of the father card to the wife card top
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: EDGE_WIFE,
        strokeWidth: 1,
        strokeDasharray: '4 3',
        opacity: 0.7,
      }}
    />
  )
}

// ─── Wife → Child ──────────────────────────────────────────────────────────────
export function WifeToChildEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps): React.ReactElement {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: EDGE_WIFE_CHILD,
        strokeWidth: 1.5,
        opacity: 0.8,
      }}
    />
  )
}

// ─── Marriage arc (between two tree-person nodes) ──────────────────────────────
export function MarriageArcEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
}: EdgeProps): React.ReactElement {
  // Cubic bezier that arcs above both nodes
  const midX = (sourceX + targetX) / 2
  const arcHeight = Math.abs(targetX - sourceX) * 0.3 + 40
  const path = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY - arcHeight}, ${targetX} ${targetY - arcHeight}, ${targetX} ${targetY}`

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: EDGE_MARRIAGE,
        strokeWidth: 1.5,
        strokeDasharray: '6 4',
        opacity: 0.75,
      }}
    />
  )
  // suppress unused midX warning
  void midX
}
