'use client'
// Root @xyflow/react wrapper — registers all node and edge types

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react'
import type { NodeTypes, EdgeTypes, Connection, NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { AnyFlowNode, FamilyEdge } from '@/lib/tree/types'
import { PersonNode }        from './PersonNode'
import { SpouseNode }        from './SpouseNode'
import { JunctionNode }      from './JunctionNode'
import { BracketNode }       from './BracketNode'
import { EdgeRenderer }      from './EdgeRenderer'
import { MarriageEdge }      from './MarriageEdge'
import { CrossMarriageEdge } from './CrossMarriageEdge'

export type TreeCanvasProps = {
  nodes: AnyFlowNode[]
  edges: FamilyEdge[]
  onNodeClick?: (personId: string) => void
}

const nodeTypes: NodeTypes = {
  person:   PersonNode   as NodeTypes[string],
  spouse:   SpouseNode   as NodeTypes[string],
  junction: JunctionNode as NodeTypes[string],
  bracket:  BracketNode  as NodeTypes[string],
}

const edgeTypes: EdgeTypes = {
  smoothstep:    EdgeRenderer,
  marriage:      MarriageEdge,
  crossMarriage: CrossMarriageEdge,
}

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, color: '#9CA3AF', width: 16, height: 16 },
}

export function TreeCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: TreeCanvasProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => { setNodes(initialNodes) }, [initialNodes, setNodes])
  useEffect(() => { setEdges(initialEdges) }, [initialEdges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => { onNodeClick?.(node.id) },
    [onNodeClick],
  )

  const proOptions = useMemo(() => ({ hideAttribution: false }), [])

  return (
    <div className="h-full min-h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={proOptions}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e5e7eb" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const branch = (node.data as { person?: { branch?: string } })?.person?.branch
            if (branch === 'hasanid')  return '#1B5E20'
            if (branch === 'husaynid') return '#0D1B2A'
            if (branch === 'hashemite') return '#C9A84C'
            return '#D4537E'
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
