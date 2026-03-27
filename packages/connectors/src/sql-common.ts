import { hashValue } from "@pulse/shared";
import type { ConnectionConfig, QueryDefinition, SchemaDefinition } from "@pulse/core";

import type { ConnectorContext, ConnectorValidationResult, DataSourceConnector, ExtractionChunk, SchemaInspection, SnapshotExtractionResult } from "./types.js";

export interface SqlExecutor {
  validateConnection(connection: ConnectionConfig): Promise<void>;
  inspectSchema(connection: ConnectionConfig): Promise<SchemaInspection>;
  estimateSize(connection: ConnectionConfig, queryDefinition: QueryDefinition): Promise<number>;
  streamRows(connection: ConnectionConfig, queryDefinition: QueryDefinition, checkpoint?: string, chunkSize?: number): AsyncGenerator<ExtractionChunk>;
}

function deriveSchema(rows: Array<Record<string, unknown>>): SchemaDefinition {
  const firstRow = rows[0] ?? {};
  return {
    fields: Object.keys(firstRow).map((name) => ({
      name,
      dataType: typeof firstRow[name],
      nullable: true
    }))
  };
}

function assertAllowedSource(context: ConnectorContext, queryDefinition: QueryDefinition): void {
  const identifier = queryDefinition.identifier;
  const allowedViews = new Set(context.dataSource.allowedViews);
  const allowedTables = new Set(context.dataSource.allowedTables);
  const allowedSchemas = new Set(context.dataSource.allowedSchemas);

  const [schemaPart] = identifier.split(".");
  const hasSchema = identifier.includes(".");

  if (queryDefinition.kind === "view" && !allowedViews.has(identifier)) {
    throw new Error(`view ${identifier} is not allowlisted`);
  }

  if (queryDefinition.kind !== "view" && allowedTables.size > 0 && !allowedTables.has(identifier)) {
    throw new Error(`source ${identifier} is not allowlisted`);
  }

  if (hasSchema && allowedSchemas.size > 0 && !allowedSchemas.has(schemaPart)) {
    throw new Error(`schema ${schemaPart} is not allowlisted`);
  }
}

export class GenericSqlConnector implements DataSourceConnector {
  readonly type;
  private readonly executor: SqlExecutor;

  constructor(type: DataSourceConnector["type"], executor: SqlExecutor) {
    this.type = type;
    this.executor = executor;
  }

  async validateConnection(context: ConnectorContext): Promise<ConnectorValidationResult> {
    if (context.dataSource.accessMode !== "read_only") {
      return {
        valid: false,
        warnings: ["data source access mode must be read_only by default"]
      };
    }

    await this.executor.validateConnection(context.connectionConfig);
    return {
      valid: true,
      warnings: []
    };
  }

  inspectSchema(context: ConnectorContext): Promise<SchemaInspection> {
    return this.executor.inspectSchema(context.connectionConfig);
  }

  estimateSize(context: ConnectorContext, queryDefinition: QueryDefinition): Promise<number> {
    assertAllowedSource(context, queryDefinition);
    return this.executor.estimateSize(context.connectionConfig, queryDefinition);
  }

  async *streamData(
    context: ConnectorContext,
    queryDefinition: QueryDefinition,
    checkpoint?: string,
    chunkSize = 500
  ): AsyncGenerator<ExtractionChunk> {
    assertAllowedSource(context, queryDefinition);

    for await (const chunk of this.executor.streamRows(context.connectionConfig, queryDefinition, checkpoint, chunkSize)) {
      yield {
        ...chunk,
        schemaDefinition: chunk.schemaDefinition ?? deriveSchema(chunk.rows)
      };
    }
  }

  async extractSnapshot(
    context: ConnectorContext,
    queryDefinition: QueryDefinition,
    checkpoint?: string,
    chunkSize = 500
  ): Promise<SnapshotExtractionResult> {
    const allRows: Array<Record<string, unknown>> = [];
    let schemaDefinition: SchemaDefinition = { fields: [] };

    for await (const chunk of this.streamData(context, queryDefinition, checkpoint, chunkSize)) {
      allRows.push(...chunk.rows);
      if (chunk.schemaDefinition) {
        schemaDefinition = chunk.schemaDefinition;
      }
    }

    return {
      rowCount: allRows.length,
      checksum: hashValue(allRows),
      schemaDefinition
    };
  }
}

