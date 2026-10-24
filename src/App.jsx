
import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <h2>MemoAI</h2>
            <p>Personal memory</p>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <button className="nav-item active">▦ Overview</button>
        <button className="nav-item">▤ All memories</button>
        <button className="nav-item">✧ Suggestions <span>3</span></button>
        <button className="nav-item">▣ Folders</button>

        <div className="sidebar-bottom">
          <button className="nav-item">⚙ Settings</button>
          <div className="privacy-note">
            <span className="status-dot" />
            <div>
              <strong>Privacy first</strong>
              <p>Your memories, your control.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL SPACE</p>
            <h1>Memory dashboard</h1>
          </div>
          <button className="profile-button">My workspace ↗</button>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">A LITTLE MORE PERSONAL</p>
            <h2>Your AI should understand you.</h2>
            <p>
              Keep your preferences organized and bring the right context
              to your AI conversations.
            </p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="memory-symbol">✳</div>
            <span className="float-chip chip-one">Your style</span>
            <span className="float-chip chip-two">Your goals</span>
          </div>
        </section>

        <section className="stats">
          <article className="stat-card">
            <span className="stat-icon lavender">▤</span>
            <p>Saved memories</p>
            <strong>12</strong>
            <small>Preferences you've approved</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon peach">✧</span>
            <p>Pending suggestions</p>
            <strong>3</strong>
            <small>Waiting for your review</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon mint">◉</span>
            <p>Active folders</p>
            <strong>4</strong>
            <small>Organizing your memories</small>
          </article>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="section-heading">
              <div>
                <h3>Your folders</h3>
                <p>Preferences, organized your way.</p>
              </div>
              <button className="text-button">View all →</button>
            </div>

            <div className="folder-list">
              <div className="folder-row">
                <span className="folder-icon lavender">⌘</span>
                <div className="folder-info">
                  <strong>Programming</strong>
                  <small>5 memories</small>
                </div>
                <span className="toggle on" />
              </div>

              <div className="folder-row">
                <span className="folder-icon peach">▧</span>
                <div className="folder-info">
                  <strong>Learning & Education</strong>
                  <small>3 memories</small>
                </div>
                <span className="toggle on" />
              </div>

              <div className="folder-row">
                <span className="folder-icon mint">☷</span>
                <div className="folder-info">
                  <strong>Response Style</strong>
                  <small>4 memories</small>
                </div>
                <span className="toggle on" />
              </div>
            </div>
          </div>

          <div className="panel suggestions-panel">
            <div className="section-heading">
              <div>
                <h3>Needs your attention</h3>
                <p>Review before a suggestion is saved.</p>
              </div>
              <span className="count-badge">3</span>
            </div>

            <div className="suggestion-card">
              <span className="suggestion-mark">✧</span>
              <div>
                <strong>Step-by-step explanations</strong>
                <p>A possible learning preference</p>
                <span className="suggestion-tag">Learning & Education</span>
              </div>
            </div>

            <button className="primary-button">
              Review suggestions →
            </button>
            <p className="helper-text">
              Nothing becomes an active memory without your approval.
            </p>
          </div>
        </section>

        <footer>
          <span>MemoAI · Your memory, your choice.</span>
          <span>Local-first by design</span>
        </footer>
      </main>
    </div>
  )
}

export default App
