import type {
  DataSource,
  Dataset,
  DriftReport,
  EvaluationReport,
  ExtractionJob,
  FeedbackRecord,
  ModelArtifact,
  PredictionRecord,
  QueryDefinition,
  RetrainingDecision,
  SchemaDefinition
} from "@pulse/core";

export const mutationNames = [
  "pulse.datasource.register.v1",
  "pulse.datasource.validate.v1",
  "pulse.source.sql.extract.v1",
  "pulse.dataset.snapshot.create.v1",
  "pulse.training.start.v1",
  "pulse.model.evaluate.v1",
  "pulse.model.promote.v1",
  "pulse.prediction.run.v1",
  "pulse.feedback.record.v1",
  "pulse.drift.detect.v1",
  "pulse.retraining.check.v1",
  "pulse.retraining.run.v1"
] as const;

export const queryNames = [
  "pulse.datasource.get.v1",
  "pulse.datasource.list.v1",
  "pulse.extraction-job.get.v1",
  "pulse.lineage.trace.v1"
] as const;

export const eventNames = [
  "pulse.datasource.registered.v1",
  "pulse.datasource.validated.v1",
  "pulse.extraction.started.v1",
  "pulse.extraction.completed.v1",
  "pulse.extraction.failed.v1",
  "pulse.dataset.snapshot.created.v1",
  "pulse.training.completed.v1",
  "pulse.model.promoted.v1",
  "pulse.feedback.recorded.v1",
  "pulse.drift.detected.v1",
  "pulse.retraining.completed.v1"
] as const;

export interface RegisterDataSourcePayload {
  name: string;
  type: DataSource["type"];
  connectionConfig: Record<string, unknown>;
  accessMode?: DataSource["accessMode"];
  allowedSchemas: string[];
  allowedTables: string[];
  allowedViews: string[];
  schemaWhitelist?: string[];
}

export interface ValidateDataSourcePayload {
  dataSourceId: string;
}

export interface ExtractSqlPayload {
  dataSourceId: string;
  queryDefinition: QueryDefinition;
  extractionMode: ExtractionJob["extractionMode"];
  chunkSize?: number;
  datasetName?: string;
  resumeFromJobId?: string;
}

export interface CreateDatasetSnapshotPayload {
  extractionJobId: string;
  datasetName: string;
  schemaDefinition?: SchemaDefinition;
}

export interface StartTrainingPayload {
  datasetId: string;
  datasetVersion: string;
  modelName: string;
  labelField: string;
}

export interface EvaluateModelPayload {
  modelId: string;
}

export interface PromoteModelPayload {
  modelId: string;
  minimumAccuracy?: number;
}

export interface RunPredictionPayload {
  modelName: string;
  input: Record<string, unknown>;
}

export interface RecordFeedbackPayload {
  predictionId: string;
  outcome: Record<string, unknown>;
}

export interface DetectDriftPayload {
  modelId: string;
  datasetId: string;
}

export interface CheckRetrainingPayload {
  modelName: string;
  scheduled?: boolean;
}

export interface RunRetrainingPayload {
  modelName: string;
  queryDefinition?: QueryDefinition;
}

export interface GetDataSourcePayload {
  id: string;
}

export interface ListDataSourcesPayload {
  status?: DataSource["status"];
}

export interface GetExtractionJobPayload {
  id: string;
}

export interface TraceLineagePayload {
  entityId: string;
  entityType: "dataset" | "model" | "prediction" | "feedback" | "extraction";
}

export interface TraceLineageResult {
  nodes: Array<{ id: string; type: string }>;
  edges: Array<{ from: string; to: string; relation: string }>;
}

export type PulseQueryResponse =
  | DataSource
  | DataSource[]
  | ExtractionJob
  | TraceLineageResult;

export type PulseMutationResponse =
  | DataSource
  | ExtractionJob
  | Dataset
  | DriftReport
  | ModelArtifact
  | EvaluationReport
  | PredictionRecord
  | FeedbackRecord
  | RetrainingDecision;
