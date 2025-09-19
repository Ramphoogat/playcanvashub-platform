CREATE TABLE player_sessions (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP NULL,
  duration_seconds INTEGER NULL
);

CREATE INDEX idx_player_sessions_project_id ON player_sessions(project_id);
CREATE INDEX idx_player_sessions_user_id ON player_sessions(user_id);
CREATE INDEX idx_player_sessions_started_at ON player_sessions(started_at);
