import { useEffect, useState } from 'react'
import {
  ShieldCheck, Clock, ShieldAlert, RotateCcw, LogOut,
} from 'lucide-react'
import { Card, CardHead, Pill, Toggle } from '../components/ui'
import { STORE, load, save, formatDate, NOW } from '../data'

const defaultUser = {
  name: 'You',
  email: 'you@knowu.ai',
  avatarColor: 'purple',
  memberSince: new Date(NOW).toISOString(),
}

export default function Profile({
  memories, folders, suggestions, settings,
  onUpdateSettings, onExport, onClearAll, onLogout,
}) {
  const [user, setUser] = useState(() => load(STORE.user, defaultUser))
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: user.name, email: user.email })

  useEffect(() => { save(STORE.user, user) }, [user])

  const totalMemories = memories.length
  const pinned = memories.filter(m => m.pinned).length
  const usedWeek = settings ? memories.filter(m => NOW - new Date(m.lastUsedAt) < 7 * 86400000).length : 0

  const startEdit = () => {
    setDraft({ name: user.name, email: user.email })
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const saveProfile = () => {
    const name = draft.name.trim() || user.name
    const email = draft.email.trim() || user.email
    setUser({ ...user, name, email })
    setEditing(false)
  }

  const handleLogout = () => {
    if (!window.confirm('Sign out? This clears all local memories, folders, and settings from this device.')) return
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ml-')) localStorage.removeItem(key)
    })
    if (onClearAll) onClearAll()
    if (onLogout) onLogout()
    window.location.reload()
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Profile</p>
          <h1 className="dash-title">Your account</h1>
          <p className="dash-sub">Manage your profile, preferences, and memory layer settings.</p>
        </div>
        <div className="dash-actions">
          <Pill variant="solid" onClick={() => onExport && onExport()}><DownloadIcon /> Export data</Pill>
        </div>
      </section>

      <Card>
        <CardHead
          title="Profile"
          subtitle="Your name and email appear in shared contexts and exports."
          action={editing ? (
            <div className="modal-actions">
              <Pill onClick={cancelEdit}>Cancel</Pill>
              <Pill variant="solid" onClick={saveProfile}>Save</Pill>
            </div>
          ) : (
            <Pill onClick={startEdit}>Edit profile</Pill>
          )}
        />
        <div className="profile-card">
          <div className={`avatar ${user.avatarColor}`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-fields">
            <div className="profile-field">
              <label>{editing ? <input autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /> : user.name}</label>
              <small>Display name</small>
            </div>
            <div className="profile-field">
              <label>{editing ? <input value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} /> : user.email}</label>
              <small>Email address</small>
            </div>
          </div>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <span className="meta-label">Member since</span>
            <span className="meta-value">{formatDate(user.memberSince)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Theme</span>
            <span className="meta-value">{settings ? (settings.themePalette || 'dia') : 'dia'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Storage</span>
            <span className="meta-value">Local (browser)</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Memory stats" subtitle="Your personal memory layer at a glance" />
        <div className="stat-row">
          <div className="stat">
            <span className="label">Total memories</span>
            <strong>{totalMemories}</strong>
          </div>
          <div className="stat">
            <span className="label">Organised folders</span>
            <strong>{folders.length}</strong>
          </div>
          <div className="stat">
            <span className="label">Pinned memories</span>
            <strong>{pinned}</strong>
          </div>
          <div className="stat">
            <span className="label">Used this week</span>
            <strong>{usedWeek}</strong>
          </div>
          <div className="stat">
            <span className="label">Pending suggestions</span>
            <strong>{suggestions.length}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Preferences" subtitle="Defaults for this device" />
        <div className="setting-list">
          <div className="setting-row">
            <span className="setting-icon"><ShieldCheck size={16} /></span>
            <div>
              <strong>Show confidence & risk</strong>
              <p>Display confidence scores and risk tags next to AI suggestions.</p>
            </div>
            <Toggle
              checked={settings ? settings.showConfidence : true}
              onChange={v => onUpdateSettings({ showConfidence: v })}
              label="Show confidence & risk"
            />
          </div>
          <div className="setting-row">
            <span className="setting-icon"><Clock size={16} /></span>
            <div>
              <strong>Auto-save new memories</strong>
              <p>Save new memories without asking every time.</p>
            </div>
            <Toggle
              checked={settings ? settings.autoSave : true}
              onChange={v => onUpdateSettings({ autoSave: v })}
              label="Auto-save new memories"
            />
          </div>
          <div className="setting-row">
            <span className="setting-icon"><ShieldAlert size={16} /></span>
            <div>
              <strong>Require review before saving</strong>
              <p>Hold new memories in the suggestions queue until approved.</p>
            </div>
            <Toggle
              checked={settings ? settings.requireReview : true}
              onChange={v => onUpdateSettings({ requireReview: v })}
              label="Require review before saving"
            />
          </div>
        </div>
      </Card>

      <Card className="danger-card">
        <CardHead title="Danger zone" subtitle="Irreversible actions" />
        <div className="danger-row">
          <div>
            <strong>Sign out</strong>
            <p>Clears all memories, folders, and settings from this device and reloads.</p>
          </div>
          <Pill variant="danger" onClick={handleLogout}><LogOut size={14} /> Sign out</Pill>
        </div>
        <div className="danger-row" style={{ marginTop: 14 }}>
          <div>
            <strong>Reset everything</strong>
            <p>Deletes every memory, folder, and suggestion but keeps your profile.</p>
          </div>
          <Pill variant="danger" onClick={() => { if (onClearAll) onClearAll() }}><RotateCcw size={14} /> Reset data</Pill>
        </div>
      </Card>
    </>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
