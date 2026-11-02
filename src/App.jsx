import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, Database, Lightbulb, FolderTree, Network, History,
  Plug, Settings2, Moon, Sun, Plus, Search, Trash2, Check, RotateCcw,
  User, LogOut, CreditCard, ChevronLeft, ChevronRight,
} from 'lucide-react'
import AnimatedInput from './AnimatedInput'
import { PALETTES, withInk, hexToRgb } from './palettes'
import {
  STORE,
  load, save,
  seedFolders, seedSuggestions, seedActivity, seedConflicts,
  seedSync, defaultSettings, SOURCES, RISK, relativeTime, formatDate,
} from './data'
import Profile from './pages/Profile'
import Billing from './pages/Billing'
import { Modal, Pill, Toggle, SourceTag, RiskTag } from './components/ui'
import {
  getMemories, getMemoryById, createMemory, updateMemory,
} from './memoryService'
import ErrorBoundary from './components/ErrorBoundary'
import Overview from './pages/Overview'
import MemoryLibrary from './pages/MemoryLibrary'
import SuggestionsCenter from './pages/SuggestionsCenter'
import FoldersPage from './pages/FoldersPage'
import MemoryMap from './pages/MemoryMap'
import TimelineActivity from './pages/TimelineActivity'
import Integrations from './pages/Integrations'
import SettingsPage from './pages/Settings'
import Login from './pages/Login'
import { isAuthenticated, logout as authLogout } from './auth'
import './index.css'
import './styles/theme.css'

const NAV = [
  { id: 'Overview', label: 'Overview', hint: 'Dashboard', icon: LayoutDashboard },
  { id: 'All memories', label: 'All Memories', hint: 'Search and manage', icon: Database },
  { id: 'Suggestions', label: 'Suggestions', hint: 'AI review queue', icon: Lightbulb },
  { id: 'Projects & Folders', label: 'Projects & Folders', hint: 'Organise context', icon: FolderTree },
  { id: 'Memory Map', label: 'Memory Map', hint: 'Explore connections', icon: Network },
  { id: 'Timeline & Activity', label: 'Timeline & Activity', hint: 'History and usage', icon: History },
  { id: 'Integrations', label: 'Integrations', hint: 'Connected AI websites', icon: Plug },
  { id: 'Billing', label: 'Billing', hint: 'Plans and subscription', icon: CreditCard },
  { id: 'Profile', label: 'Profile', hint: 'Your account', icon: User },
  { id: 'Privacy & Settings', label: 'Privacy & Settings', hint: 'Permissions and controls', icon: Settings2 },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORE.theme) || 'dark')
  const [themePalette, setThemePalette] = useState('dia')
  const [page, setPage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [memories, setMemories] = useState([])
  const [folders, setFolders] = useState(() => load(STORE.folders, seedFolders))
  const [suggestions, setSuggestions] = useState(() => load(STORE.suggestions, seedSuggestions))
  const [activity, setActivity] = useState(() => load(STORE.activity, seedActivity))
  const [conflicts, setConflicts] = useState(() => load(STORE.conflicts, seedConflicts))
  const [settings, setSettings] = useState(() => load(STORE.settings, defaultSettings))
  const [sync, setSync] = useState(() => load(STORE.sync, seedSync))
  const [user, setUser] = useState(() => load(STORE.user, { name: 'You', email: 'you@knowu.ai', avatarColor: 'purple' }))
  const [plan, setPlan] = useState(() => load(STORE.plan, 'free'))
  const [customGradient, setCustomGradient] = useState(() => load(STORE.customGradient, null))
  const [savedGradients, setSavedGradients] = useState(() => load(STORE.savedGradients, []))
  const [collapsed, setCollapsed] = useState(() => load(STORE.sidebarCollapsed, false))

  /* Authentication */
  const [authMode, setAuthMode] = useState('login')
  const [authed, setAuthed] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    ;(async () => {
      const authenticated = await isAuthenticated()
      setAuthed(authenticated)
      setAuthChecking(false)
    })()
  }, [])

  const handleAuthSuccess = useCallback(() => {
    setAuthed(true)
    setAuthMode('login')
  }, [setAuthMode])

  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState({ title: '', details: '', categoryId: 'learning', tags: '' })
  const [editing, setEditing] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [suggestEdit, setSuggestEdit] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORE.theme, theme)
  }, [theme])

  useEffect(() => { save(STORE.folders, folders) }, [folders])
  useEffect(() => { save(STORE.suggestions, suggestions) }, [suggestions])
  useEffect(() => { save(STORE.activity, activity) }, [activity])
  useEffect(() => { save(STORE.conflicts, conflicts) }, [conflicts])
  useEffect(() => { save(STORE.settings, settings) }, [settings])
  useEffect(() => { save(STORE.sync, sync) }, [sync])
  useEffect(() => { save(STORE.plan, plan) }, [plan])
  useEffect(() => { save(STORE.user, user) }, [user])
  useEffect(() => { save(STORE.customGradient, customGradient) }, [customGradient])
  useEffect(() => { save(STORE.savedGradients, savedGradients) }, [savedGradients])
  useEffect(() => { save(STORE.sidebarCollapsed, collapsed) }, [collapsed])

  useEffect(() => {
    const root = document.documentElement
    if (customGradient) {
      const toRgba = (hex, alpha) => {
        const rgb = hexToRgb(hex)
        return `rgba(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${alpha})`
      }
      root.style.setProperty('--liquid-base', customGradient.c1 || '#05060a')
      root.style.setProperty('--liquid-1', toRgba(customGradient.c2 || '#8b5cf6', 0.55))
      root.style.setProperty('--liquid-2', toRgba(customGradient.c3 || '#3b82f6', 0.5))
      root.style.setProperty('--liquid-3', toRgba(customGradient.c4 || '#ec4899', 0.42))
      root.style.setProperty('--liquid-4', toRgba(customGradient.c5 || '#10b981', 0.4))
    } else {
      root.style.removeProperty('--liquid-base')
      root.style.removeProperty('--liquid-1')
      root.style.removeProperty('--liquid-2')
      root.style.removeProperty('--liquid-3')
      root.style.removeProperty('--liquid-4')
    }
  }, [customGradient])

  useEffect(() => {
    if (!authed) return
    let cancelled = false
    ;(async () => {
      try {
        const ms = await getMemories()
        if (!cancelled) setMemories(ms)
      } catch (err) {
        console.error('Failed to load memories:', err.message)
        if (!cancelled) setMemories([])
      }
    })()
    return () => { cancelled = true }
  }, [authed])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onKey = e => {
      if (e.target.matches('input, textarea, select')) return
      if (e.key === 't' || e.key === 'T') setTheme(t => (t === 'dark' ? 'light' : 'dark'))
      if (e.key === 'b' || e.key === 'B') toggleSidebar()
      if (e.key === 'n' || e.key === 'N') { setAddOpen(true); setDraft({ title: '', details: '', categoryId: 'learning', tags: '' }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const notify = useCallback(message => setToast({ id: Date.now(), message }), [])

  const logActivity = useCallback((memoryId, kind, reason) => {
    setActivity(current => [
      { id: `a${Date.now()}`, memoryId, kind, reason, at: new Date().toISOString(), surface: 'Memory Layer' },
      ...current,
    ])
  }, [])

  const addMemory = async () => {
    if (!draft.title.trim()) return
    try {
      const memory = await createMemory({
        title: draft.title.trim(),
        details: draft.details.trim(),
        categoryId: draft.categoryId,
        source: SOURCES.USER,
        confidence: 1,
        risk: RISK.LOW,
        pinned: false,
        tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
        usageReason: 'Created manually.',
      })
      const ms = await getMemories()
      setMemories(ms)
      logActivity(memory.id, 'added', 'Memory created manually.')
      setAddOpen(false)
      setDraft({ title: '', details: '', categoryId: 'learning', tags: '' })
      notify('Memory saved')
    } catch (err) {
      notify(`Save failed: ${err.message}`)
    }
  }

  const openMemory = memory => {
    setEditing(memory)
    setEditDraft({
      title: memory.title,
      details: memory.details,
      categoryId: memory.categoryId,
      tags: (memory.tags || []).join(', '),
      enabled: memory.enabled,
      pinned: memory.pinned,
    })
  }

  const saveMemory = async () => {
    if (!editing || !editDraft.title.trim()) return
    try {
      const updated = await updateMemory(editing.id, {
        title: editDraft.title.trim(),
        details: editDraft.details.trim(),
        categoryId: editDraft.categoryId,
        tags: (editDraft.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        enabled: editDraft.enabled,
        pinned: editDraft.pinned,
      })
      const ms = await getMemories()
      setMemories(ms)
      logActivity(editing.id, 'edited', `Updated to version ${updated.version}.`)
      setEditing(null)
      notify('Memory updated')
    } catch (err) {
      notify(`Save failed: ${err.message}`)
    }
  }

  const deleteMemory = async id => {
    try {
      const memory = memories.find(m => m.id === id)
      await deleteMemory(id)
      const ms = await getMemories()
      setMemories(ms)
      logActivity(id, 'deleted', memory?.title || 'Memory removed')
      setEditing(null)
      notify('Memory deleted')
    } catch (err) {
      notify(`Delete failed: ${err.message}`)
    }
  }

  const togglePin = async id => {
    try {
      const memory = memories.find(m => m.id === id)
      await updateMemory(id, { pinned: !memory.pinned })
      const ms = await getMemories()
      setMemories(ms)
    } catch (err) {
      notify(`Update failed: ${err.message}`)
    }
  }

  const bulkDelete = async ids => {
    try {
      for (const id of ids) {
        await deleteMemory(id)
      }
      const ms = await getMemories()
      setMemories(ms)
      ids.forEach(id => logActivity(id, 'deleted', 'Removed in bulk action'))
      notify(`${ids.length} memories deleted`)
    } catch (err) {
      notify(`Delete failed: ${err.message}`)
    }
  }

  const exportData = ids => {
    const payload = ids?.length ? memories.filter(m => ids.includes(m.id)) : memories
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), memories: payload }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-layer-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify(`Exported ${payload.length} memories`)
  }

  const approveSuggestion = async s => {
    try {
      const memory = await createMemory({
        title: s.title,
        details: s.details,
        categoryId: s.categoryId,
        source: SOURCES.AI,
        confidence: s.confidence,
        risk: s.risk,
        enabled: true,
        pinned: false,
        tags: [],
        usageReason: `Approved suggestion: ${s.reason}`,
      })
      const ms = await getMemories()
      setMemories(ms)
      setSuggestions(current => current.filter(x => x.id !== s.id))
      logActivity(memory.id, 'added', 'Approved AI suggestion')
      notify('Suggestion approved and saved')
    } catch (err) {
      notify(`Save failed: ${err.message}`)
    }
  }

  const dismissSuggestion = s => {
    setSuggestions(current => current.filter(x => x.id !== s.id))
    notify('Suggestion rejected')
  }

  const editSuggestion = s => {
    setSuggestEdit({ ...s })
  }

  const saveSuggestion = () => {
    if (!suggestEdit) return
    setSuggestions(current => current.map(x => (x.id === suggestEdit.id ? suggestEdit : x)))
    setSuggestEdit(null)
    notify('Suggestion updated')
  }

  const mergeSuggestion = async s => {
    try {
      const target = memories.find(m => m.id === s.targetMemoryId)
      if (!target) return
      await updateMemory(target.id, {
        details: `${target.details} ${s.details}`.trim(),
        tags: [...new Set([...(target.tags || []), ...s.title.toLowerCase().split(/\s+/).slice(0, 2)])],
      })
      const ms = await getMemories()
      setMemories(ms)
      setSuggestions(current => current.filter(x => x.id !== s.id))
      logActivity(target.id, 'merged', `Merged suggestion "${s.title}"`)
      notify(`Merged into “${target.title}”`)
    } catch (err) {
      notify(`Merge failed: ${err.message}`)
    }
  }

  const createFolder = name => {
    setFolders(current => [
      ...current,
      {
        id: `f${Date.now()}`,
        name,
        type: 'custom',
        enabled: true,
        color: ['purple', 'blue', 'orange', 'green', 'pink', 'cyan'][current.length % 6],
        createdAt: new Date().toISOString(),
        project: false,
      },
    ])
    notify(`Folder “${name}” created`)
  }

  const deleteFolder = id => {
    const count = memories.filter(m => m.categoryId === id).length
    if (count) {
      notify(`Move ${count} memories before deleting this folder`)
      return
    }
    setFolders(current => current.filter(f => f.id !== id))
    notify('Folder deleted')
  }

  const toggleFolder = id => {
    setFolders(current => current.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f)))
  }

  const restoreVersion = async (id, version) => {
    try {
      const memory = await getMemoryById(id)
      if (!memory) throw new Error(`Memory not found: ${id}`)
      const h = memory.history.find(x => x.version === version)
      if (!h) throw new Error(`Version ${version} not found`)
      await updateMemory(id, {
        title: h.title,
        details: h.details,
      })
      const ms = await getMemories()
      setMemories(ms)
      logActivity(id, 'edited', `Restored version ${version}`)
      notify(`Restored version ${version}`)
    } catch (err) {
      notify(`Restore failed: ${err.message}`)
    }
  }

  const disableUse = async id => {
    try {
      await updateMemory(id, { enabled: false })
      const ms = await getMemories()
      setMemories(ms)
      logActivity(id, 'disabled', 'Future use disabled by user')
      notify('Future use disabled')
    } catch (err) {
      notify(`Update failed: ${err.message}`)
    }
  }

  const resolveConflict = async (conflict, action) => {
    try {
      if (action.keep === 'both') {
        const memory = await getMemoryById(action.context)
        if (memory) {
          await updateMemory(action.context, {
            tags: [...new Set([...memory.tags, 'context'])],
          })
        }
      } else if (action.remove) {
        await deleteMemory(action.remove)
      } else if (action.keep) {
        const memory = await getMemoryById(action.keep)
        if (memory) {
          await updateMemory(action.keep, { updatedAt: new Date().toISOString() })
        }
        for (const id of conflict.memoryIds) {
          if (id !== action.keep) {
            await deleteMemory(id)
          }
        }
      }
      const ms = await getMemories()
      setMemories(ms)
      setConflicts(current => current.filter(c => c.id !== conflict.id))
      notify('Conflict resolved')
    } catch (err) {
      notify(`Resolve failed: ${err.message}`)
    }
  }

  const updateSettings = patch => setSettings(current => ({ ...current, ...patch }))

  const toggleCloud = value => {
    setSync(current => ({ ...current, cloudEnabled: value }))
    notify(value ? 'Cloud sync enabled' : 'Cloud sync disabled')
  }

  const syncNow = () => {
    setSync(current => ({ ...current, lastSyncAt: new Date().toISOString() }))
    notify('Sync complete')
  }

  const backup = () => {
    const blob = new Blob([JSON.stringify({ memories, folders, suggestions, settings }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-layer-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify('Backup downloaded')
  }

  const clearAll = () => {
    setMemories([])
    setSuggestions([])
    setActivity([])
    setConflicts([])
    notify('All local data cleared')
  }

  const logout = async () => {
    if (!window.confirm('Sign out? This clears all local memories, folders, and settings from this device.')) return
    await authLogout()
    setAuthed(false)
    setMemories([])
    setFolders([])
    setSuggestions([])
    setActivity([])
    setConflicts([])
    setSettings(defaultSettings)
    setSync(seedSync)
    setUser({ name: 'You', email: 'you@memory.layer', avatarColor: 'purple' })
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ml-')) localStorage.removeItem(key)
    })
    setPage('Overview')
    window.location.reload()
  }

  const upgradePlan = () => {
    setPlan('developer')
    notify('Upgraded to Developer plan')
  }

  const toggleSidebar = () => {
    setCollapsed(c => !c)
  }

  const saveGradient = (name, colors) => {
    if (!name.trim()) {
      notify('Gradient needs a name')
      return
    }
    const next = [
      ...savedGradients,
      { id: `g${Date.now()}`, name: name.trim(), colors },
    ]
    setSavedGradients(next)
    notify(`Gradient “${name.trim()}” saved`)
  }

  const deleteGradient = id => {
    setSavedGradients(current => current.filter(g => g.id !== id))
    notify('Gradient deleted')
  }

  const ink = theme === 'dark' ? '#f4f4f6' : '#1b1b1f'
  const stops = useMemo(() => withInk(PALETTES[themePalette].stops, ink), [ink, themePalette])

  const shared = { memories, folders, suggestions, activity, conflicts, settings, sync, plan, customGradient, savedGradients, saveGradient, deleteGradient }

  if (authChecking) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="label">Checking authentication…</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Login
          mode={authMode}
          onAuth={handleAuthSuccess}
          onToggle={() => setAuthMode(m => (m === 'login' ? 'register' : 'login'))}
        />
      </div>
    )
  }

  return (
      <div className={`app ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {document.documentElement.classList.contains('error-mode') && (
        <div className="error-recovery">
          <h2>Something went wrong</h2>
          <p>The page encountered an error. Reload to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="reload-btn"
          >
            Reload page
          </button>
        </div>
      )}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          <span className="brand-mark" />
          <div className="brand-text">
            <strong>knowU</strong>
            <small>memory layer</small>
          </div>
        </div>

        <nav className="nav">
          {NAV.map(item => {
            const Icon = item.icon
            const badge =
              item.id === 'Suggestions' ? suggestions.length :
              item.id === 'Timeline & Activity' ? conflicts.length : 0
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <Icon size={16} />
                <span className="nav-text">
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="side-foot">
          <button type="button" className="side-foot-btn" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button type="button" className="side-foot-btn" onClick={logout}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
          <button type="button" className="side-foot-btn" onClick={toggleSidebar} title="Collapse sidebar">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <span className="side-foot-hint">Press T to theme · B to collapse</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={15} />
            <input
              value={search}
              placeholder="Search your memory layer…"
              onChange={e => { setSearch(e.target.value); if (e.target.value) setPage('All memories') }}
            />
          </div>
          <div className="topbar-actions">
            <Pill onClick={() => { setDraft({ title: '', details: '', categoryId: 'learning', tags: '' }); setAddOpen(true) }}>
              <Plus size={15} /> Quick add
            </Pill>
          </div>
        </header>

        <div className="content">
          {page === 'Overview' && (
            <ErrorBoundary>
              <Overview
                {...shared}
                gradientStops={stops}
                onAdd={() => { setDraft({ title: '', details: '', categoryId: 'learning', tags: '' }); setAddOpen(true) }}
                onOpenPage={setPage}
                onOpenMemory={openMemory}
                onResolveConflict={conflict => { setPage('Timeline & Activity'); setTimeout(() => resolveConflict(conflict, { keep: conflict.memoryIds[0] }), 0) }}
              />
            </ErrorBoundary>
          )}

          {page === 'All memories' && (
            <ErrorBoundary>
              <MemoryLibrary
                {...shared}
                search={search}
                setSearch={setSearch}
                onAdd={() => { setDraft({ title: '', details: '', categoryId: 'learning', tags: '' }); setAddOpen(true) }}
                onOpenMemory={openMemory}
                onTogglePin={togglePin}
                onDelete={deleteMemory}
                onBulkDelete={bulkDelete}
                onBulkExport={exportData}
              />
            </ErrorBoundary>
          )}

          {page === 'Suggestions' && (
            <ErrorBoundary>
              <SuggestionsCenter
                {...shared}
                onApprove={approveSuggestion}
                onDismiss={dismissSuggestion}
                onEdit={editSuggestion}
                onMerge={mergeSuggestion}
              />
            </ErrorBoundary>
          )}

          {page === 'Projects & Folders' && (
            <ErrorBoundary>
              <FoldersPage
                {...shared}
                onCreateFolder={createFolder}
                onDeleteFolder={deleteFolder}
                onToggleFolder={toggleFolder}
              />
            </ErrorBoundary>
          )}

          {page === 'Memory Map' && (
            <ErrorBoundary>
              <MemoryMap {...shared} onOpenMemory={openMemory} />
            </ErrorBoundary>
          )}

          {page === 'Timeline & Activity' && (
            <ErrorBoundary>
              <TimelineActivity
                {...shared}
                onOpenMemory={openMemory}
                onRestore={restoreVersion}
                onDisableUse={disableUse}
                onResolveConflict={resolveConflict}
              />
            </ErrorBoundary>
          )}

          {page === 'Integrations' && (
            <ErrorBoundary>
              <Integrations settings={settings} onConnect={id => updateSettings({ sites: { ...settings.sites, [id]: true } })} onDisconnect={id => updateSettings({ sites: { ...settings.sites, [id]: false } })} />
            </ErrorBoundary>
          )}

          {page === 'Billing' && (
            <ErrorBoundary>
              <Billing
                plan={plan}
                onUpgrade={upgradePlan}
                onUpdateSettings={updateSettings}
              />
            </ErrorBoundary>
          )}

          {page === 'Profile' && (
            <ErrorBoundary>
              <Profile
                memories={memories}
                folders={folders}
                suggestions={suggestions}
                settings={settings}
                sync={sync}
                onUpdateSettings={updateSettings}
                onExport={exportData}
                onClearAll={clearAll}
                onLogout={logout}
              />
            </ErrorBoundary>
          )}

          {page === 'Privacy & Settings' && (
            <ErrorBoundary>
              <SettingsPage
                settings={settings}
                plan={plan}
                onUpdate={updateSettings}
                memories={memories}
                suggestions={suggestions}
                sync={sync}
                themePalette={themePalette}
                onThemePalette={setThemePalette}
                customGradient={customGradient}
                onCustomGradient={setCustomGradient}
                savedGradients={savedGradients}
                saveGradient={saveGradient}
                deleteGradient={deleteGradient}
                onToggleCloud={toggleCloud}
                onSyncNow={syncNow}
                onExport={() => exportData()}
                onBackup={backup}
                onClear={clearAll}
              />
            </ErrorBoundary>
          )}
        </div>

        <footer className="footer">
          <span>knowU · local-first memory layer</span>
          <span className="footer-keys">
            <kbd>T</kbd> theme · <kbd>N</kbd> new memory
          </span>
        </footer>
      </main>

      {addOpen && (
        <Modal title="Quick-add memory" onClose={() => setAddOpen(false)} width={560}>
          <div className="form">
            <label className="form-field">
              <span className="label">Memory</span>
              <div className="animated-field">
                <AnimatedInput
                  value={draft.title}
                  onChange={v => setDraft(d => ({ ...d, title: v }))}
                  placeholder="e.g. Explain code step by step"
                  inputVariant="filled"
                  charAnimation="spring"
                  color="rgb(107 98 242)"
                />
              </div>
            </label>

            <label className="form-field">
              <span className="label">Details</span>
              <textarea
                rows={3}
                value={draft.details}
                placeholder="Extra context the assistant should know."
                onChange={e => setDraft(d => ({ ...d, details: e.target.value }))}
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span className="label">Folder</span>
                <select value={draft.categoryId} onChange={e => setDraft(d => ({ ...d, categoryId: e.target.value }))}>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span className="label">Tags</span>
                <input
                  value={draft.tags}
                  placeholder="comma, separated"
                  onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))}
                />
              </label>
            </div>

            <div className="modal-actions">
              <Pill onClick={() => setAddOpen(false)}>Cancel</Pill>
              <Pill variant="solid" onClick={addMemory}><Check size={14} /> Save memory</Pill>
            </div>
          </div>
        </Modal>
      )}

      {editing && editDraft && (
        <Modal title="Memory details" onClose={() => setEditing(null)} width={620}>
          <div className="form">
            <label className="form-field">
              <span className="label">Title</span>
              <input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} />
            </label>
            <label className="form-field">
              <span className="label">Details</span>
              <textarea rows={3} value={editDraft.details} onChange={e => setEditDraft(d => ({ ...d, details: e.target.value }))} />
            </label>
            <div className="form-row">
              <label className="form-field">
                <span className="label">Folder</span>
                <select value={editDraft.categoryId} onChange={e => setEditDraft(d => ({ ...d, categoryId: e.target.value }))}>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span className="label">Tags</span>
                <input value={editDraft.tags} onChange={e => setEditDraft(d => ({ ...d, tags: e.target.value }))} />
              </label>
            </div>

            <div className="form-toggles">
              <div className="form-toggle">
                <span>Enabled</span>
                <Toggle checked={editDraft.enabled} onChange={v => setEditDraft(d => ({ ...d, enabled: v }))} label="Enabled" />
              </div>
              <div className="form-toggle">
                <span>Pinned</span>
                <Toggle checked={editDraft.pinned} onChange={v => setEditDraft(d => ({ ...d, pinned: v }))} label="Pinned" />
              </div>
            </div>

            <div className="detail-strip">
              <div><span className="label">Source</span><SourceTag source={editing.source} /></div>
              <div><span className="label">Risk</span><RiskTag risk={editing.risk} /></div>
              <div><span className="label">Used</span><strong>{editing.useCount}×</strong></div>
              <div><span className="label">Last used</span><strong>{relativeTime(editing.lastUsedAt)}</strong></div>
              <div><span className="label">Created</span><strong>{formatDate(editing.createdAt)}</strong></div>
              <div><span className="label">Version</span><strong>v{editing.version}</strong></div>
            </div>

            {editing.history.length > 0 && (
              <div className="version-list">
                <span className="label">Previous versions</span>
                {editing.history.map(h => (
                  <div key={h.version} className="version-row">
                    <div><strong>v{h.version} · {h.title}</strong><small>{formatDate(h.at)}</small></div>
                    <Pill onClick={() => { restoreVersion(editing.id, h.version); setEditing(null) }}>
                      <RotateCcw size={13} /> Restore
                    </Pill>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions spread">
              <Pill variant="danger" onClick={() => deleteMemory(editing.id)}><Trash2 size={14} /> Delete</Pill>
              <div className="modal-actions">
                <Pill onClick={() => setEditing(null)}>Cancel</Pill>
                <Pill variant="solid" onClick={saveMemory}><Check size={14} /> Save changes</Pill>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {suggestEdit && (
        <Modal title="Edit suggestion" onClose={() => setSuggestEdit(null)} width={520}>
          <div className="form">
            <label className="form-field">
              <span className="label">Title</span>
              <input value={suggestEdit.title} onChange={e => setSuggestEdit(s => ({ ...s, title: e.target.value }))} />
            </label>
            <label className="form-field">
              <span className="label">Details</span>
              <textarea rows={3} value={suggestEdit.details} onChange={e => setSuggestEdit(s => ({ ...s, details: e.target.value }))} />
            </label>
            <label className="form-field">
              <span className="label">Folder</span>
              <select value={suggestEdit.categoryId} onChange={e => setSuggestEdit(s => ({ ...s, categoryId: e.target.value }))}>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
            <div className="modal-actions">
              <Pill onClick={() => setSuggestEdit(null)}>Cancel</Pill>
              <Pill variant="solid" onClick={saveSuggestion}><Check size={14} /> Save</Pill>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div key={toast.id} className="toast">
          <Check size={15} />
          {toast.message}
        </div>
      )}
    </div>
  )
}
