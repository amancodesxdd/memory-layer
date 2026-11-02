import { useState } from 'react'
import { Check, X, Pencil, Merge, Lightbulb, Sparkles } from 'lucide-react'
import { Card, Pill, EmptyState, Meter, RiskTag } from '../components/ui'
import { relativeTime, RISK_LABEL } from '../data'

export default function SuggestionsCenter({
  suggestions, folders, onApprove, onDismiss, onEdit, onMerge,
}) {
  const [view, setView] = useState('pending')
  const folderName = id => folders.find(f => f.id === id)?.name || 'Uncategorized'
  const folderColor = id => folders.find(f => f.id === id)?.color || 'purple'

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">AI Suggestions Center</p>
          <h1 className="dash-title">Review queue</h1>
          <p className="dash-sub">
            Every suggestion explains why it appeared. Nothing is saved until you approve it.
          </p>
        </div>
        <div className="dash-actions">
          <Pill active={view === 'pending'} onClick={() => setView('pending')}>Pending</Pill>
          <Pill active={view === 'risk'} onClick={() => setView('risk')}>High risk only</Pill>
        </div>
      </section>

      <Card className="explain-strip">
        <Sparkles size={17} />
        <div>
          <strong>How suggestions work</strong>
          <p>
            Suggestions are inferred from your conversations, never stored directly. Confidence
            reflects how often the pattern appeared. High-risk suggestions always require review.
          </p>
        </div>
      </Card>

      {suggestions.filter(s => view === 'pending' || s.risk === 'high').length ? (
        <div className="sug-list">
          {suggestions
            .filter(s => view === 'pending' || s.risk === 'high')
            .map(s => (
              <Card key={s.id} className="sug-card">
                <div className="sug-main">
                  <div className="sug-icon"><Lightbulb size={18} /></div>
                  <div className="sug-body">
                    <div className="sug-title-row">
                      <h3>{s.title}</h3>
                      <RiskTag risk={s.risk} />
                    </div>
                    <p className="sug-details">{s.details}</p>

                    <div className="sug-reason">
                      <span className="label">Why this was suggested</span>
                      <p>{s.reason}</p>
                      <div className="sug-signals">
                        {(s.signals || []).map(sig => <span key={sig} className="tag">{sig}</span>)}
                      </div>
                    </div>

                    <div className="sug-confidence">
                      <div className="sug-conf-row">
                        <span className="label">Confidence</span>
                        <strong>{Math.round(s.confidence * 100)}%</strong>
                      </div>
                      <Meter
                        value={s.confidence}
                        tone={s.confidence > 0.8 ? 'green' : s.confidence > 0.55 ? 'orange' : 'red'}
                      />
                      <small className="muted">
                        {RISK_LABEL[s.risk]} · detected {relativeTime(s.createdAt)} · saved to{' '}
                        <span className={`folder-chip ${folderColor(s.categoryId)}`}>{folderName(s.categoryId)}</span>
                      </small>
                    </div>
                  </div>
                </div>

                <div className="sug-actions">
                  <Pill variant="solid" onClick={() => onApprove(s)}>
                    <Check size={14} /> Approve
                  </Pill>
                  <Pill onClick={() => onEdit(s)}><Pencil size={14} /> Edit first</Pill>
                  {s.targetMemoryId && (
                    <Pill onClick={() => onMerge(s)}><Merge size={14} /> Merge</Pill>
                  )}
                  <Pill variant="danger" onClick={() => onDismiss(s)}><X size={14} /> Reject</Pill>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Queue is clear"
            description={view === 'risk' ? 'No high-risk suggestions are waiting.' : 'Nothing needs your review right now.'}
          />
        </Card>
      )}
    </>
  )
}
