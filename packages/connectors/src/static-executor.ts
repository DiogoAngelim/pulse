import type { ConnectionConfig, QueryDefinition, SchemaDefinition } from "@pulse/core";

import type { ExtractionChunk, SchemaInspection } from "./types.js";
import type { SqlExecutor } from "./sql-common.js";

export interface StaticDataset {
  identifier: string;
  rows: Array<Record<string, unknown>>;
  schemaDefinition?: SchemaDefinition;
}

export class StaticSqlExecutor implements SqlExecutor {
  private readonly datasets = new Map<string, StaticDataset>();
  private failurePlan = new Map<string, number>();

  constructor(datasets: StaticDataset[] = []) {
    for (const dataset of datasets) {
      this.datasets.set(dataset.identifier, dataset);
    }
  }

  setFailure(identifier: string, chunkNumber: number): void {
    this.failurePlan.set(identifier, chunkNumber);
  }

  async validateConnection(_connection: ConnectionConfig): Promise<void> {}

  async inspectSchema(_connection: ConnectionConfig): Promise<SchemaInspection> {
    return {
      schemas: ["public"],
      tables: [...this.datasets.keys()],
      views: [...this.datasets.keys()]
    };
  }

  async estimateSize(_connection: ConnectionConfig, queryDefinition: QueryDefinition): Promise<number> {
    return this.datasets.get(queryDefinition.identifier)?.rows.length ?? 0;
  }

  async *streamRows(
    _connection: ConnectionConfig,
    queryDefinition: QueryDefinition,
    checkpoint?: string,
    chunkSize = 500
  ): AsyncGenerator<ExtractionChunk> {
    const dataset = this.datasets.get(queryDefinition.identifier);
    if (!dataset) {
      throw new Error(`static dataset ${queryDefinition.identifier} not found`);
    }

    const startIndex = checkpoint ? Number(checkpoint) : 0;
    let chunkIndex = 0;

    for (let index = startIndex; index < dataset.rows.length; index += chunkSize) {
      chunkIndex += 1;
      const failureChunk = this.failurePlan.get(queryDefinition.identifier);
      if (failureChunk && chunkIndex === failureChunk) {
        this.failurePlan.delete(queryDefinition.identifier);
        throw new Error(`planned extraction failure for ${queryDefinition.identifier}`);
      }

      const rows = dataset.rows.slice(index, index + chunkSize);
      yield {
        rows,
        cursor: String(index + rows.length),
        schemaDefinition: dataset.schemaDefinition
      };
    }
  }
}
