import { useState } from 'react'
import { FolderPlus, Folder, Layers, Trash2, ToggleLeft } from 'lucide-react'
import { Card, CardHead, Pill, EmptyState, Toggle } from '../components/ui'
import { relativeTime } from '../data'

export default function FoldersPage({ folders, memories, onCreateFolder, onDeleteFolder, onToggleFolder }) {
  const [name, setName] = useState('')

  const counts = id => memories.filter(m => m.categoryId === id)
  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateFolder(name.trim())
    setName('')
  }

  const projects = folders.filter(f => f.project)
  const categories = folders.filter(f => !f.project)

  const renderGroup = (title, subtitle, group) => (
    <Card>
      <CardHead
        title={title}
        subtitle={subtitle}
        action={
          <form className="inline-form" onSubmit={submit}>
            <input
              value={name}
              placeholder="New folder name"
              onChange={e => setName(e.target.value)}
              aria-label="Folder name"
            />
            <Pill type="submit" variant="solid"><FolderPlus size={14} /> Create</Pill>
          </form>
        }
      />
      {group.length ? (
        <div className="folder-grid">
          {group.map(folder => {
            const items = counts(folder.id)
            return (
              <article key={folder.id} className={`folder-card ${folder.enabled ? '' : 'off'}`}>
                <div className={`folder-icon ${folder.color}`}><Folder size={17} /></div>
                <div className="folder-info">
                  <h3>{folder.name}</h3>
                  <p>{items.length} memories · created {relativeTime(folder.createdAt)}</p>
                </div>
                <Toggle
                  checked={folder.enabled}
                  onChange={() => onToggleFolder(folder.id)}
                  label={`Enable ${folder.name}`}
                />
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => onDeleteFolder(folder.id)}
                  aria-label={`Delete ${folder.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState title="No folders yet" description="Create one to start organising context." />
      )}
    </Card>
  )

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Projects & Folders</p>
          <h1 className="dash-title">Organise context</h1>
          <p className="dash-sub">
            {folders.length} folders grouping {memories.length} memories by topic and project.
          </p>
        </div>
        <div className="dash-actions">
          <Pill><Layers size={14} /> {projects.length} projects</Pill>
          <Pill><Folder size={14} /> {categories.length} categories</Pill>
        </div>
      </section>

      {renderGroup('Projects', 'Ongoing work with their own goals and deadlines', projects)}
      {renderGroup('Categories', 'Reusable buckets that every memory belongs to', categories)}

      <Card>
        <CardHead title="How folders are used" subtitle="Automatic organisation rules" />
        <ul className="rule-list">
          <li><ToggleLeft size={16} /><div><strong>Auto-assign by topic</strong><p>New memories are routed to the closest matching folder automatically.</p></div></li>
          <li><ToggleLeft size={16} /><div><strong>Folder-scoped context</strong><p>Chat with a project folder to load only its memories into context.</p></div></li>
          <li><ToggleLeft size={16} /><div><strong>Per-folder permissions</strong><p>Disable a folder to stop it from being used without deleting it.</p></div></li>
        </ul>
      </Card>
    </>
  )
}
