CREATE TABLE versions (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  manifest_json JSONB NOT NULL DEFAULT '{}',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_versions_project_id ON versions(project_id);
CREATE INDEX idx_versions_status ON versions(status);

-- Add foreign key to projects table
ALTER TABLE projects ADD CONSTRAINT fk_projects_latest_version 
  FOREIGN KEY (latest_version_id) REFERENCES versions(id);
