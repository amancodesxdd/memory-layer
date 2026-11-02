const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080/api'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const xsrfToken = getCookie('XSRF-TOKEN')
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken
  }
  return headers
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { ...authHeaders(), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.message || err.error || `Request failed (${res.status})`
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

function toBackendRequest(data) {
  const sourceMap = { user: 'USER_ADDED', ai: 'AI_INFERRED', import: 'IMPORT' }
  const riskMap = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' }
  return {
    title: data.title.trim(),
    details: (data.details || '').trim(),
    categoryId: data.categoryId || null,
    source: sourceMap[data.source] || 'USER_ADDED',
    enabled: data.enabled !== undefined ? data.enabled : true,
    pinned: data.pinned || false,
    confidence: data.confidence !== undefined ? data.confidence : 1,
    riskLevel: riskMap[data.risk] || 'LOW',
    tags: Array.isArray(data.tags) ? data.tags : [],
    usageReason: data.usageReason || 'Created manually.',
  }
}

function fromBackendDto(dto) {
  const sourceMap = { USER_ADDED: 'user', AI_INFERRED: 'ai', IMPORT: 'import' }
  const riskMap = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }
  return {
    id: dto.id,
    title: dto.title,
    details: dto.details,
    categoryId: dto.categoryId,
    source: sourceMap[dto.source] || 'user',
    enabled: dto.enabled,
    pinned: dto.pinned,
    confidence: dto.confidence,
    risk: riskMap[dto.riskLevel] || 'low',
    tags: dto.tags || [],
    version: dto.version,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    lastUsedAt: dto.lastUsedAt,
    useCount: dto.useCount,
    usageReason: dto.usageReason,
    history: [],
  }
}

/**
 * Return all memories from the backend API.
 */
export async function getMemories() {
  const dtos = await request('/memories')
  return (dtos || []).map(fromBackendDto)
}

/**
 * Return a single memory by id from the backend API.
 */
export async function getMemoryById(id) {
  const dto = await request(`/memories/${id}`)
  return fromBackendDto(dto)
}

/**
 * Validate and create a new memory via the backend API.
 */
export async function createMemory(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Memory data is required.')
  }
  if (!data.title || !data.title.trim()) {
    throw new Error('Memory title cannot be empty.')
  }

  const dto = await request('/memories', {
    method: 'POST',
    body: toBackendRequest(data),
  })
  return fromBackendDto(dto)
}

/**
 * Update an existing memory via the backend API.
 */
export async function updateMemory(id, updates) {
  const body = {}
  if (updates.title !== undefined) body.title = updates.title.trim()
  if (updates.details !== undefined) body.details = updates.details.trim()
  if (updates.categoryId !== undefined) body.categoryId = updates.categoryId
  if (updates.enabled !== undefined) body.enabled = updates.enabled
  if (updates.pinned !== undefined) body.pinned = updates.pinned
  if (updates.tags !== undefined) body.tags = updates.tags

  const dto = await request(`/memories/${id}`, {
    method: 'PUT',
    body,
  })
  return fromBackendDto(dto)
}

/**
 * Delete a memory via the backend API.
 */
export async function deleteMemory(id) {
  await request(`/memories/${id}`, { method: 'DELETE' })
  return id
}

/**
 * Search memories locally on the client-side fetched list.
 * Backend doesn't have a search endpoint in this version.
 */
export function searchMemories(memories, query) {
  if (!query || !query.trim()) return memories
  const q = query.trim().toLowerCase()
  return memories.filter(m => {
    const haystack = `${m.title || ''} ${m.details || ''} ${(m.tags || []).join(' ')}`.toLowerCase()
    return haystack.includes(q)
  })
}

/**
 * Filter memories locally on the client-side fetched list.
 */
export function filterMemories(memories, filters = {}) {
  return memories.filter(m => {
    if (filters.category && m.categoryId !== filters.category) return false
    if (filters.source && m.source !== filters.source) return false
    if (filters.enabled !== undefined && m.enabled !== filters.enabled) return false
    if (filters.pinned !== undefined && m.pinned !== filters.pinned) return false
    return true
  })
}

/**
 * Mark a memory as enabled (active) via the backend API.
 */
export async function approveMemory(id) {
  const dto = await request(`/memories/${id}/approve`, { method: 'POST' })
  return fromBackendDto(dto)
}

/**
 * Mark a memory as disabled (rejected) via the backend API.
 */
export async function rejectMemory(id) {
  const dto = await request(`/memories/${id}/reject`, { method: 'POST' })
  return fromBackendDto(dto)
}

export default {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  searchMemories,
  filterMemories,
  approveMemory,
  rejectMemory,
}
