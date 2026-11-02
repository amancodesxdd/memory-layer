-- V2__add_users_table_and_memory_ownership.sql
-- Adds users table and user_id foreign key to memories.
-- Existing memories without a user are assigned NULL user_id (orphaned, inaccessible until migrated).

CREATE TABLE IF NOT EXISTS users (
    db_id       BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(255) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add user_id column to memories (nullable to preserve existing records)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Foreign key constraint
ALTER TABLE memories
    ADD CONSTRAINT fk_memories_user
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Index for user-scoped queries (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
