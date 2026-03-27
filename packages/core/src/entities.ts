export type SourceType = "sql_snapshot" | "file" | "api";
export type DataSourceType = "postgres" | "mysql" | "sqlserver" | "http" | "object_storage";
export type AccessMode = "read_only" | "read_write";
export type DataSourceStatus = "pending" | "validated" | "failed" | "disabled";
export type ExtractionMode = "full_snapshot" | "incremental";
export type ExtractionStatus = "pending" | "running" | "completed" | "failed";
export type DatasetStatus = "draft" | "snapshot_created" | "finalized" | "rejected";
export type TrainingStatus = "pending" | "running" | "completed" | "failed";
export type ModelStatus = "candidate" | "production" | "rejected" | "archived";

export interface ConnectionConfig {
  dsn?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  options?: Record<string, unknown>;
}

export interface QueryDefinition {
  kind: "view" | "predefined" | "stored_query";
  identifier: string;
  parameters?: Record<string, string | number | boolean>;
  cursorField?: string;
}

export interface SchemaField {
  name: string;
  dataType: string;
  nullable: boolean;
}

export interface SchemaDefinition {
  fields: SchemaField[];
  primaryKey?: string[];
  labelField?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  connectionConfig: string;
  accessMode: AccessMode;
  allowedSchemas: string[];
  allowedTables: string[];
  allowedViews: string[];
  schemaWhitelist: string[];
  status: DataSourceStatus;
  createdAt: string;
  validatedAt?: string;
  lastValidationError?: string;
}

export interface ExtractionJob {
  id: string;
  dataSourceId: string;
  queryDefinition: QueryDefinition;
  extractionMode: ExtractionMode;
  status: ExtractionStatus;
  startedAt?: string;
  finishedAt?: string;
  outputUri?: string;
  rowCount: number;
  checksum?: string;
  checkpoint?: string;
  chunkCount: number;
  errorMessage?: string;
}

export interface Dataset {
  id: string;
  datasetName: string;
  version: string;
  sourceType: SourceType;
  dataSourceId?: string;
  extractionJobId?: string;
  schemaDefinition: SchemaDefinition;
  rowCount: number;
  checksum: string;
  storageUri: string;
  status: DatasetStatus;
  createdAt: string;
  finalizedAt?: string;
}

export interface TrainingJob {
  id: string;
  datasetId: string;
  datasetVersion: string;
  modelName: string;
  labelField: string;
  status: TrainingStatus;
  startedAt?: string;
  finishedAt?: string;
  candidateModelId?: string;
  errorMessage?: string;
}

export interface EvaluationReport {
  id: string;
  modelId: string;
  baselineModelId?: string;
  datasetId: string;
  datasetVersion: string;
  metrics: Record<string, number>;
  candidateWins: boolean;
  createdAt: string;
  artifactUri?: string;
}

export interface ModelArtifact {
  id: string;
  modelName: string;
  version: string;
  datasetId: string;
  datasetVersion: string;
  labelField: string;
  status: ModelStatus;
  artifactUri: string;
  checksum: string;
  metrics: Record<string, number>;
  createdAt: string;
  promotedAt?: string;
}

export interface PredictionRecord {
  id: string;
  modelId: string;
  tenantId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackRecord {
  id: string;
  predictionId: string;
  tenantId: string;
  outcome: Record<string, unknown>;
  createdAt: string;
}

export interface DriftReport {
  id: string;
  modelId: string;
  datasetId: string;
  score: number;
  driftDetected: boolean;
  featureDiffs: Record<string, number>;
  createdAt: string;
}

export interface RetrainingDecision {
  id: string;
  modelName: string;
  reasonCodes: string[];
  approved: boolean;
  createdAt: string;
  datasetId?: string;
  datasetVersion?: string;
  candidateModelId?: string;
}

export interface LineageNode {
  id: string;
  type: "datasource" | "extraction" | "dataset" | "model" | "prediction" | "feedback" | "report";
}

export interface LineageEdge {
  from: LineageNode;
  to: LineageNode;
  relation: string;
  createdAt: string;
}
