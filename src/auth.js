const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080/api'
const USER_KEY = 'ml-auth-user'

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

export async function isAuthenticated() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    return res.ok
  } catch {
    return false
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const xsrfToken = getCookie('XSRF-TOKEN')
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken
  }
  return headers
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include', // send HttpOnly cookies
    headers: { ...authHeaders(), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })

  // CSRF retry: Spring sets XSRF-TOKEN cookie on 403. Retry with the header.
  if (res.status === 403) {
    const xsrfToken = getCookie('XSRF-TOKEN')
    if (xsrfToken) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        method,
        credentials: 'include',
        headers: { ...authHeaders(), 'X-XSRF-TOKEN': xsrfToken, ...headers },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({}))
        const msg = err.message || err.error || `Request failed (${retryRes.status})`
        throw new Error(msg)
      }
      if (retryRes.status === 204) return null
      return retryRes.json()
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.message || err.error || `Request failed (${res.status})`
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function register({ email, password }) {
  const data = await request('/auth/register', { method: 'POST', body: { email, password } })
  setToken(data.accessToken)
  setUser({ userId: data.userId, email: data.email })
  return data
}

export async function login({ email, password }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } })
  setToken(data.accessToken)
  setUser({ userId: data.userId, email: data.email })
  return data
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    /* ignore network errors on logout */
  }
  clearUser()
}

export async function me() {
  return request('/auth/me')
}

export async function refresh() {
  return request('/auth/refresh', { method: 'POST' })
}

export default {
  getUser,
  setUser,
  clearUser,
  isAuthenticated,
  register,
  login,
  logout,
  me,
  refresh,
}
