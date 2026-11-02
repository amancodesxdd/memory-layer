import { useMemo, useState } from 'react'
import {
  Search, Plus, Pin, PinOff, Trash2, Edit3, Download, ArrowUpDown,
  CheckSquare, Square, X, Filter,
} from 'lucide-react'
import { Card, Pill, FilterGroup, EmptyState, SourceTag, RiskTag } from '../components/ui'
import { relativeTime, NOW } from '../data'

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'newest', label: 'Newest' },
  { id: 'used', label: 'Most used' },
  { id: 'oldest', label: 'Oldest' },
]

export default function MemoryLibrary({
  memories, folders, search, setSearch, onAdd, onOpenMemory, onTogglePin,
  onDelete, onBulkDelete, onBulkExport, plan,
}) {
  const [folder, setFolder] = useState('all')
  const [source, setSource] = useState('all')
  const [date, setDate] = useState('all')
  const [sort, setSort] = useState('relevance')
  const [selected, setSelected] = useState([])

  const folderName = id => folders.find(f => f.id === id)?.name || 'Uncategorized'
  const folderColor = id => folders.find(f => f.id === id)?.color || 'purple'

  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = NOW
    const scored = memories
      .map(memory => {
        const haystack = `${memory.title || ''} ${memory.details || ''} ${(memory.tags || []).join(' ')}`.toLowerCase()
        const terms = q.split(/\s+/).filter(Boolean)
        let score = 0
        terms.forEach(term => {
          if (memory.title && memory.title.toLowerCase().includes(term)) score += 6
          if (haystack.includes(term)) score += 3
          if ((memory.tags || []).some(t => t && t.toLowerCase().includes(term))) score += 4
        })
        if (memory.pinned) score += 2
        return { memory, score }
      })
      .filter(({ memory, score }) => {
        if (q && score === 0) return false
        if (folder !== 'all' && memory.categoryId !== folder) return false
        if (source !== 'all' && memory.source !== source) return false
        if (!memory.createdAt) return false
        if (date === 'week' && now - new Date(memory.createdAt).getTime() > 7 * 86400000) return false
        if (date === 'month' && now - new Date(memory.createdAt).getTime() > 30 * 86400000) return false
        if (date === 'quarter' && now - new Date(memory.createdAt).getTime() > 90 * 86400000) return false
        return true
      })

    const bySort = {
      relevance: (a, b) => b.score - a.score || b.memory.useCount - a.memory.useCount,
      newest: (a, b) => new Date(b.memory.createdAt) - new Date(a.memory.createdAt),
      oldest: (a, b) => new Date(a.memory.createdAt) - new Date(b.memory.createdAt),
      used: (a, b) => b.memory.useCount - a.memory.useCount,
    }
    return scored.sort(bySort[sort]).map(s => s.memory)
  }, [memories, search, folder, source, date, sort])

  const allSelected = results.length > 0 && selected.length === results.length
  const toggleSelect = id =>
    setSelected(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id])

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Advanced Memory Library</p>
          <h1 className="dash-title">All memories</h1>
          <p className="dash-sub">
            {results.length} of {memories.length} memories · search by meaning or keywords
          </p>
        </div>
        <div className="dash-actions">
          <Pill
            onClick={() => {
              if (plan !== 'developer') { notify('Bulk export is a Developer plan feature'); return }
              onBulkExport(selected.length ? selected : undefined)
            }}
            disabled={!selected.length || plan !== 'developer'}
          >
            <Download size={14} /> Export{selected.length ? ` (${selected.length})` : ''}
          </Pill>
          <Pill variant="solid" onClick={onAdd}>
            <Plus size={15} /> Add memory
          </Pill>
        </div>
      </section>

      <Card className="library-toolbar">
        <div className="search-row">
          <label className="search-box">
            <Search size={17} />
            <input
              type="search"
              value={search}
              placeholder="Search memories by meaning or keywords…"
              onChange={e => setSearch(e.target.value)}
            />
          </label>

          <label className="select-box">
            <ArrowUpDown size={15} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className="filter-rows">
          <div className="filter-row">
            <span className="filter-label"><Filter size={14} /> Folder</span>
            <FilterGroup>
              <button type="button" className={`filter-btn ${folder === 'all' ? 'active' : ''}`} onClick={() => setFolder('all')}>
                All
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-btn ${folder === f.id ? 'active' : ''}`}
                  onClick={() => setFolder(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </FilterGroup>
          </div>

          <div className="filter-row">
            <span className="filter-label"><Filter size={14} /> Source</span>
            <FilterGroup>
              {[['all', 'All'], ['user', 'You'], ['ai', 'AI'], ['import', 'Imported']].map(([id, label]) => (
                <button key={id} type="button" className={`filter-btn ${source === id ? 'active' : ''}`} onClick={() => setSource(id)}>
                  {label}
                </button>
              ))}
            </FilterGroup>
          </div>

          <div className="filter-row">
            <span className="filter-label"><Filter size={14} /> Added</span>
            <FilterGroup>
              {[['all', 'Any time'], ['week', 'Last 7 days'], ['month', 'Last 30 days'], ['quarter', 'Last 90 days']].map(([id, label]) => (
                <button key={id} type="button" className={`filter-btn ${date === id ? 'active' : ''}`} onClick={() => setDate(id)}>
                  {label}
                </button>
              ))}
            </FilterGroup>
          </div>
        </div>

        <div className="bulk-bar">
          <button
            type="button"
            className="bulk-select"
            onClick={() => setSelected(allSelected ? [] : results.map(m => m.id))}
          >
            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            {allSelected ? 'Clear selection' : 'Select all'}
          </button>
          {selected.length > 0 && (
            <div className="bulk-actions">
              <span>{selected.length} selected</span>
              <Pill onClick={onBulkExport}><Download size={13} /> Export</Pill>
              <Pill variant="danger" onClick={() => {
                if (plan !== 'developer') { notify('Bulk delete is a Developer plan feature'); return }
                onBulkDelete()
              }}><Trash2 size={13} /> Delete</Pill>
              <Pill onClick={() => setSelected([])}><X size={13} /> Clear</Pill>
            </div>
          )}
        </div>
      </Card>

      {results.length ? (
        <div className="mem-grid">
          {results.map(memory => (
            <article key={memory.id} className={`mem-card ${selected.includes(memory.id) ? 'selected' : ''}`}>
              <div className="mem-card-top">
                <button
                  type="button"
                  className="pick"
                  onClick={() => toggleSelect(memory.id)}
                  aria-label={`Select ${memory.title}`}
                >
                  {selected.includes(memory.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span className={`folder-chip ${folderColor(memory.categoryId)}`}>
                  {folderName(memory.categoryId)}
                </span>
                <button
                  type="button"
                  className={`icon-btn ${memory.pinned ? 'pinned' : ''}`}
                  onClick={() => onTogglePin(memory.id)}
                  aria-label={memory.pinned ? 'Unpin' : 'Pin'}
                >
                  {memory.pinned ? <Pin size={15} /> : <PinOff size={15} />}
                </button>
              </div>

              <button type="button" className="mem-card-body" onClick={() => onOpenMemory(memory)}>
                <h3>{memory.title}</h3>
                <p>{memory.details || 'No additional details.'}</p>
              </button>

              <div className="mem-card-tags">
                {(memory.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>

              <footer className="mem-card-foot">
                <div className="mem-meta">
                  <SourceTag source={memory.source} />
                  <RiskTag risk={memory.risk} />
                </div>
                <div className="mem-meta">
                  <span className="muted">{memory.useCount}× used</span>
                  <span className="muted">{relativeTime(memory.updatedAt)}</span>
                </div>
                <div className="mem-actions">
                  <button type="button" className="icon-btn" onClick={() => onOpenMemory(memory)} aria-label="Edit">
                    <Edit3 size={15} />
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => onDelete(memory.id)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No memories match"
            description="Try a different keyword, folder, source or date range."
            action={<Pill onClick={() => { setSearch(''); setFolder('all'); setSource('all'); setDate('all') }}>Reset filters</Pill>}
          />
        </Card>
      )}
    </>
  )
}
