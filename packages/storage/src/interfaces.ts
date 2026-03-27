import type {
  DataSource,
  Dataset,
  DriftReport,
  EvaluationReport,
  ExtractionJob,
  FeedbackRecord,
  LineageEdge,
  ModelArtifact,
  PredictionRecord,
  RetrainingDecision,
  TrainingJob
} from "@pulse/core";
import type { ProtocolEnvelope } from "@pulse/contracts";

export interface PulseState {
  dataSources: Record<string, DataSource>;
  extractionJobs: Record<string, ExtractionJob>;
  datasets: Record<string, Dataset>;
  trainingJobs: Record<string, TrainingJob>;
  models: Record<string, ModelArtifact>;
  evaluations: Record<string, EvaluationReport>;
  predictions: Record<string, PredictionRecord>;
  feedback: Record<string, FeedbackRecord>;
  driftReports: Record<string, DriftReport>;
  retrainingDecisions: Record<string, RetrainingDecision>;
  events: ProtocolEnvelope[];
  lineage: LineageEdge[];
  idempotency: Record<string, unknown>;
}

export interface MetadataStore {
  load(): Promise<PulseState>;
  save(state: PulseState): Promise<void>;
}

export interface ObjectStore {
  writeJson(uri: string, data: unknown): Promise<void>;
  appendJsonLines(uri: string, rows: Array<Record<string, unknown>>): Promise<void>;
  readJsonLines(uri: string): Promise<Array<Record<string, unknown>>>;
  readJson<T>(uri: string): Promise<T>;
}

export function createEmptyState(): PulseState {
  return {
    dataSources: {},
    extractionJobs: {},
    datasets: {},
    trainingJobs: {},
    models: {},
    evaluations: {},
    predictions: {},
    feedback: {},
    driftReports: {},
    retrainingDecisions: {},
    events: [],
    lineage: [],
    idempotency: {}
  };
}
