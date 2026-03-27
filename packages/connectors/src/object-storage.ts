import type { QueryDefinition } from "@pulse/core";

import type { ConnectorContext, ConnectorValidationResult, DataSourceConnector, ExtractionChunk, SchemaInspection } from "./types.js";

export class ObjectStorageConnector implements DataSourceConnector {
  readonly type = "object_storage" as const;

  async validateConnection(_context: ConnectorContext): Promise<ConnectorValidationResult> {
    return { valid: true, warnings: [] };
  }

  async inspectSchema(_context: ConnectorContext): Promise<SchemaInspection> {
    return { schemas: [], tables: [], views: [] };
  }

  async estimateSize(_context: ConnectorContext, _queryDefinition: QueryDefinition): Promise<number> {
    return 0;
  }

  async *streamData(
    _context: ConnectorContext,
    _queryDefinition: QueryDefinition,
    _checkpoint?: string,
    _chunkSize?: number
  ): AsyncGenerator<ExtractionChunk> {
    yield { rows: [] };
  }
}

