CREATE TABLE ad_events (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES player_sessions(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('interstitial', 'rewarded')),
  placement VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'shown', 'completed', 'skipped', 'failed')),
  revenue_micro BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_events_session_id ON ad_events(session_id);
CREATE INDEX idx_ad_events_project_id ON ad_events(project_id);
CREATE INDEX idx_ad_events_type ON ad_events(type);
CREATE INDEX idx_ad_events_created_at ON ad_events(created_at);
