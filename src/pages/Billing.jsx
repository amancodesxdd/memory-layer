import { useState } from 'react'
import {
  Crown, Check, Cloud, Zap, ShieldCheck, RefreshCw, Download,
  Users, Rocket, CreditCard, Banknote,
} from 'lucide-react'
import { Card, CardHead, Pill } from '../components/ui'

const FREE_FEATURES = [
  { label: 'Up to 50 memories', pro: false },
  { label: 'Basic keyword search', pro: false },
  { label: 'Standard AI suggestions (limited)', pro: false },
  { label: 'Organise with folders', pro: false },
  { label: 'Community support', pro: false },
]

const DEV_FEATURES = [
  { label: 'Unlimited memories', pro: true },
  { label: 'Advanced semantic search', pro: true },
  { label: 'Unlimited AI suggestions', pro: true },
  { label: 'Memory map & timeline', pro: true },
  { label: 'Cloud sync & backup', pro: true },
  { label: 'Bulk edit, export & delete', pro: true },
  { label: 'Priority email support', pro: true },
  { label: 'Unlimited folders & projects', pro: true },
]

const ICONS = {
  memories: Banknote,
  search: Zap,
  suggestions: Rocket,
  folders: Users,
  map: Cloud,
  sync: RefreshCw,
  bulk: Download,
  priority: ShieldCheck,
}

export default function Billing({ plan, onUpgrade, onUpdateSettings }) {
  const isDev = plan === 'developer'
  const [processing, setProcessing] = useState(false)

  const subscribe = async () => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1400))
    onUpgrade()
    setProcessing(false)
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Billing</p>
          <h1 className="dash-title">Choose your plan</h1>
          <p className="dash-sub">
            Upgrade to Developer for unlimited memories, cloud sync and priority support.
          </p>
        </div>
        <div className="dash-actions">
          <Pill
            variant={isDev ? 'solid' : ''}
            onClick={subscribe}
            disabled={isDev || processing}
          >
            {processing ? <CreditCard size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={14} />}
            {isDev ? 'Developer plan active' : processing ? 'Activating…' : 'Upgrade to Developer — ₹799/mo'}
          </Pill>
        </div>
      </section>

      <div className="plan-grid">
        <Card className={`plan-card ${isDev ? '' : 'plan-card-free'}`}>
          <CardHead title="Free" subtitle="Get started with knowU" />
          <div className="plan-price">
            <span className="plan-currency">₹</span>
            <span className="plan-amount">0</span>
            <span className="plan-period">/mo</span>
          </div>
          <ul className="plan-list">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="plan-item">
                <span className={`plan-check ${f.pro ? 'pro' : ''}`}>
                  {f.pro ? <Crown size={13} fill="#fbbf24" stroke="#fbbf24" /> : <Check size={13} />}
                </span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
          {!isDev && (
            <div className="plan-footer">
              <Pill variant="solid" onClick={subscribe} disabled={processing}>
                {processing ? 'Activating…' : 'Start for free'}
              </Pill>
            </div>
          )}
        </Card>

        <Card className="plan-card plan-card-dev">
          <div className="plan-badge">Most popular</div>
          <CardHead title="Developer" subtitle="For power users and teams" />
          <div className="plan-price">
            <span className="plan-currency">₹</span>
            <span className="plan-amount">799</span>
            <span className="plan-period">/mo</span>
          </div>
          <ul className="plan-list">
            {DEV_FEATURES.map((f, i) => (
              <li key={i} className="plan-item">
                <span className="plan-check pro">
                  <Check size={13} />
                </span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
          {isDev ? (
            <div className="plan-footer">
              <Pill variant="solid" disabled>Active plan</Pill>
            </div>
          ) : (
            <div className="plan-footer">
              <Pill variant="solid" onClick={subscribe} disabled={processing}>
                {processing ? 'Activating…' : 'Upgrade to Developer'}
              </Pill>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHead title="Feature comparison" subtitle="What changes when you upgrade" />
        <div className="compare-grid">
          {[{
            feature: 'Memory limit',
            free: '50 memories',
            dev: 'Unlimited',
            icon: 'memories',
          }, {
            feature: 'Search',
            free: 'Keyword only',
            dev: 'Semantic (meaning-based)',
            icon: 'search',
          }, {
            feature: 'AI suggestions',
            free: 'Limited queue',
            dev: 'Unlimited + merge',
            icon: 'suggestions',
          }, {
            feature: 'Folders & projects',
            free: '1 folder',
            dev: 'Unlimited',
            icon: 'folders',
          }, {
            feature: 'Memory map & timeline',
            free: '—',
            dev: 'Included',
            icon: 'map',
          }, {
            feature: 'Cloud sync & backup',
            free: 'Local only',
            dev: 'Auto-sync + export',
            icon: 'sync',
          }, {
            feature: 'Bulk actions',
            free: 'Single memory only',
            dev: 'Select, edit, export, delete',
            icon: 'bulk',
          }, {
            feature: 'Support',
            free: 'Community',
            dev: 'Priority email',
            icon: 'priority',
          }          ].map((row, i) => {
            const Comp = ICONS[row.icon]
            return (
              <div key={i} className="compare-row">
                <div className="compare-cell compare-feature">
                  <span className={"compare-icon " + row.icon}><Comp size={15} /></span>
                  <span>{row.feature}</span>
                </div>
                <div className="compare-cell compare-free">{row.free}</div>
                <div className="compare-cell compare-dev">{row.dev}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHead title="Subscription" subtitle="Manage your knowU plan" />
        <div className="sub-detail">
          <div className="sub-row">
            <span className="sub-label">Current plan</span>
            <span className={`sub-value ${isDev ? 'sub-dev' : 'sub-free'}`}>
              {isDev ? <Crown size={14} fill="#fbbf24" /> : <Banknote size={14} />}
              {isDev ? 'Developer' : 'Free'}
            </span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Billing cycle</span>
            <span className="sub-value">Monthly</span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Next bill date</span>
            <span className="sub-value">1st of every month</span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Amount</span>
            <span className="sub-value">{isDev ? '₹799/mo' : '₹0/mo'}</span>
          </div>
        </div>
        {isDev ? (
          <div className="sub-actions">
            <Pill variant="danger" onClick={() => {
              setPlan('free')
              if (onUpdateSettings) onUpdateSettings({ cloudEnabled: false })
              notify('Downgraded to Free plan')
            }}><Banknote size={14} /> Downgrade to Free</Pill>
          </div>
        ) : (
          <div className="sub-actions">
            <p className="muted small">
              Upgrading unlocks cloud sync, bulk actions, the memory map and priority support.
            </p>
          </div>
        )}
      </Card>
    </>
  )
}
