import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={`sw ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="sw-knob" />
    </button>
  )
}

export function Card({ children, className = '', ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  )
}

export function CardHead({ title, subtitle, action }) {
  return (
    <header className="card-head">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function Pill({ children, active, onClick, variant = '', type = 'button', ...rest }) {
  const cls = ['pill', active ? 'active' : '', variant].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export function FilterGroup({ children }) {
  return (
    <div className="filter-group" role="group">
      {children}
    </div>
  )
}

export function StatTile({ label, value, hint, tone = 'neutral', icon: Icon }) {
  return (
    <article className={`stat ${tone}`}>
      <div className="stat-top">
        <span className="label">{label}</span>
        {Icon && <Icon size={16} />}
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-mark">✳</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={width ? { width } : undefined}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Meter({ value, tone = 'violet' }) {
  return (
    <div className={`meter ${tone}`}>
      <span style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

export function RiskTag({ risk }) {
  return <span className={`risk ${risk}`}>{risk}</span>
}

export function SourceTag({ source }) {
  return <span className={`source ${source}`}>{source === 'user' ? 'You' : source === 'ai' ? 'AI' : 'Import'}</span>
}
