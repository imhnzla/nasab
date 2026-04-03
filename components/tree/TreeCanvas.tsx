'use client'
/**
 * TreeCanvas — Premium 2D React Flow canvas for the NASAB family tree.
 *
 * Node types:  person → PersonNodeCard, wife → WifeNodeCard
 * Edge types:  parentChild, fatherToWife, wifeToChild, marriageArc
 * Theme:       dark void (#0D0B08) background, no grid — clean manuscript feel
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react'
import type { NodeTypes, EdgeTypes, NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { AnyFlowNode, FamilyEdge } from '@/lib/tree/types'
import { PersonNodeCard }  from './PersonNodeCard'
import { WifeNodeCard }    from './WifeNodeCard'
import {
  ParentChildEdge,
  FatherToWifeEdge,
  WifeToChildEdge,
  MarriageArcEdge,
} from './PremiumEdges'
import { COLOUR, BRANCH_BORDER } from '@/lib/tree/constants2d'

// ─── Node and edge type maps ───────────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  person: PersonNodeCard as NodeTypes[string],
  wife:   WifeNodeCard   as NodeTypes[string],
}

const edgeTypes: EdgeTypes = {
  parentChild:  ParentChildEdge,
  fatherToWife: FatherToWifeEdge,
  wifeToChild:  WifeToChildEdge,
  marriageArc:  MarriageArcEdge,
}

// ─── Props ────────────────────────────────────────────────────────────────────

export type TreeCanvasProps = {
  nodes: AnyFlowNode[]
  edges: FamilyEdge[]
  onNodeClick?: (personId: string) => void
}

// ─── MiniMap node colour helper ───────────────────────────────────────────────

function minimapNodeColor(node: { data: unknown }): string {
  const branch = (node.data as { person?: { branch?: string } })?.person?.branch
  if (branch === 'hasanid')  return BRANCH_BORDER.hasanid
  if (branch === 'husaynid') return BRANCH_BORDER.husaynid
  if (branch === 'hashemite') return BRANCH_BORDER.hashemite
  return COLOUR.lapis // wife nodes
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export function TreeCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: TreeCanvasProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { fitView } = useReactFlow()

  // Sync external layout changes into React Flow state
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Re-fit when layout changes (first load or branch filter change)
  useEffect(() => {
    if (initialNodes.length === 0) return
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 })
    }, 80)
    return () => clearTimeout(timer)
  }, [initialNodes, fitView])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // Only propagate clicks on person/wife nodes (not internal React Flow nodes)
      if (node.type === 'person' || node.type === 'wife') {
        onNodeClick?.(node.id)
      }
    },
    [onNodeClick]
  )

  const proOptions = useMemo(() => ({ hideAttribution: false }), [])

  return (
    <div
      className="h-full w-full"
      style={{ background: COLOUR.void }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.05}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={proOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        // Remove default blue selection outline — we style selected state ourselves
        style={{ background: COLOUR.void }}
      >
        {/* Subtle dot grid — very faint on dark background */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <pattern id="nasab-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill={`${COLOUR.dust}18`} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nasab-grid)" />
        </svg>

        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor={`${COLOUR.void}CC`}
          style={{
            background: `${COLOUR.void}EE`,
            border: `1px solid ${COLOUR.dust}40`,
            borderRadius: 8,
          }}
          nodeStrokeWidth={0}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
