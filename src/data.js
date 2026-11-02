export const SOURCES = {
  USER: 'user',
  AI: 'ai',
  IMPORT: 'import',
}

export const RISK = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

export const SOURCE_LABEL = {
  user: 'Added by you',
  ai: 'Suggested by AI',
  import: 'Imported',
}

export const RISK_LABEL = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
}

const now = Date.now()
const day = 86400000
const ago = d => new Date(now - d * day).toISOString()

export const NOW = now

export const seedFolders = [
  { id: 'learning', name: 'Learning & Education', type: 'predefined', enabled: true, color: 'purple', createdAt: ago(180), project: false },
  { id: 'programming', name: 'Programming', type: 'predefined', enabled: true, color: 'blue', createdAt: ago(180), project: false },
  { id: 'style', name: 'Response Style', type: 'predefined', enabled: true, color: 'orange', createdAt: ago(180), project: false },
  { id: 'work', name: 'Work & Career', type: 'predefined', enabled: true, color: 'green', createdAt: ago(180), project: false },
  { id: 'dsa', name: 'DSA Prep 2026', type: 'custom', enabled: true, color: 'pink', createdAt: ago(42), project: true },
  { id: 'backend', name: 'Spring Boot API', type: 'custom', enabled: true, color: 'cyan', createdAt: ago(31), project: true },
]

export const seedMemories = [
  {
    id: 'm1', title: 'Explain concepts from the basics',
    details: 'Start with the fundamentals and build up gradually.',
    categoryId: 'learning', source: SOURCES.USER, enabled: true, pinned: true,
    confidence: 1, risk: RISK.LOW, createdAt: ago(160), updatedAt: ago(12),
    lastUsedAt: ago(1), useCount: 34, usageReason: 'Matched a request to explain a new concept.',
    tags: ['teaching', 'basics'], version: 3,
    history: [
      { version: 1, at: ago(160), title: 'Explain simply', details: 'Keep answers short.' },
      { version: 2, at: ago(88), title: 'Explain concepts from the basics', details: 'Start with fundamentals.' },
    ],
  },
  {
    id: 'm2', title: 'Use Java for coding examples',
    details: 'Prefer Java examples for programming and DSA.',
    categoryId: 'programming', source: SOURCES.USER, enabled: true, pinned: false,
    confidence: 1, risk: RISK.LOW, createdAt: ago(155), updatedAt: ago(30),
    lastUsedAt: ago(2), useCount: 51, usageReason: 'Coding question with no language specified.',
    tags: ['java', 'examples'], version: 2,
    history: [{ version: 1, at: ago(155), title: 'Prefer Java', details: 'Always use Java.' }],
  },
  {
    id: 'm3', title: 'Explain code step by step',
    details: 'Walk through conditions, variables, and important lines.',
    categoryId: 'programming', source: SOURCES.AI, enabled: true, pinned: true,
    confidence: 0.92, risk: RISK.LOW, createdAt: ago(96), updatedAt: ago(96),
    lastUsedAt: ago(0), useCount: 28, usageReason: 'User asked to debug a loop.',
    tags: ['step-by-step', 'debugging'], version: 1, history: [],
  },
  {
    id: 'm4', title: 'Include complete dry runs',
    details: 'Show how variable values change at each step.',
    categoryId: 'style', source: SOURCES.AI, enabled: true, pinned: false,
    confidence: 0.78, risk: RISK.LOW, createdAt: ago(70), updatedAt: ago(20),
    lastUsedAt: ago(3), useCount: 12, usageReason: 'Trace request for a Java method.',
    tags: ['dry-run', 'teaching'], version: 2,
    history: [{ version: 1, at: ago(70), title: 'Show dry runs', details: 'Trace variable values.' }],
  },
  {
    id: 'm5', title: 'Prefer practical examples',
    details: 'Connect explanations to realistic projects.',
    categoryId: 'work', source: SOURCES.AI, enabled: false, pinned: false,
    confidence: 0.64, risk: RISK.MEDIUM, createdAt: ago(64), updatedAt: ago(64),
    lastUsedAt: ago(45), useCount: 3, usageReason: 'Job-description tailoring request.',
    tags: ['examples', 'projects'], version: 1, history: [],
  },
  {
    id: 'm6', title: 'Target Java 17 language features',
    details: 'Use records, sealed classes, and switch expressions in examples.',
    categoryId: 'dsa', source: SOURCES.USER, enabled: true, pinned: true,
    confidence: 1, risk: RISK.LOW, createdAt: ago(40), updatedAt: ago(9),
    lastUsedAt: ago(1), useCount: 19, usageReason: 'Data structures question in Java.',
    tags: ['java', 'dsa', 'modern'], version: 2,
    history: [{ version: 1, at: ago(40), title: 'Java 17 features', details: 'Use records and sealed classes.' }],
  },
  {
    id: 'm7', title: 'Compare solutions by time and space',
    details: 'Always state Big-O for both approaches before recommending one.',
    categoryId: 'dsa', source: SOURCES.USER, enabled: true, pinned: false,
    confidence: 1, risk: RISK.LOW, createdAt: ago(38), updatedAt: ago(38),
    lastUsedAt: ago(2), useCount: 22, usageReason: 'Asked for the best approach to a sorting problem.',
    tags: ['complexity', 'dsa'], version: 1, history: [],
  },
  {
    id: 'm8', title: 'Spring Boot layered package structure',
    details: 'controller, service, repository, dto — no cross-layer calls.',
    categoryId: 'backend', source: SOURCES.USER, enabled: true, pinned: true,
    confidence: 1, risk: RISK.LOW, createdAt: ago(29), updatedAt: ago(6),
    lastUsedAt: ago(0), useCount: 17, usageReason: 'Asked to scaffold a REST controller.',
    tags: ['spring', 'architecture'], version: 4,
    history: [
      { version: 1, at: ago(29), title: 'Use Spring Boot', details: 'Prefer Spring Boot for APIs.' },
      { version: 2, at: ago(21), title: 'Layered packages', details: 'controller / service / repository.' },
      { version: 3, at: ago(12), title: 'Strict layering', details: 'No cross-layer calls.' },
    ],
  },
  {
    id: 'm9', title: 'Never store credentials in memory',
    details: 'API keys, passwords and tokens must never be saved as memories.',
    categoryId: 'work', source: SOURCES.USER, enabled: true, pinned: true,
    confidence: 1, risk: RISK.HIGH, createdAt: ago(120), updatedAt: ago(5),
    lastUsedAt: ago(4), useCount: 8, usageReason: 'Blocked a secret from being stored.',
    tags: ['security', 'privacy'], version: 2,
    history: [{ version: 1, at: ago(120), title: 'No secrets', details: 'Do not save passwords.' }],
  },
  {
    id: 'm10', title: 'Short paragraphs, no heavy headings',
    details: 'Keep answers compact and skimmable with minimal markdown.',
    categoryId: 'style', source: SOURCES.USER, enabled: true, pinned: false,
    confidence: 1, risk: RISK.LOW, createdAt: ago(110), updatedAt: ago(110),
    lastUsedAt: ago(7), useCount: 41, usageReason: 'Default tone for every reply.',
    tags: ['tone', 'formatting'], version: 1, history: [],
  },
  {
    id: 'm11', title: 'Ask before changing my stack',
    details: 'Confirm any framework, database or tooling change first.',
    categoryId: 'work', source: SOURCES.USER, enabled: true, pinned: false,
    confidence: 1, risk: RISK.MEDIUM, createdAt: ago(75), updatedAt: ago(15),
    lastUsedAt: ago(11), useCount: 5, usageReason: 'Proposed a library swap without asking.',
    tags: ['workflow', 'safety'], version: 2,
    history: [{ version: 1, at: ago(75), title: 'Ask about stack changes', details: 'Confirm before switching tools.' }],
  },
  {
    id: 'm12', title: 'Review before saving anything sensitive',
    details: 'Personal details about other people require explicit approval.',
    categoryId: 'work', source: SOURCES.AI, enabled: true, pinned: false,
    confidence: 0.71, risk: RISK.HIGH, createdAt: ago(52), updatedAt: ago(52),
    lastUsedAt: ago(26), useCount: 2, usageReason: 'Detected a colleague name in a note.',
    tags: ['privacy', 'review'], version: 1, history: [],
  },
  {
    id: 'm13', title: 'Explain concepts from the basics',
    details: 'Start with fundamentals rather than jumping to advanced detail.',
    categoryId: 'learning', source: SOURCES.AI, enabled: true, pinned: false,
    confidence: 0.55, risk: RISK.LOW, createdAt: ago(25), updatedAt: ago(25),
    lastUsedAt: ago(8), useCount: 4, usageReason: 'Near-duplicate of an existing memory.',
    tags: ['teaching', 'basics'], version: 1, history: [],
  },
  {
    id: 'm14', title: 'Projects: DSA Prep 2026',
    details: 'Target the February 2026 placement drive. Focus on arrays, trees and graphs.',
    categoryId: 'dsa', source: SOURCES.IMPORT, enabled: true, pinned: false,
    confidence: 0.95, risk: RISK.LOW, createdAt: ago(42), updatedAt: ago(42),
    lastUsedAt: ago(5), useCount: 9, usageReason: 'Goal memory attached to the DSA folder.',
    tags: ['goal', 'placement'], version: 1, history: [],
  },
]

export const seedSuggestions = [
  {
    id: 's1', title: 'Show a complete code dry run',
    details: 'Trace the value of every variable through the whole method.',
    categoryId: 'programming', source: SOURCES.AI,
    reason: 'You asked for dry runs in 6 of the last 12 coding chats.',
    confidence: 0.94, risk: RISK.LOW, createdAt: ago(2), targetMemoryId: 'm4',
    signals: ['repeated request', 'topic match'],
  },
  {
    id: 's2', title: 'Prefer practical examples',
    details: 'Use examples from real projects instead of abstract snippets.',
    categoryId: 'work', source: SOURCES.AI,
    reason: 'You often ask how a concept maps to production code.',
    confidence: 0.81, risk: RISK.LOW, createdAt: ago(3), targetMemoryId: 'm5',
    signals: ['topic match', 'positive feedback'],
  },
  {
    id: 's3', title: 'Mention interview complexity in every answer',
    details: 'Always call out time and space complexity for algorithm answers.',
    categoryId: 'dsa', source: SOURCES.AI,
    reason: 'Related to "Compare solutions by time and space".',
    confidence: 0.88, risk: RISK.LOW, createdAt: ago(5), targetMemoryId: 'm7',
    signals: ['topic match', 'duplicate candidate'],
  },
  {
    id: 's4', title: 'Remember my internship stipend is 45,000 INR',
    details: 'A personal number that may help with offer comparisons.',
    categoryId: 'work', source: SOURCES.AI,
    reason: 'Extracted from a previous message about compensation.',
    confidence: 0.42, risk: RISK.HIGH, createdAt: ago(6), targetMemoryId: null,
    signals: ['extracted value', 'personal data'],
  },
  {
    id: 's5', title: 'Use Kotlin for Android questions',
    details: 'Switch Android examples to Kotlin.',
    categoryId: 'programming', source: SOURCES.AI,
    reason: 'Two Android questions were answered in Java and asked to be changed.',
    confidence: 0.67, risk: RISK.LOW, createdAt: ago(8), targetMemoryId: null,
    signals: ['correction', 'topic match'],
  },
  {
    id: 's6', title: 'Always answer in bullet points',
    details: 'Structure every answer as a short bulleted list.',
    categoryId: 'style', source: SOURCES.AI,
    reason: 'You reformatted 4 answers into bullets by hand.',
    confidence: 0.73, risk: RISK.LOW, createdAt: ago(11), targetMemoryId: null,
    signals: ['manual reformat', 'repeated request'],
  },
]

export const seedActivity = [
  { id: 'a1', memoryId: 'm3', at: ago(0), kind: 'used', reason: 'User asked to debug a loop.', surface: 'ChatGPT' },
  { id: 'a2', memoryId: 'm8', at: ago(0), kind: 'used', reason: 'Asked to scaffold a REST controller.', surface: 'ChatGPT' },
  { id: 'a3', memoryId: 'm1', at: ago(1), kind: 'used', reason: 'Matched a request to explain a new concept.', surface: 'Claude' },
  { id: 'a4', memoryId: 'm6', at: ago(1), kind: 'used', reason: 'Data structures question in Java.', surface: 'ChatGPT' },
  { id: 'a5', memoryId: 'm2', at: ago(2), kind: 'used', reason: 'Coding question with no language specified.', surface: 'Gemini' },
  { id: 'a6', memoryId: 'm7', at: ago(2), kind: 'used', reason: 'Asked for the best approach to a sorting problem.', surface: 'ChatGPT' },
  { id: 'a7', memoryId: 'm4', at: ago(3), kind: 'used', reason: 'Trace request for a Java method.', surface: 'Claude' },
  { id: 'a8', memoryId: 'm8', at: ago(6), kind: 'edited', reason: 'Tightened the layering rule.', surface: 'Memory Layer' },
  { id: 'a9', memoryId: 'm10', at: ago(7), kind: 'used', reason: 'Default tone for every reply.', surface: 'ChatGPT' },
  { id: 'a10', memoryId: 'm12', at: ago(9), kind: 'blocked', reason: 'Personal data held for review.', surface: 'Memory Layer' },
  { id: 'a11', memoryId: 'm6', at: ago(9), kind: 'edited', reason: 'Added sealed classes.', surface: 'Memory Layer' },
  { id: 'a12', memoryId: 'm9', at: ago(10), kind: 'enabled', reason: 'Pinned as a safety rule.', surface: 'Memory Layer' },
  { id: 'a13', memoryId: 'm11', at: ago(15), kind: 'edited', reason: 'Clarified the scope of the rule.', surface: 'Memory Layer' },
  { id: 'a14', memoryId: 'm5', at: ago(16), kind: 'disabled', reason: 'Paused by the user.', surface: 'Memory Layer' },
]

export const seedConflicts = [
  {
    id: 'c1', memoryIds: ['m1', 'm13'], createdAt: ago(4), severity: 'medium',
    summary: 'Two memories describe the same teaching preference with different wording.',
  },
]

export const seedSync = {
  cloudEnabled: false,
  lastSyncAt: null,
  errors: [
    { id: 'e1', at: ago(4), message: 'Cloud sync disabled — local-only mode is active.' },
    { id: 'e2', at: ago(26), message: 'Last export contained 3 memories with expired review dates.' },
  ],
}

export const defaultSettings = {
  personalization: true,
  discovery: true,
  externalAI: false,
  autoSave: true,
  requireReview: true,
  expirationDays: 180,
  showConfidence: true,
  sites: { chatgpt: true, claude: false, gemini: false },
}

export const CATEGORY_COLORS = {
  purple: 'violet',
  blue: 'blue',
  orange: 'orange',
  green: 'green',
  pink: 'pink',
  cyan: 'cyan',
}

export function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function duplicateGroups(memories) {
  const groups = []
  const seen = new Map()
  memories.forEach(memory => {
    const key = memory.title.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, [])
      groups.push(seen.get(key))
    }
    seen.get(key).push(memory)
  })
  return groups.filter(group => group.length > 1)
}

export function memoryHealth(memories, suggestions) {
  const duplicates = duplicateGroups(memories)
  const stale = memories.filter(m => Date.now() - new Date(m.updatedAt).getTime() > 120 * 86400000)
  const risky = memories.filter(m => m.risk === RISK.HIGH)
  const pending = suggestions.length
  const score = Math.max(
    0,
    Math.round(100 - duplicates.length * 12 - stale.length * 4 - risky.length * 6 - pending * 3)
  )
  return { score, duplicates, stale, risky, pending }
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (typeof fallback !== 'object' || fallback === null) return parsed
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : fallback
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export const STORE = {
  memories: 'ml-memories',
  folders: 'ml-folders',
  suggestions: 'ml-suggestions',
  activity: 'ml-activity',
  conflicts: 'ml-conflicts',
  settings: 'ml-settings',
  sync: 'ml-sync',
  theme: 'ml-theme',
  plan: 'ml-plan',
  user: 'ml-user',
  customGradient: 'ml-custom-gradient',
  savedGradients: 'ml-saved-gradients',
  sidebarCollapsed: 'ml-sidebar-collapsed',
}
