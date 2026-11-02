import { useMemo } from 'react'
import {
  Plus, Database, Activity, Lightbulb, ShieldAlert, ArrowRight, Pin,
  TriangleAlert, Clock3, Zap,
} from 'lucide-react'
import GradientText from '../GradientText'
import { Card, CardHead, StatTile, EmptyState, Pill, Meter, RiskTag } from '../components/ui'
import { memoryHealth, relativeTime, NOW } from '../data'
import Tilt from '../Tilt'

export default function Overview({
  memories, folders, suggestions, activity, conflicts, gradientStops,
  onAdd, onOpenPage, onOpenMemory, onResolveConflict,
}) {
  const health = useMemo(() => memoryHealth(memories, suggestions), [memories, suggestions])
  const recent = useMemo(
    () => [...memories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
    [memories]
  )
  const recentlyUsed = useMemo(
    () => [...memories]
      .filter(m => m.enabled)
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
      .slice(0, 5),
    [memories]
  )
  const recentActivity = useMemo(
    () => [...activity].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5),
    [activity]
  )
  const folderName = id => folders.find(f => f.id === id)?.name || 'Uncategorized'
  const folderColor = id => folders.find(f => f.id === id)?.color || 'purple'
  const memoryById = id => memories.find(m => m.id === id)

  return (
    <>
      <section className="dash-hero">
        <div>
          <p className="label">Smart Overview</p>
          <div className="dash-title gradient-title">
            <GradientText
              text="Your memory, at a glance."
              mode="typewriter"
              stops={gradientStops}
              bandBase={0.72}
              duration={1.5}
            />
          </div>
          <p className="dash-sub">
            {memories.length} memories across {folders.length} folders, scoring{' '}
            <strong>{health.score}/100</strong> on memory health.
          </p>
        </div>
        <div className="dash-actions">
          <Pill variant="solid" onClick={onAdd}>
            <Plus size={15} /> Quick-add memory
          </Pill>
          <Pill onClick={() => onOpenPage('Suggestions')}>
            Review {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
            <ArrowRight size={14} />
          </Pill>
        </div>
      </section>

      <section className="stat-row">
        <StatTile
          label="Total memories"
          value={memories.length}
          hint={`${recent.length} added recently`}
          tone="violet"
          icon={Database}
        />
        <StatTile
          label="Active memories"
          value={memories.filter(m => m.enabled).length}
          hint={`${memories.filter(m => m.pinned).length} pinned`}
          tone="green"
          icon={Zap}
        />
        <StatTile
          label="Used this week"
          value={activity.filter(a => a.kind === 'used' && NOW - new Date(a.at) < 7 * 86400000).length}
          hint="Times a memory was applied"
          tone="blue"
          icon={Activity}
        />
        <StatTile
          label="Pending review"
          value={suggestions.length}
          hint="AI suggestions waiting"
          tone="orange"
          icon={Lightbulb}
        />
      </section>

      <div className="dash-grid">
        <Tilt rotationFactor={6}>
          <Card>
            <CardHead
              title="Memory health"
              subtitle="Duplicate, stale and risky memories"
              action={<Pill onClick={() => onOpenPage('All memories')}>Clean up</Pill>}
            />
          <div className="health">
            <div className="health-score">
              <strong>{health.score}</strong>
              <span className="label">/ 100 health score</span>
            </div>
            <Meter value={health.score / 100} tone={health.score > 80 ? 'green' : health.score > 55 ? 'orange' : 'red'} />
          </div>
          <ul className="health-list">
            <li>
              <TriangleAlert size={15} />
              <span><strong>{health.duplicates.length}</strong> duplicate {health.duplicates.length === 1 ? 'group' : 'groups'}</span>
            </li>
            <li>
              <Clock3 size={15} />
              <span><strong>{health.stale.length}</strong> not updated in 120+ days</span>
            </li>
            <li>
              <ShieldAlert size={15} />
              <span><strong>{health.risky.length}</strong> flagged as high risk</span>
            </li>
            <li>
              <Lightbulb size={15} />
              <span><strong>{health.pending}</strong> suggestions not yet reviewed</span>
            </li>
          </ul>
          {conflicts.length > 0 && (
            <div className="conflict-alert">
              <ShieldAlert size={16} />
              <div>
                <strong>{conflicts.length} conflict{conflicts.length === 1 ? '' : 's'} need review</strong>
                <p>{conflicts[0].summary}</p>
              </div>
              <Pill onClick={() => onResolveConflict(conflicts[0])}>Resolve</Pill>
            </div>
          )}
        </Card>
        </Tilt>

        <Card>
          <CardHead
            title="Pending AI suggestions"
            subtitle="Nothing is saved without your approval"
            action={<Pill onClick={() => onOpenPage('Suggestions')}>Open queue</Pill>}
          />
          {suggestions.length ? (
            <div className="mini-list">
              {suggestions.slice(0, 3).map(s => (
                <button key={s.id} type="button" className="mini-row" onClick={() => onOpenPage('Suggestions')}>
                  <span className={`mini-dot ${folderColor(s.categoryId)}`} />
                  <div>
                    <strong>{s.title}</strong>
                    <small>{folderName(s.categoryId)} · {Math.round(s.confidence * 100)}% confidence</small>
                  </div>
                  <RiskTag risk={s.risk} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Queue is clear" description="No suggestions waiting for review." />
          )}
        </Card>

        <Card>
          <CardHead
            title="Recently used"
            subtitle="Memories applied in your conversations"
            action={<Pill onClick={() => onOpenPage('Timeline & Activity')}>Activity</Pill>}
          />
          {recentlyUsed.length ? (
            <div className="mini-list">
              {recentlyUsed.map(m => (
                <button key={m.id} type="button" className="mini-row" onClick={() => onOpenMemory(m)}>
                  <span className={`mini-dot ${folderColor(m.categoryId)}`} />
                  <div>
                    <strong>{m.title}</strong>
                    <small>Used {relativeTime(m.lastUsedAt)} · {m.useCount} times</small>
                  </div>
                  {m.pinned && <Pin size={13} className="pin-mark" />}
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing used yet" description="Memories appear here once they are applied." />
          )}
        </Card>

        <Card>
          <CardHead
            title="Recent additions"
            subtitle="Newest memories you created"
            action={<Pill onClick={() => onOpenPage('All memories')}>View all</Pill>}
          />
          <div className="mini-list">
            {recent.map(m => (
              <button key={m.id} type="button" className="mini-row" onClick={() => onOpenMemory(m)}>
                <span className={`mini-dot ${folderColor(m.categoryId)}`} />
                <div>
                  <strong>{m.title}</strong>
                  <small>{folderName(m.categoryId)} · {relativeTime(m.createdAt)}</small>
                </div>
                <span className="use-count">{m.useCount}×</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Latest activity" subtitle="What changed and why" />
        <div className="activity-strip">
          {recentActivity.map(a => {
            const m = memoryById(a.memoryId)
            return (
              <div key={a.id} className="activity-chip">
                <span className={`activity-kind ${a.kind}`}>{a.kind}</span>
                <strong>{m?.title || 'Removed memory'}</strong>
                <small>{a.reason}</small>
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}
