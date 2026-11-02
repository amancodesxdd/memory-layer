import { useMemo, useState } from 'react'
import {
  History, Plus, Pencil, Merge, Trash2, RotateCcw, Activity, ShieldAlert,
  Check, Copy, EyeOff,
} from 'lucide-react'
import { Card, CardHead, Pill, EmptyState } from '../components/ui'
import { relativeTime, formatDate } from '../data'

const KIND_ICON = {
  added: Plus,
  edited: Pencil,
  merged: Merge,
  deleted: Trash2,
  used: Activity,
  blocked: ShieldAlert,
  disabled: EyeOff,
  enabled: Check,
}

export default function TimelineActivity({
  memories, activity, conflicts,
  onOpenMemory, onRestore, onDisableUse, onResolveConflict,
}) {
  const [tab, setTab] = useState('timeline')
  const memoryById = id => memories.find(m => m.id === id)

  const events = useMemo(() => {
    const find = id => memories.find(m => m.id === id)
    const list = []
    memories.forEach(m => {
      list.push({ id: `add-${m.id}`, kind: 'added', at: m.createdAt, memoryId: m.id, title: m.title, detail: 'Memory created' })
      ;(m.history || []).forEach(h => {
        list.push({ id: `h-${m.id}-${h.version}`, kind: 'edited', at: h.at, memoryId: m.id, title: h.title, detail: `Restored content from version ${h.version}`, version: h.version })
      })
    })
    activity.forEach(a => {
      const m = find(a.memoryId)
      list.push({ id: a.id, kind: a.kind, at: a.at, memoryId: a.memoryId, title: m?.title || 'Removed memory', detail: a.reason })
    })
    return list.sort((a, b) => new Date(b.at) - new Date(a.at))
  }, [memories, activity])

  const usage = useMemo(
    () => activity.filter(a => a.kind === 'used').sort((a, b) => new Date(b.at) - new Date(a.at)),
    [activity]
  )

  const grouped = useMemo(() => {
    const map = new Map()
    events.forEach(e => {
      const key = formatDate(e.at)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    })
    return [...map.entries()]
  }, [events])

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Timeline & Activity</p>
          <h1 className="dash-title">History and usage</h1>
          <p className="dash-sub">
            {events.length} recorded events · {usage.length} memory applications
          </p>
        </div>
        <div className="dash-actions">
          <Pill active={tab === 'timeline'} onClick={() => setTab('timeline')}>Timeline</Pill>
          <Pill active={tab === 'activity'} onClick={() => setTab('activity')}>Memory activity</Pill>
          <Pill active={tab === 'conflicts'} onClick={() => setTab('conflicts')}>
            Conflicts{conflicts.length ? ` (${conflicts.length})` : ''}
          </Pill>
        </div>
      </section>

      {tab === 'timeline' && (
        <>
          {conflicts.length > 0 && (
            <Card className="conflict-banner">
              <ShieldAlert size={17} />
              <div>
                <strong>{conflicts.length} conflict{conflicts.length === 1 ? '' : 's'} waiting</strong>
                <p>{conflicts[0].summary}</p>
              </div>
              <Pill onClick={() => setTab('conflicts')}>Open conflict center</Pill>
            </Card>
          )}

          {grouped.length ? (
            <div className="timeline">
              {grouped.map(([day, items]) => (
                <div key={day} className="tl-group">
                  <h3 className="tl-day">{day}</h3>
                  <div className="tl-items">
                    {items.map(e => {
                      const Icon = KIND_ICON[e.kind] || History
                      return (
                        <div key={e.id} className={`tl-item ${e.kind}`}>
                          <span className="tl-icon"><Icon size={14} /></span>
                          <div className="tl-body">
                            <strong>{e.title}</strong>
                            <p>{e.detail}</p>
                          </div>
                          <div className="tl-actions">
                            <span className="tl-time">{relativeTime(e.at)}</span>
                            {e.version && (
                              <button type="button" className="icon-btn" title={`Restore version ${e.version}`} onClick={() => onRestore(e.memoryId, e.version)}>
                                <RotateCcw size={15} />
                              </button>
                            )}
                            {memoryById(e.memoryId) && (
                              <button type="button" className="icon-btn" title="Open memory" onClick={() => onOpenMemory(memoryById(e.memoryId))}>
                                <History size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card><EmptyState title="No history yet" description="Changes will appear here." /></Card>
          )}
        </>
      )}

      {tab === 'activity' && (
        <Card>
          <CardHead
            title="Memory activity"
            subtitle="Where each memory was used, when, and why it was relevant"
          />
          {usage.length ? (
            <div className="activity-table">
              <div className="at-head">
                <span>Memory</span><span>Surface</span><span>Reason</span><span>When</span><span />
              </div>
              {usage.map(a => {
                const m = memoryById(a.memoryId)
                if (!m) return null
                return (
                  <div key={a.id} className="at-row">
                    <div className="at-name">
                      <strong>{m.title}</strong>
                      <small>{m.useCount} total uses</small>
                    </div>
                    <span className="at-surface">{a.surface}</span>
                    <span className="at-reason">{a.reason}</span>
                    <span className="at-time">{relativeTime(a.at)}</span>
                    <button type="button" className="icon-btn" title="Disable future use" onClick={() => onDisableUse(a.memoryId)}>
                      <EyeOff size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No usage recorded" description="Memories appear here once they are applied in a chat." />
          )}
        </Card>
      )}

      {tab === 'conflicts' && (
        <>
          {conflicts.length ? conflicts.map(conflict => {
            const pair = conflict.memoryIds.map(memoryById).filter(Boolean)
            return (
              <Card key={conflict.id} className="conflict-card">
                <CardHead title="Conflicting memories" subtitle={conflict.summary} />
                <div className="conflict-pair">
                  {pair.map(m => (
                    <article key={m.id} className="conflict-side">
                      <div className="conflict-side-head">
                        <h3>{m.title}</h3>
                        <span className="label">updated {relativeTime(m.updatedAt)}</span>
                      </div>
                      <p>{m.details}</p>
                      <div className="tag-row">
                        {(m.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                      <div className="conflict-actions">
                        <Pill variant="solid" onClick={() => onResolveConflict(conflict, { keep: m.id })}>
                          <Check size={13} /> Keep this one
                        </Pill>
                        <Pill onClick={() => onResolveConflict(conflict, { keep: 'both', context: m.id })}>
                          <Copy size={13} /> Keep both, context here
                        </Pill>
                        <Pill variant="danger" onClick={() => onResolveConflict(conflict, { remove: m.id })}>
                          <Trash2 size={13} /> Remove this one
                        </Pill>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
            )
          }) : (
            <Card><EmptyState title="No conflicts" description="Every memory agrees with the others." /></Card>
          )}
        </>
      )}
    </>
  )
}
