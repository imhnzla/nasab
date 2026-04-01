'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { PersonRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

type RadialNode = d3.HierarchyPointNode<PersonRow>

type TreeCanvasRadialProps = {
  persons: PersonRow[]
  onNodeClick: (personId: string) => void
}

export function TreeCanvasRadial({ persons, onNodeClick }: TreeCanvasRadialProps): React.ReactElement {
  const svgRef = useRef<SVGSVGElement>(null)
  const [rootId, setRootId] = useState<string | null>(null)

  const draw = useCallback(() => {
    if (!svgRef.current || persons.length === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width  = svgRef.current.clientWidth || 900
    const height = svgRef.current.clientHeight || 900
    const radius = Math.min(width, height) / 2 - 40

    // Build hierarchy from father_id
    const map = new Map(persons.map((p) => [p.id, { ...p, children: [] as PersonRow[] }]))
    let root: PersonRow | null = null
    for (const p of persons) {
      if (p.father_id && map.has(p.father_id)) {
        map.get(p.father_id)!.children.push(map.get(p.id)!)
      } else {
        root = map.get(p.id) ?? null
      }
    }

    // Override root if user re-rooted
    if (rootId && map.has(rootId)) root = map.get(rootId)!
    if (!root) return

    const hierarchy = d3.hierarchy(root as { children?: PersonRow[] } & PersonRow)
    const tree = d3.tree<typeof hierarchy['data']>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    const treeData = tree(hierarchy) as RadialNode

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Links
    g.append('g').selectAll('path')
      .data(treeData.links())
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#D1D5DB')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkRadial<d3.HierarchyPointLink<PersonRow>, RadialNode>()
        .angle((d) => d.x)
        .radius((d) => d.y) as unknown as (d: d3.HierarchyPointLink<PersonRow>) => string)

    // Node groups
    const node = g.append('g').selectAll('g')
      .data(treeData.descendants())
      .join('g')
      .attr('transform', (d) => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        onNodeClick(d.data.id)
        setRootId(d.data.id)  // re-root on click
      })

    const colour = (d: RadialNode) =>
      d.data.branch ? BRANCH_COLOURS[d.data.branch as keyof typeof BRANCH_COLOURS] : '#6B7280'

    // Circles
    node.append('circle')
      .attr('r', 5)
      .attr('fill', colour)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)

    // Labels
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d) => d.x < Math.PI === !d.children ? 8 : -8)
      .attr('text-anchor', (d) => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', (d) => d.x >= Math.PI ? 'rotate(180)' : null)
      .style('font-size', '10px')
      .style('fill', '#374151')
      .text((d) => d.data.name_en)

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', `translate(${event.transform.x + width / 2},${event.transform.y + height / 2}) scale(${event.transform.k})`)
      })
    svg.call(zoom)
  }, [persons, onNodeClick, rootId])

  useEffect(() => { draw() }, [draw])

  return (
    <svg
      ref={svgRef}
      className="h-full w-full"
      style={{ background: '#F9FAFB' }}
    />
  )
}
