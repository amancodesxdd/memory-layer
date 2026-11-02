import { useState } from 'react'
import {
  UserCog, RefreshCw, Database, HardDrive, Cloud, CloudOff, AlertTriangle,
  Download, Trash2, ShieldCheck, Clock, Palette, Save,
} from 'lucide-react'
import { Card, CardHead, Pill, Toggle, EmptyState } from '../components/ui'
import { relativeTime } from '../data'
import { PALETTES, stopsToCss, makeStops } from '../palettes'

export default function Settings({
  settings, plan, themePalette, onThemePalette,
  customGradient, onCustomGradient,
  savedGradients, saveGradient, deleteGradient,
  onUpdate, memories, suggestions, sync, onToggleCloud,
  onSyncNow, onExport, onBackup, onClear,
}) {
  const [tab, setTab] = useState('personalization')
  const bytes = JSON.stringify({ memories, suggestions }).length
  const localSize = (bytes / 1024).toFixed(1)
  const quota = 5 * 1024 * 1024
  const usedRatio = Math.min(1, bytes / quota)
  const localCount = memories.length
  const cloudCount = sync.cloudEnabled ? Math.max(0, localCount - 2) : 0

  const set = (key, value) => onUpdate({ [key]: value })

  const [custom, setCustom] = useState(customGradient || {
    c1: '#05060a', c2: '#8b5cf6', c3: '#3b82f6', c4: '#ec4899', c5: '#10b981',
  })
  const [gradientName, setGradientName] = useState('')

  const applyCustom = () => {
    onCustomGradient(custom)
  }

  const handleSaveGradient = () => {
    saveGradient(gradientName, custom)
    setGradientName('')
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Privacy & Settings</p>
          <h1 className="dash-title">Permissions and controls</h1>
          <p className="dash-sub">Everything is stored on this device unless you turn cloud sync on.</p>
        </div>
        <div className="dash-actions">
          <Pill onClick={onExport}><Download size={14} /> Export data</Pill>
          <Pill variant="solid" onClick={onBackup}><HardDrive size={14} /> Back up</Pill>
        </div>
      </section>

      <div className="tab-strip">
        <Pill active={tab === 'personalization'} onClick={() => setTab('personalization')}>Personalization</Pill>
        <Pill active={tab === 'sync'} onClick={() => setTab('sync')}>Sync & storage</Pill>
        <Pill active={tab === 'privacy'} onClick={() => setTab('privacy')}>Privacy</Pill>
      </div>

      {tab === 'personalization' && (
        <>
          <Card>
            <CardHead title="Personalization controls" subtitle="Decide how memories shape your answers" />
            <div className="setting-list">
              <SettingRow
                icon={UserCog}
                title="Personalization"
                description="Use saved memories to tailor responses."
                checked={settings.personalization}
                onChange={v => set('personalization', v)}
              />
              <SettingRow
                icon={RefreshCw}
                title="Automatic saving"
                description="Save new memories without asking every time."
                checked={settings.autoSave}
                onChange={v => set('autoSave', v)}
              />
              <SettingRow
                icon={ShieldCheck}
                title="Require review before saving"
                description="New memories are held in the suggestions queue until approved."
                checked={settings.requireReview}
                onChange={v => set('requireReview', v)}
              />
              <SettingRow
                icon={Clock}
                title="Show confidence and risk"
                description="Display explanations next to every suggestion."
                checked={settings.showConfidence}
                onChange={v => set('showConfidence', v)}
              />
              <SettingRow
                icon={Cloud}
                title="Share with external AI"
                description="Allow connected sites to read this memory layer."
                checked={settings.externalAI}
                onChange={v => set('externalAI', v)}
              />
              <SettingRow
                icon={RefreshCw}
                title="Discover new memories"
                description="Let the assistant propose memories from conversations."
                checked={settings.discovery}
                onChange={v => set('discovery', v)}
              />
            </div>
          </Card>

              <Card>
                <CardHead title="Expiration" subtitle="Memories older than the limit are reviewed before use" />
                <div className="range-row">
                  <label htmlFor="exp-days">Expire unused memories after</label>
                  <input
                    id="exp-days"
                    type="range"
                    min="30"
                    max="720"
                    step="30"
                    value={settings.expirationDays}
                    onChange={e => set('expirationDays', Number(e.target.value))}
                  />
                  <strong>{settings.expirationDays} days</strong>
                </div>
                <p className="muted small">
                  Expired memories are never deleted automatically — they move to the review queue so you can keep them.
                </p>
              </Card>

              <Card>
                <CardHead title="Gradient theme" subtitle="Pick the accent gradient used across the app" />
                <div className="theme-grid">
                  {Object.entries(PALETTES).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      className={`theme-btn ${themePalette === key ? 'active' : ''}`}
                      onClick={() => onThemePalette(key)}
                    >
                      <div className="theme-preview" style={{ background: stopsToCss(p.stops) }} />
                      <strong>{p.label}</strong>
                      {themePalette === key && <span className="theme-active">●</span>}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Custom gradient" subtitle="Pick your own background gradient colors" />
                <div className="custom-gradient-grid">
                  {['c1', 'c2', 'c3', 'c4', 'c5'].map(key => (
                    <div key={key} className="color-field">
                      <label>{key === 'c1' ? 'Base' : `Accent ${Number(key[1])}`}</label>
                      <input
                        type="color"
                        value={custom[key]}
                        onChange={e => setCustom({ ...custom, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <Pill variant="solid" onClick={applyCustom}>
                    <Palette size={14} /> Apply custom gradient
                  </Pill>
                </div>
              </Card>

              <Card>
                <CardHead title="Saved gradients" subtitle="Save and reuse your favorite gradients" />
                <div className="saved-gradient-form">
                  <input
                    type="text"
                    value={gradientName}
                    placeholder="Gradient name"
                    onChange={e => setGradientName(e.target.value)}
                  />
                  <Pill variant="solid" onClick={handleSaveGradient} disabled={!gradientName.trim()}>
                    <Save size={14} /> Save current
                  </Pill>
                </div>
                {savedGradients.length ? (
                  <div className="saved-gradient-list">
                    {savedGradients.map(g => (
                      <div key={g.id} className="saved-gradient-item">
                        <div className="saved-gradient-preview" style={{ background: stopsToCss(makeStops(Object.values(g.colors).map((c, i) => [i / 4, c]))) }} />
                        <div className="saved-gradient-info">
                          <strong>{g.name}</strong>
                          <span>{Object.values(g.colors).join(' · ')}</span>
                        </div>
                        <div className="saved-gradient-actions">
                          <Pill onClick={() => onCustomGradient(g.colors)}>Apply</Pill>
                          <Pill variant="danger" onClick={() => deleteGradient(g.id)}><Trash2 size={14} /></Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No saved gradients" description="Create a custom gradient above and save it to reuse later." />
                )}
              </Card>
              <Card>
                <CardHead title="Website-specific permissions" subtitle="Fine-tune what each site may access" />
                <div className="site-perm-grid">
              {Object.entries(settings.sites).map(([id, on]) => (
                <div key={id} className="site-perm">
                  <strong>{id}</strong>
                  <span className="muted">{on ? 'Can read memories' : 'No access'}</span>
                  <Toggle
                    checked={on}
                    onChange={v => onUpdate({ sites: { ...settings.sites, [id]: v } })}
                    label={`${id} access`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'sync' && (
        <>
          <Card>
            <CardHead
              title="Sync and storage center"
              subtitle="Local versus cloud memory state"
              action={
                plan !== 'developer' ? (
                  <Pill onClick={() => notify('Cloud sync is a Developer plan feature')}>
                    Enable cloud (upgrade)
                  </Pill>
                ) : (
                  <Pill variant={sync.cloudEnabled ? 'solid' : ''} onClick={() => onToggleCloud(!sync.cloudEnabled)}>
                    {sync.cloudEnabled ? <Cloud size={14} /> : <CloudOff size={14} />}
                    {sync.cloudEnabled ? 'Cloud on' : 'Enable cloud'}
                  </Pill>
                )
              }
            />
            <div className="sync-grid">
              <div className="sync-tile">
                <Database size={17} />
                <span className="label">Local</span>
                <strong>{localCount}</strong>
                <small>memories on this device</small>
              </div>
              <div className="sync-tile">
                <Cloud size={17} />
                <span className="label">Cloud</span>
                <strong>{cloudCount}</strong>
                <small>{sync.cloudEnabled ? 'memories backed up' : 'sync is off'}</small>
              </div>
              <div className="sync-tile">
                <RefreshCw size={17} />
                <span className="label">Last sync</span>
                <strong className="sync-time">{sync.lastSyncAt ? relativeTime(sync.lastSyncAt) : 'Never'}</strong>
                <small>{sync.cloudEnabled ? 'automatic sync every hour' : 'manual only'}</small>
              </div>
            </div>
            <div className="sync-actions">
              <Pill variant="solid" onClick={onSyncNow}><RefreshCw size={14} /> Sync now</Pill>
              <Pill onClick={onExport}><Download size={14} /> Export JSON</Pill>
              <Pill onClick={onBackup}><HardDrive size={14} /> Download backup</Pill>
            </div>
          </Card>

          <Card>
            <CardHead title="Storage usage" subtitle="Local database footprint" />
            <div className="usage-bar">
              <span style={{ width: `${Math.max(2, usedRatio * 100)}%` }} />
            </div>
            <p className="muted small">
              {localSize} KB used of 5 MB local quota · {memories.filter(m => m.pinned).length} pinned ·{' '}
              {memories.filter(m => m.history.length).length} with version history
            </p>
          </Card>

          <Card>
            <CardHead title="Recent errors" subtitle="Problems hit during sync and export" />
            {sync.errors.length ? (
              <ul className="error-list">
                {sync.errors.map(e => (
                  <li key={e.id}>
                    <AlertTriangle size={15} />
                    <div><strong>{e.message}</strong><small>{relativeTime(e.at)}</small></div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No errors" description="Everything synced cleanly." />
            )}
          </Card>
        </>
      )}

      {tab === 'privacy' && (
        <>
          <Card>
            <CardHead title="Privacy" subtitle="Where your memories live and who can read them" />
            <ul className="rule-list">
              <li><ShieldCheck size={16} /><div><strong>Stored locally first</strong><p>Memories are written to this browser. Cloud sync is opt-in.</p></div></li>
              <li><ShieldCheck size={16} /><div><strong>No credentials</strong><p>Passwords, tokens and API keys are detected and never stored.</p></div></li>
              <li><ShieldCheck size={16} /><div><strong>High-risk memory blocked</strong><p>Personal data about other people needs explicit approval.</p></div></li>
              <li><ShieldCheck size={16} /><div><strong>Per-site revocation</strong><p>Disconnecting a site immediately removes its access.</p></div></li>
            </ul>
          </Card>

          <Card className="danger-card">
            <CardHead title="Danger zone" subtitle="Irreversible actions" />
            <div className="danger-row">
              <div>
                <strong>Delete all local data</strong>
                <p>Removes every memory, suggestion, folder and setting from this device.</p>
              </div>
              <Pill variant="danger" onClick={onClear}><Trash2 size={14} /> Delete everything</Pill>
            </div>
          </Card>
        </>
      )}
    </>
  )
}

function SettingRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <div className="setting-row">
      <span className="setting-icon"><Icon size={16} /></span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}
