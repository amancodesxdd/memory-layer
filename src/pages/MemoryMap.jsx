import { useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Network, X } from 'lucide-react'
import { Card, CardHead, Pill, EmptyState } from '../components/ui'
import { relativeTime, SOURCE_LABEL } from '../data'

const W = 900
const H = 700
const CX = W / 2
const CY = H / 2
const FOLDER_R = 140
const MEMORY_R = 285

export default function MemoryMap({ memories, folders, onOpenMemory, plan }) {
  const [selected, setSelected] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const graph = useMemo(() => {
    const active = memories.filter(m => m.enabled)
    const cx = CX
    const cy = CY
    const folderRing = folders.filter(f => f.enabled).map((f, i, arr) => {
      const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2
      return {
        kind: 'folder',
        id: f.id,
        label: f.name,
        color: f.color,
        x: cx + Math.cos(angle) * FOLDER_R,
        y: cy + Math.sin(angle) * FOLDER_R,
      }
    })

    const nodes = []
    const edges = []
    folderRing.forEach(folder => {
      const items = active.filter(m => m.categoryId === folder.id)
      items.forEach((m, i) => {
        const base = Math.atan2(folder.y - cy, folder.x - cx)
        const spread = 0.85
        const angle = base + (items.length === 1 ? 0 : (i / (items.length - 1) - 0.5) * spread)
        const node = {
          kind: 'memory',
          id: m.id,
          label: m.title,
          color: folder.color,
          x: cx + Math.cos(angle) * MEMORY_R,
          y: cy + Math.sin(angle) * MEMORY_R,
          memory: m,
          pinned: m.pinned,
        }
        nodes.push(node)
        edges.push({ from: folder.id, to: m.id, kind: 'folder' })
      })
    })

    const related = []
    active.forEach((a, i) => {
      active.slice(i + 1).forEach(b => {
        const shared = (a.tags || []).filter(t => (b.tags || []).includes(t))
        if (shared.length) {
          const na = nodes.find(n => n.id === a.id)
          const nb = nodes.find(n => n.id === b.id)
          if (na && nb) related.push({ from: na, to: nb, kind: 'related', label: shared.join(', ') })
        }
      })
    })

    return { folderRing, nodes, edges, related, cx, cy }
  }, [memories, folders])

  if (plan !== 'developer') {
    return (
      <>
        <section className="page-head">
          <div>
            <p className="label">Memory Map</p>
            <h1 className="dash-title">Explore connections</h1>
            <p className="dash-sub">
              The memory map is a Developer plan feature. Upgrade to visualise your memory graph.
            </p>
          </div>
          <div className="dash-actions">
            <Pill variant="solid">Upgrade to Developer</Pill>
          </div>
        </section>
        <Card>
          <EmptyState
            title="Upgrade to Developer"
            description="Unlimited memories, cloud sync, memory map and priority support are included in the Developer plan (₹799/mo)."
            action={<Pill variant="solid">Upgrade now</Pill>}
          />
        </Card>
      </>
    )
  }

  const selectedMemory = selected ? memories.find(m => m.id === selected) : null
  const folderName = id => folders.find(f => f.id === id)?.name || 'Uncategorized'

  const onPointerDown = e => {
    dragRef.current = { x: e.clientX, y: e.clientY, pan }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = e => {
    if (!dragRef.current) return
    const { x, y, pan: start } = dragRef.current
    setPan({ x: start.x + (e.clientX - x), y: start.y + (e.clientY - y) })
  }
  const onPointerUp = () => { dragRef.current = null }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Memory Map</p>
          <h1 className="dash-title">Explore connections</h1>
          <p className="dash-sub">
            {graph.nodes.length} memories connected across {graph.folderRing.length} folders ·{' '}
            {graph.related.length} shared-tag links
          </p>
        </div>
        <div className="dash-actions">
          <Pill onClick={() => setZoom(z => Math.min(2, z + 0.15))}><ZoomIn size={14} /> Zoom</Pill>
          <Pill onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}><ZoomOut size={14} /> Out</Pill>
          <Pill onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}><Maximize2 size={14} /> Reset</Pill>
        </div>
      </section>

      <div className="map-layout">
        <Card className="map-card">
          {graph.nodes.length ? (
            <div className="map-canvas">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <g transform={`translate(${pan.x / zoom} ${pan.y / zoom}) scale(${zoom})`}>
                  {graph.edges.map((e, i) => {
                    const from = graph.folderRing.find(f => f.id === e.from)
                    const to = graph.nodes.find(n => n.id === e.to)
                    if (!from || !to) return null
                    return (
                      <line
                        key={i}
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        className={`map-edge ${selected && (selected === e.from || selected === e.to) ? 'hot' : ''}`}
                      />
                    )
                  })}
                  {graph.related.map((e, i) => (
                    <line
                      key={`r${i}`}
                      x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                      className={`map-edge related ${selected === e.from.id || selected === e.to.id ? 'hot' : ''}`}
                    >
                      <title>{e.label}</title>
                    </line>
                  ))}

                  {graph.folderRing.map(f => (
                    <g
                      key={f.id}
                      className={`map-folder ${selected === f.id ? 'hot' : ''}`}
                      onClick={() => setSelected(selected === f.id ? null : f.id)}
                    >
                      <circle cx={f.x} cy={f.y} r={26} className={`map-hub ${f.color}`} />
                      <text x={f.x} y={f.y + 4} textAnchor="middle" className="map-hub-label">{f.label.slice(0, 2)}</text>
                      <text x={f.x} y={f.y + 44} textAnchor="middle" className="map-label">{f.label}</text>
                    </g>
                  ))}

                  {graph.nodes.map(n => (
                    <g
                      key={n.id}
                      className={`map-node ${selected === n.id ? 'hot' : ''}`}
                      onClick={() => setSelected(selected === n.id ? null : n.id)}
                    >
                      <circle cx={n.x} cy={n.y} r={n.pinned ? 11 : 8} className={`map-dot ${n.color}`} />
                      <text x={n.x} y={n.y + (n.pinned ? 28 : 24)} textAnchor="middle" className="map-label">
                        {n.label.length > 24 ? `${n.label.slice(0, 24)}…` : n.label}
                      </text>
                      <title>{n.label}</title>
                    </g>
                  ))}
                </g>
              </svg>
              <div className="map-hint"><MousePointer2 size={13} /> Drag to pan · click a node to inspect</div>
              <div className="map-legend">
                <span><i className="lg hub" /> Folder</span>
                <span><i className="lg dot" /> Memory</span>
                <span><i className="lg rel" /> Shared tag</span>
              </div>
            </div>
          ) : (
            <EmptyState title="No connections yet" description="Enable memories to build the graph." />
          )}
        </Card>

        <Card className="map-detail">
          <CardHead
            title="Node details"
            subtitle={selectedMemory ? folderName(selectedMemory.categoryId) : 'Select a node'}
            action={selected ? <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Clear"><X size={15} /></button> : null}
          />
          {selectedMemory ? (
            <div className="detail-body">
              <h3>{selectedMemory.title}</h3>
              <p>{selectedMemory.details}</p>
              <dl className="detail-grid">
                <div><dt>Source</dt><dd>{SOURCE_LABEL[selectedMemory.source]}</dd></div>
                <div><dt>Used</dt><dd>{selectedMemory.useCount} times</dd></div>
                <div><dt>Last used</dt><dd>{relativeTime(selectedMemory.lastUsedAt)}</dd></div>
                <div><dt>Created</dt><dd>{relativeTime(selectedMemory.createdAt)}</dd></div>
                <div><dt>Confidence</dt><dd>{Math.round(selectedMemory.confidence * 100)}%</dd></div>
                <div><dt>Risk</dt><dd>{selectedMemory.risk}</dd></div>
              </dl>
              <div className="tag-row">
                {(selectedMemory.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <Pill variant="solid" onClick={() => onOpenMemory(selectedMemory)}>Open memory</Pill>
            </div>
          ) : (
            <div className="detail-body">
              <Network size={26} className="muted" />
              <p className="muted">
                Click a folder hub or memory node. Shared tags are drawn as links between memories,
                and folders anchor their members to the centre of the map.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
