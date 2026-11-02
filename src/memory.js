
export const MEMORY_CATEGORIES = {
  PREFERENCE: "PREFERENCE",
  LEARNING_STYLE: "LEARNING_STYLE",
  PROJECT: "PROJECT",
  GOAL: "GOAL",
  OTHER: "OTHER",
};

export const MEMORY_SOURCES = {
  USER_ADDED: "USER_ADDED",
  AI_INFERRED: "AI_INFERRED",
};

export const MEMORY_STATUSES = {
  ACTIVE: "ACTIVE",
  PENDING_REVIEW: "PENDING_REVIEW",
  REJECTED: "REJECTED",
};

export const MEMORY_RISK_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

export const SYNC_STATUSES = {
  LOCAL_ONLY: "LOCAL_ONLY",
  PENDING: "PENDING",
  SYNCED: "SYNCED",
  ERROR: "ERROR",
};

export function createMemory({
  content,
  category = MEMORY_CATEGORIES.OTHER,
  source = MEMORY_SOURCES.USER_ADDED,
  confidence = null,
  riskLevel = MEMORY_RISK_LEVELS.LOW,
  status,
}) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Memory content cannot be empty.");
  }

  const isUserAdded = source === MEMORY_SOURCES.USER_ADDED;

  // Manual memories are active immediately.
  // AI-inferred memories require review by default.
  const initialStatus =
    status ??
    (isUserAdded
      ? MEMORY_STATUSES.ACTIVE
      : MEMORY_STATUSES.PENDING_REVIEW);

  return {
    id: crypto.randomUUID(),

    content: content.trim(),
    category,
    source,
    confidence,
    riskLevel,
    status: initialStatus,

    version: 1,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    syncStatus: SYNC_STATUSES.PENDING,
  };
}
