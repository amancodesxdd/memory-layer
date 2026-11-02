import { useState } from 'react'
import { Bot, Globe, KeyRound, Plug, Unplug, ShieldCheck } from 'lucide-react'
import { Card, CardHead, Pill, Toggle, EmptyState } from '../components/ui'

const SITES = [
  {
    id: 'chatgpt', name: 'ChatGPT', vendor: 'OpenAI', color: 'green',
    scopes: ['Read chat history', 'Store memories', 'Personalise responses'],
    detail: 'Memory Layer bridges your saved memories into ChatGPT conversations.',
  },
  {
    id: 'claude', name: 'Claude', vendor: 'Anthropic', color: 'orange',
    scopes: ['Read chat history', 'Store memories', 'Personalise responses'],
    detail: 'Share the memory layer with Claude to keep preferences consistent.',
  },
  {
    id: 'gemini', name: 'Gemini', vendor: 'Google', color: 'blue',
    scopes: ['Read chat history', 'Store memories'],
    detail: 'Let Gemini draw on the same memory layer as your other assistants.',
  },
  {
    id: 'perplexity', name: 'Perplexity', vendor: 'Perplexity AI', color: 'cyan',
    scopes: ['Read chat history'],
    detail: 'Give Perplexity access to your preferences when you ask research questions.',
  },
]

export default function Integrations({ settings, onConnect, onDisconnect }) {
  const [selected, setSelected] = useState('chatgpt')
  const site = SITES.find(s => s.id === selected)
  const connected = Object.entries(settings.sites).filter(([, on]) => on).map(([id]) => id)

  return (
    <>
      <section className="page-head">
        <div>
          <p className="label">Integrations</p>
          <h1 className="dash-title">Connected AI websites</h1>
          <p className="dash-sub">
            {connected.length} of {SITES.length} sites connected · each one can be revoked instantly
          </p>
        </div>
        <div className="dash-actions">
          <Pill variant="solid"><Plug size={14} /> Add integration</Pill>
        </div>
      </section>

      <div className="split-layout">
        <Card>
          <CardHead title="AI websites" subtitle="Select a site to configure permissions" />
          <div className="site-list">
            {SITES.map(s => (
              <button
                key={s.id}
                type="button"
                className={`site-row ${selected === s.id ? 'active' : ''}`}
                onClick={() => setSelected(s.id)}
              >
                <span className={`site-logo ${s.color}`}><Bot size={17} /></span>
                <div>
                  <strong>{s.name}</strong>
                  <small>{s.vendor}</small>
                </div>
                <span className={`conn-state ${settings.sites[s.id] ? 'on' : ''}`}>
                  {settings.sites[s.id] ? 'Connected' : 'Not connected'}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {site && (
          <Card>
            <CardHead
              title={site.name}
              subtitle={site.detail}
              action={
                settings.sites[site.id]
                  ? <Pill variant="danger" onClick={() => onDisconnect(site.id)}><Unplug size={14} /> Disconnect</Pill>
                  : <Pill variant="solid" onClick={() => onConnect(site.id)}><Plug size={14} /> Connect</Pill>
              }
            />

            <div className="perm-list">
              {site.scopes.map(scope => (
                <div key={scope} className="perm-row">
                  <ShieldCheck size={15} />
                  <span>{scope}</span>
                  <Toggle
                    checked={settings.sites[site.id]}
                    onChange={() => (settings.sites[site.id] ? onDisconnect(site.id) : onConnect(site.id))}
                    label={`${scope} for ${site.name}`}
                  />
                </div>
              ))}
            </div>

            <div className="token-row">
              <KeyRound size={15} />
              <div>
                <strong>API key</strong>
                <p>{settings.sites[site.id] ? 'Stored locally on this device. Never synced.' : 'You will need a key to connect this site.'}</p>
              </div>
              <Pill onClick={() => {}}>Manage</Pill>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <CardHead title="Shared context" subtitle="What every connected site can currently see" />
        {connected.length ? (
          <div className="share-grid">
            <div><Globe size={16} /><strong>Enabled memories</strong><span>All active memories are shared with connected sites.</span></div>
            <div><ShieldCheck size={16} /><strong>Sensitive memories</strong><span>High-risk memories are never sent automatically.</span></div>
            <div><KeyRound size={16} /><strong>Credentials</strong><span>Secrets and API keys are never stored as memories.</span></div>
          </div>
        ) : (
          <EmptyState title="No connected sites" description="Connect an AI website to start sharing your memory layer." />
        )}
      </Card>
    </>
  )
}
