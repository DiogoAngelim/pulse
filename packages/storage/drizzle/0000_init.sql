CREATE TABLE IF NOT EXISTS pulse_datasources (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  connection_config TEXT NOT NULL,
  access_mode TEXT NOT NULL,
  allowed_schemas JSONB NOT NULL,
  allowed_tables JSONB NOT NULL,
  allowed_views JSONB NOT NULL,
  schema_whitelist JSONB NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  validated_at TIMESTAMPTZ,
  last_validation_error TEXT
);

CREATE TABLE IF NOT EXISTS pulse_extraction_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  datasource_id TEXT NOT NULL,
  query_definition JSONB NOT NULL,
  extraction_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  output_uri TEXT,
  row_count BIGINT NOT NULL DEFAULT 0,
  checksum TEXT,
  checkpoint TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS pulse_datasets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  dataset_name TEXT NOT NULL,
  version TEXT NOT NULL,
  source_type TEXT NOT NULL,
  datasource_id TEXT,
  extraction_job_id TEXT,
  schema_definition JSONB NOT NULL,
  row_count BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  finalized_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pulse_training_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  dataset_version TEXT NOT NULL,
  model_name TEXT NOT NULL,
  label_field TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  candidate_model_id TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS pulse_models (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  dataset_version TEXT NOT NULL,
  label_field TEXT NOT NULL,
  status TEXT NOT NULL,
  artifact_uri TEXT NOT NULL,
  checksum TEXT NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  promoted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pulse_evaluations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  baseline_model_id TEXT,
  dataset_id TEXT NOT NULL,
  dataset_version TEXT NOT NULL,
  metrics JSONB NOT NULL,
  candidate_wins BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  artifact_uri TEXT
);

CREATE TABLE IF NOT EXISTS pulse_predictions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pulse_feedback (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  prediction_id TEXT NOT NULL,
  outcome JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pulse_drift_reports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  drift_detected BOOLEAN NOT NULL,
  feature_diffs JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pulse_retraining_decisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  reason_codes JSONB NOT NULL,
  approved BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  dataset_id TEXT,
  dataset_version TEXT,
  candidate_model_id TEXT
);

CREATE TABLE IF NOT EXISTS pulse_lineage (
  from_id TEXT NOT NULL,
  from_type TEXT NOT NULL,
  to_id TEXT NOT NULL,
  to_type TEXT NOT NULL,
  relation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pulse_idempotency (
  key TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pulse_events (
  message_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  idempotency_key TEXT,
  correlation_id TEXT,
  causation_id TEXT,
  payload JSONB NOT NULL,
  metadata JSONB NOT NULL
);
