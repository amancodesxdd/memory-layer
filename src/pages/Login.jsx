import { useState } from 'react'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { Card, CardHead, Pill } from '../components/ui'
import { login, register } from '../auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login({ mode = 'login', onAuth, onToggle }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setProcessing(true)
    try {
      if (isRegister) {
        await register({ email, password })
      } else {
        await login({ email, password })
      }
      if (onAuth) onAuth()
    } catch (err) {
      const msg = err.message || 'Authentication failed'
      if (msg.includes('Failed to fetch') || msg.includes('network')) {
        setError('Cannot connect to server. Make sure the backend is running on http://localhost:8080')
      } else {
        setError(msg)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <section className="auth-page">
        <section className="page-head auth-page-head">
          <button
            type="button"
            className="auth-back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <p className="label">{isRegister ? 'Create account' : 'Sign in'}</p>
            <h1 className="dash-title">
              {isRegister ? 'Join knowU' : 'Welcome back'}
            </h1>
            <p className="dash-sub">
              {isRegister
                ? 'Create your account to sync memories across devices.'
                : 'Sign in to access your memory layer and cloud sync.'}
            </p>
          </div>
        </section>

        <div className="auth-card-wrapper">
          <Card className="auth-card">
            <CardHead
              title={isRegister ? 'Create your account' : 'Sign in to your account'}
              subtitle={
                isRegister
                  ? 'Enter your email and choose a password.'
                  : 'Enter your email and password to continue.'
              }
            />

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label>
                  <Mail size={15} style={{ marginRight: 8 }} /> Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete={isRegister ? 'email' : 'current-email'}
                />
              </div>

              <div className="form-field">
                <label>
                  <Lock size={15} style={{ marginRight: 8 }} /> Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              {error && (
                <div className="auth-error">
                  <Lock size={14} /> {error}
                </div>
              )}

              <div className="auth-actions">
                <Pill type="button" variant="danger" onClick={() => window.history.back()}>
                  Cancel
                </Pill>
                <Pill type="submit" variant="solid" disabled={processing}>
                  {processing ? 'Signing in…' : isRegister ? 'Create account' : 'Sign in'}
                </Pill>
              </div>

              <div className="auth-switch">
                <Pill
                  type="button"
                  variant="solid"
                  onClick={onToggle}
                  size="small"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create account"}
                </Pill>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}
