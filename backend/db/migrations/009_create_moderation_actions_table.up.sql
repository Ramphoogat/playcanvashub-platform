CREATE TABLE moderation_actions (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_id BIGINT NULL REFERENCES reports(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_admin_id ON moderation_actions(admin_id);
CREATE INDEX idx_moderation_actions_project_id ON moderation_actions(project_id);
CREATE INDEX idx_moderation_actions_report_id ON moderation_actions(report_id);
