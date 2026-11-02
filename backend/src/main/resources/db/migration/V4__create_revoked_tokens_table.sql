-- Create revoked tokens table for JWT access token blacklist
CREATE TABLE IF NOT EXISTS revoked_tokens (
    db_id BIGSERIAL PRIMARY KEY,
    jti VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens(jti);
