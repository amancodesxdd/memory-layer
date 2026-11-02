-- V1__create_memories_table.sql
-- Creates the memories table mapping the frontend memory model to PostgreSQL.

CREATE TABLE IF NOT EXISTS memories (
    db_id         BIGSERIAL PRIMARY KEY,
    memory_id     VARCHAR(255) NOT NULL UNIQUE,
    title         VARCHAR(500) NOT NULL,
    details       TEXT,
    category_id   VARCHAR(100),
    source        VARCHAR(50) NOT NULL DEFAULT 'USER_ADDED',
    enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    pinned        BOOLEAN NOT NULL DEFAULT FALSE,
    confidence    DOUBLE PRECISION,
    risk_level    VARCHAR(20) NOT NULL DEFAULT 'LOW',
    status        VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    version       INTEGER NOT NULL DEFAULT 1,
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    last_used_at  TIMESTAMP WITHOUT TIME ZONE,
    use_count     INTEGER NOT NULL DEFAULT 0,
    usage_reason  TEXT,
    sync_status   VARCHAR(20) NOT NULL DEFAULT 'LOCAL_ONLY'
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_memories_memory_id ON memories(memory_id);
CREATE INDEX IF NOT EXISTS idx_memories_source ON memories(source);
CREATE INDEX IF NOT EXISTS idx_memories_risk_level ON memories(risk_level);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_enabled ON memories(enabled);
CREATE INDEX IF NOT EXISTS idx_memories_pinned ON memories(pinned);
CREATE INDEX IF NOT EXISTS idx_memories_category_id ON memories(category_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memories_updated_at ON memories(updated_at);
