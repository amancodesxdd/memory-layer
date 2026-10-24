
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialFolders = [
  { id: 'learning', name: 'Learning & Education', type: 'predefined', enabled: true, color: 'purple' },
  { id: 'programming', name: 'Programming', type: 'predefined', enabled: true, color: 'blue' },
  { id: 'style', name: 'Response Style', type: 'predefined', enabled: true, color: 'orange' },
  { id: 'work', name: 'Work & Career', type: 'predefined', enabled: true, color: 'green' },
]

const initialMemories = [
  { id: 'm1', categoryId: 'learning', title: 'Explain concepts from the basics', details: 'Start with the fundamentals and build up gradually.', enabled: true },
  { id: 'm2', categoryId: 'programming', title: 'Use Java for coding examples', details: 'Prefer Java examples for programming and DSA.', enabled: true },
  { id: 'm3', categoryId: 'programming', title: 'Explain code step by step', details: 'Walk through conditions, variables, and important lines.', enabled: true },
  { id: 'm4', categoryId: 'style', title: 'Include complete dry runs', details: 'Show how variable values change at each step.', enabled: true },
  { id: 'm5', categoryId: 'work', title: 'Prefer practical examples', details: 'Connect explanations to realistic projects.', enabled: false },
]

const initialSuggestions = [
  { id: 's1', title: 'Step-by-step explanations', details: 'A possible preference based on repeated requests for detailed explanations.', categoryId: 'learning' },
  { id: 's2', title: 'Show a complete code dry run', details: 'A possible preference for programming explanations.', categoryId: 'programming' },
  { id: 's3', title: 'Prefer practical examples', details: 'A possible preference for learning through real examples.', categoryId: 'work' },
]

const defaultSettings = {
  personalization: true,
  discovery: true,
  externalAI: false,
  sites: { chatgpt: true, claude: false, gemini: false },
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

function App() {
  const [folders, setFolders] = useState(() => loadData('ml-folders', initialFolders))
  const [memories, setMemories] = useState(() => loadData('ml-memories', initialMemories))
  const [suggestions, setSuggestions] = useState(() => loadData('ml-suggestions', initialSuggestions))
  const [settings, setSettings] = useState(() => loadData('ml-settings', defaultSettings))
  const [page, setPage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [categoryId, setCategoryId] = useState('learning')
  const [folderName, setFolderName] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem('ml-folders', JSON.stringify(folders)), [folders])
  useEffect(() => localStorage.setItem('ml-memories', JSON.stringify(memories)), [memories])
  useEffect(() => localStorage.setItem('ml-suggestions', JSON.stringify(suggestions)), [suggestions])
  useEffect(() => localStorage.setItem('ml-settings', JSON.stringify(settings)), [settings])

  const activeMemories = memories.filter(memory => memory.enabled)

  const filteredMemories = useMemo(() => memories.filter(memory => {
    const text = `${memory.title} ${memory.details}`.toLowerCase()
    return text.includes(search.toLowerCase()) &&
      (filter === 'all' || memory.categoryId === filter)
  }), [memories, search, filter])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  function toggleFolder(id, enabled) {
    setFolders(current => current.map(folder =>
      folder.id === id ? { ...folder, enabled } : folder
    ))
    notify(enabled ? 'Folder enabled' : 'Folder disabled')
  }

  function toggleMemory(id, enabled) {
    setMemories(current => current.map(memory =>
      memory.id === id ? { ...memory, enabled } : memory
    ))
  }

  function updateSetting(key, value) {
    setSettings(current => ({ ...current, [key]: value }))
  }

  function openAddMemory() {
    setEditingId(null)
    setTitle('')
    setDetails('')
    setCategoryId(folders[0]?.id || '')
    setModal('memory')
  }

  function openEditMemory(memory) {
    setEditingId(memory.id)
    setTitle(memory.title)
    setDetails(memory.details)
    setCategoryId(memory.categoryId)
    setModal('memory')
  }

  function saveMemory(event) {
    event.preventDefault()
    if (!title.trim() || !categoryId) return

    if (editingId) {
      setMemories(current => current.map(memory =>
        memory.id === editingId
          ? { ...memory, title: title.trim(), details: details.trim(), categoryId }
          : memory
      ))
      notify('Memory updated')
    } else {
      setMemories(current => [{
        id: `m${Date.now()}`,
        title: title.trim(),
        details: details.trim(),
        categoryId,
        enabled: true,
      }, ...current])
      notify('Memory saved')
    }
    setModal('')
  }

  function deleteMemory(id) {
    if (!window.confirm('Delete this memory?')) return
    setMemories(current => current.filter(memory => memory.id !== id))
    notify('Memory deleted')
  }

  function createFolder(event) {
    event.preventDefault()
    const name = folderName.trim()
    if (!name) return

    if (folders.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      notify('That folder already exists')
      return
    }

    setFolders(current => [...current, {
      id: `f${Date.now()}`,
      name,
      type: 'custom',
      enabled: true,
      color: 'blue',
    }])
    setFolderName('')
    setModal('')
    notify('Folder created')
  }

  function deleteFolder(folder) {
    if (folder.type !== 'custom') return
    const contents = memories.filter(memory => memory.categoryId === folder.id)

    if (contents.length) {
      const destination = folders.find(item => item.type === 'predefined')
      if (!destination) {
        notify('Create a destination folder first')
        return
      }

      const confirmed = window.confirm(
        `Move ${contents.length} memory/memories to "${destination.name}" and delete this folder?`
      )
      if (!confirmed) return

      setMemories(current => current.map(memory =>
        memory.categoryId === folder.id
          ? { ...memory, categoryId: destination.id }
          : memory
      ))
    } else if (!window.confirm(`Delete the folder "${folder.name}"?`)) {
      return
    }

    setFolders(current => current.filter(item => item.id !== folder.id))
    if (filter === folder.id) setFilter('all')
    notify('Folder deleted')
  }

  function reviewSuggestion(suggestion, approve) {
    if (approve) {
      const duplicate = memories.find(memory =>
        memory.title.toLowerCase() === suggestion.title.toLowerCase()
      )

      if (duplicate) {
        const update = window.confirm(
          'A memory with this title already exists. Update it with this suggestion?'
        )
        if (update) {
          setMemories(current => current.map(memory =>
            memory.id === duplicate.id
              ? { ...memory, details: suggestion.details, categoryId: suggestion.categoryId }
              : memory
          ))
        }
      } else {
        setMemories(current => [{
          id: `m${Date.now()}`,
          title: suggestion.title,
          details: suggestion.details,
          categoryId: suggestion.categoryId,
          enabled: true,
        }, ...current])
      }
    }

    setSuggestions(current => current.filter(item => item.id !== suggestion.id))
    notify(approve ? 'Suggestion reviewed' : 'Suggestion dismissed')
  }

  function deleteAllMemories() {
    if (!window.confirm('Delete all saved memories?')) return
    setMemories([])
    notify('All memories deleted')
  }

  function folderFor(id) {
    return folders.find(folder => folder.id === id)
  }

  function renderMemory(memory) {
    const folder = folderFor(memory.categoryId)

    return (
      <article className="memory-card" key={memory.id}>
        <div className={`folder-symbol ${folder?.color || 'purple'}`}>✳</div>
        <div className="memory-main">
          <div className="memory-title-row">
            <h3>{memory.title}</h3>
            <span className={`status ${memory.enabled ? 'enabled' : 'disabled'}`}>
              {memory.enabled ? 'Enabled' : 'Paused'}
            </span>
          </div>
          <p>{memory.details || 'No additional details.'}</p>
          <small>{folder?.name || 'Uncategorized'}</small>
        </div>
        <div className="memory-actions">
          <Toggle checked={memory.enabled} onChange={value => toggleMemory(memory.id, value)} label={`Enable ${memory.title}`} />
          <button className="icon-button" onClick={() => openEditMemory(memory)} aria-label="Edit memory">✎</button>
          <button className="icon-button danger" onClick={() => deleteMemory(memory.id)} aria-label="Delete memory">×</button>
        </div>
      </article>
    )
  }

  function renderOverview() {
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A LITTLE MORE PERSONAL</p>
            <h2>Your AI should understand you.</h2>
            <p>Keep your preferences organized and bring the right context to your AI conversations.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={openAddMemory}>＋ Add a memory</button>
              <button className="button secondary" onClick={() => setPage('Suggestions')}>Review suggestions →</button>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="hero-star">✳</div>
            <span className="hero-chip chip-a">Your style</span>
            <span className="hero-chip chip-b">Your goals</span>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon="▤" tone="purple" label="Saved memories" value={memories.length} hint="Preferences you've saved" />
          <StatCard icon="✧" tone="orange" label="Pending suggestions" value={suggestions.length} hint="Waiting for your review" />
          <StatCard icon="◉" tone="green" label="Active folders" value={folders.filter(folder => folder.enabled).length} hint="Currently enabled" />
        </section>

        <section className="overview-grid">
          <div className="panel">
            <div className="panel-heading">
              <div><h3>Your folders</h3><p>Preferences, organized your way.</p></div>
              <button className="text-button" onClick={() => setPage('Folders')}>Manage folders →</button>
            </div>
            <div className="folder-list">
              {folders.slice(0, 5).map(folder => (
                <div className="folder-row" key={folder.id}>
                  <div className={`folder-icon ${folder.color}`}>✳</div>
                  <div className="folder-info">
                    <strong>{folder.name}</strong>
                    <small>{memories.filter(memory => memory.categoryId === folder.id).length} memories</small>
                  </div>
                  <Toggle checked={folder.enabled} onChange={value => toggleFolder(folder.id, value)} label={`Enable ${folder.name} folder`} />
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div><h3>Needs your attention</h3><p>Review before a suggestion is saved.</p></div>
              <span className="count-badge">{suggestions.length}</span>
            </div>
            {suggestions.length ? (
              <>
                <div className="suggestion-preview">
                  <div className="suggestion-icon">✧</div>
                  <div>
                    <strong>{suggestions[0].title}</strong>
                    <p>{suggestions[0].details}</p>
                    <span className="tag">{folderFor(suggestions[0].categoryId)?.name || 'Choose a folder'}</span>
                  </div>
                </div>
                <button className="button primary full-width" onClick={() => setPage('Suggestions')}>Review suggestions →</button>
              </>
            ) : <EmptyState title="You're all caught up" description="There are no suggestions to review." />}
          </div>
        </section>

        <section className="panel recent-panel">
          <div className="panel-heading">
            <div><h3>Recently saved</h3><p>Your latest saved preferences.</p></div>
            <button className="text-button" onClick={() => setPage('All memories')}>View all →</button>
          </div>
          {memories.slice(0, 3).map(memory => (
            <div className="recent-row" key={memory.id}>
              <span className={`mini-icon ${folderFor(memory.categoryId)?.color || 'purple'}`}>✳</span>
              <div><strong>{memory.title}</strong><small>{folderFor(memory.categoryId)?.name || 'Uncategorized'}</small></div>
            </div>
          ))}
        </section>
      </>
    )
  }

  function renderMemories() {
    return (
      <section className="panel page-panel">
        <div className="page-heading">
          <div><h2>All memories</h2><p>Manage the preferences you have saved.</p></div>
          <button className="button primary" onClick={openAddMemory}>＋ Add memory</button>
        </div>
        <div className="filters">
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search memories..." aria-label="Search memories" />
          <select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter by folder">
            <option value="all">All folders</option>
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
        </div>
        <div className="memory-list">
          {filteredMemories.length
            ? filteredMemories.map(renderMemory)
            : <EmptyState title="No memories found" description="Try a different search or add a memory." action="Add a memory" onAction={openAddMemory} />}
        </div>
        <p className="note">Disabled memories remain saved but are not intended to be used for personalization.</p>
      </section>
    )
  }

  function renderSuggestions() {
    return (
      <section className="panel page-panel">
        <div className="page-heading">
          <div><h2>Suggestions</h2><p>Nothing becomes a saved memory without your approval.</p></div>
          <span className="count-badge">{suggestions.length} pending</span>
        </div>
        <div className="privacy-banner">
          <strong>Privacy note</strong>
          <p>These are sample suggestions for the prototype. Automatic discovery is not connected yet.</p>
        </div>
        {suggestions.length ? suggestions.map(suggestion => (
          <article className="suggestion-item" key={suggestion.id}>
            <div className="suggestion-icon">✧</div>
            <div className="suggestion-content">
              <h3>{suggestion.title}</h3>
              <p>{suggestion.details}</p>
              <label className="field-label">Save to folder</label>
              <select value={suggestion.categoryId} onChange={event => setSuggestions(current => current.map(item => item.id === suggestion.id ? { ...item, categoryId: event.target.value } : item))}>
                {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
              </select>
              <div className="suggestion-actions">
                <button className="button primary" onClick={() => reviewSuggestion(suggestion, true)}>Approve memory</button>
                <button className="button secondary" onClick={() => reviewSuggestion(suggestion, false)}>Dismiss</button>
              </div>
            </div>
          </article>
        )) : <EmptyState title="No pending suggestions" description="You've reviewed all suggestions." />}
      </section>
    )
  }

  function renderFolders() {
    return (
      <section className="panel page-panel">
        <div className="page-heading">
          <div><h2>Folders</h2><p>Organize preferences and control which folders are enabled.</p></div>
          <button className="button primary" onClick={() => setModal('folder')}>＋ New folder</button>
        </div>
        <div className="privacy-banner">
          <strong>Remember</strong>
          <p>Turning a folder off does not delete its memories. Predefined folders cannot be deleted.</p>
        </div>
        {folders.map(folder => (
          <div className="folder-manager-row" key={folder.id}>
            <div className={`folder-icon ${folder.color}`}>✳</div>
            <div className="folder-info"><strong>{folder.name}</strong><small>{folder.type === 'custom' ? 'Custom folder' : 'Predefined folder'} · {memories.filter(memory => memory.categoryId === folder.id).length} memories</small></div>
            <Toggle checked={folder.enabled} onChange={value => toggleFolder(folder.id, value)} label={`Enable ${folder.name}`} />
            {folder.type === 'custom' && <button className="icon-button danger" onClick={() => deleteFolder(folder)} aria-label={`Delete ${folder.name}`}>×</button>}
          </div>
        ))}
      </section>
    )
  }

  function renderSettings() {
    return (
      <section className="panel page-panel">
        <div className="page-heading"><div><h2>Settings & privacy</h2><p>Control how your saved preferences may be used.</p></div></div>
        <SettingRow title="Enable personalization" description="Allow approved and enabled memories to be considered for prompts." checked={settings.personalization} onChange={value => updateSetting('personalization', value)} />
        <SettingRow title="Discover preference suggestions" description="Enable the discovery preference for a future extension integration." checked={settings.discovery} onChange={value => updateSetting('discovery', value)} />
        <SettingRow title="Allow external AI" description="Off by default. No external AI requests are sent by this frontend." checked={settings.externalAI} onChange={value => updateSetting('externalAI', value)} />
        <h3 className="settings-heading">Supported websites</h3>
        <p className="settings-description">These are preferences only until site integrations are built.</p>
        {[
          { id: 'chatgpt', name: 'ChatGPT', domain: 'chatgpt.com' },
          { id: 'claude', name: 'Claude', domain: 'claude.ai' },
          { id: 'gemini', name: 'Gemini', domain: 'gemini.google.com' },
        ].map(site => (
          <SettingRow key={site.id} title={site.name} description={site.domain} checked={settings.sites[site.id]} onChange={value => setSettings(current => ({ ...current, sites: { ...current.sites, [site.id]: value } }))} />
        ))}
        <div className="danger-zone">
          <div><h3>Delete all memories</h3><p>This removes all saved memory records from this browser prototype.</p></div>
          <button className="button danger-button" onClick={deleteAllMemories}>Delete all</button>
        </div>
        <p className="note">This prototype stores data in your browser using localStorage. It is not synced to Spring Boot or MySQL.</p>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('Overview')}>
          <span className="brand-mark">M</span>
          <span><strong>Memory Layer</strong><small>Personal AI memory</small></span>
        </button>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="navigation">
          {[
            ['Overview', '▦'],
            ['All memories', '▤'],
            ['Suggestions', '✧', suggestions.length],
            ['Folders', '▣'],
          ].map(([name, icon, count]) => (
            <button key={name} className={`nav-item ${page === name ? 'active' : ''}`} onClick={() => setPage(name)}>
              <span>{icon}</span>{name}{count > 0 && <b>{count}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => setPage('Settings')}><span>⚙</span>Settings</button>
          <div className="privacy-card"><span className="privacy-dot" /><div><strong>Privacy first</strong><small>Your memory, your control.</small></div></div>
          <p className="version">FRONTEND PROTOTYPE · v0.1</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">YOUR PERSONAL SPACE</p><h1>{page === 'Overview' ? 'Memory dashboard' : page}</h1></div>
          <span className="local-status"><span /> Saved in this browser</span>
        </header>

        {page === 'Overview' && renderOverview()}
        {page === 'All memories' && renderMemories()}
        {page === 'Suggestions' && renderSuggestions()}
        {page === 'Folders' && renderFolders()}
        {page === 'Settings' && renderSettings()}

        <footer className="footer"><span>Memory Layer · Your memory, your choice.</span><span>Local-first prototype · Backend not connected</span></footer>
      </main>

      {modal === 'memory' && (
        <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal('') }}>
          <form className="modal" onSubmit={saveMemory}>
            <div className="modal-heading"><h2>{editingId ? 'Edit memory' : 'Add a memory'}</h2><button type="button" className="icon-button" onClick={() => setModal('')}>×</button></div>
            <label className="field-label" htmlFor="memory-title">Memory title</label>
            <input id="memory-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Explain code step by step" required maxLength={120} />
            <label className="field-label" htmlFor="memory-details">Details</label>
            <textarea id="memory-details" value={details} onChange={event => setDetails(event.target.value)} placeholder="Describe this preference..." rows={4} maxLength={500} />
            <label className="field-label" htmlFor="memory-folder">Folder</label>
            <select id="memory-folder" value={categoryId} onChange={event => setCategoryId(event.target.value)} required>
              {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
            <p className="modal-note">Only save information useful in future conversations. Never store passwords or authentication secrets.</p>
            <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal('')}>Cancel</button><button type="submit" className="button primary">Save memory</button></div>
          </form>
        </div>
      )}

      {modal === 'folder' && (
        <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal('') }}>
          <form className="modal small-modal" onSubmit={createFolder}>
            <div className="modal-heading"><h2>Create a folder</h2><button type="button" className="icon-button" onClick={() => setModal('')}>×</button></div>
            <label className="field-label" htmlFor="folder-name">Folder name</label>
            <input id="folder-name" value={folderName} onChange={event => setFolderName(event.target.value)} placeholder="e.g. Personal projects" required maxLength={50} />
            <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal('')}>Cancel</button><button type="submit" className="button primary">Create folder</button></div>
          </form>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function StatCard({ icon, tone, label, value, hint }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><p>{label}</p><strong>{value}</strong><small>{hint}</small></article>
}

function EmptyState({ title, description, action, onAction }) {
  return <div className="empty-state"><div className="empty-symbol">✳</div><h3>{title}</h3><p>{description}</p>{action && <button className="button primary" onClick={onAction}>{action}</button>}</div>
}

function SettingRow({ title, description, checked, onChange }) {
  return <div className="setting-row"><div><strong>{title}</strong><p>{description}</p></div><Toggle checked={checked} onChange={onChange} label={title} /></div>
}

export default App
