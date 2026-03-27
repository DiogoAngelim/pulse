import type {
  ConnectionConfig,
  DataSource,
  DataSourceType,
  QueryDefinition,
  SchemaDefinition
} from "@pulse/core";

export interface ConnectorValidationResult {
  valid: boolean;
  warnings: string[];
}

export interface SchemaInspection {
  schemas: string[];
  tables: string[];
  views: string[];
}

export interface ExtractionChunk {
  rows: Array<Record<string, unknown>>;
  cursor?: string;
  schemaDefinition?: SchemaDefinition;
}

export interface SnapshotExtractionResult {
  rowCount: number;
  checksum: string;
  schemaDefinition: SchemaDefinition;
}

export interface ConnectorContext {
  dataSource: DataSource;
  connectionConfig: ConnectionConfig;
}

export interface DataSourceConnector {
  readonly type: DataSourceType;
  validateConnection(context: ConnectorContext): Promise<ConnectorValidationResult>;
  inspectSchema(context: ConnectorContext): Promise<SchemaInspection>;
  estimateSize(context: ConnectorContext, queryDefinition: QueryDefinition): Promise<number>;
  streamData(context: ConnectorContext, queryDefinition: QueryDefinition, checkpoint?: string, chunkSize?: number): AsyncGenerator<ExtractionChunk>;
  extractSnapshot?(context: ConnectorContext, queryDefinition: QueryDefinition, checkpoint?: string, chunkSize?: number): Promise<SnapshotExtractionResult>;
}

