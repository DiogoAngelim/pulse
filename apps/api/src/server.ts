import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

import {
  createEnvelope,
  type CreateDatasetSnapshotPayload,
  type ExtractSqlPayload,
  type ProtocolEnvelope,
  type RegisterDataSourcePayload
} from "@pulse/contracts";
import type { PulseRuntime } from "@pulse/runtime";

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function json(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify(payload, null, 2));
}

function envelopeFromBody(
  kind: "query" | "mutation",
  name: string,
  tenantId: string,
  body: unknown
): ProtocolEnvelope {
  if (body && typeof body === "object" && "protocol" in body) {
    return body as ProtocolEnvelope;
  }

  const record = (body ?? {}) as Record<string, unknown>;
  return createEnvelope(kind, name, tenantId, (record.payload ?? record) as Record<string, unknown>, {
    idempotencyKey: record.idempotencyKey as string | undefined,
    correlationId: record.correlationId as string | undefined,
    causationId: record.causationId as string | undefined,
    metadata: (record.metadata ?? {}) as Record<string, unknown>
  });
}

export function createPulseApiServer(runtime: PulseRuntime): Server {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const tenantId = request.headers["x-tenant-id"]?.toString() ?? "default";

      if (request.method === "POST" && url.pathname === "/datasources") {
        const body = await readBody(request);
        json(
          response,
          200,
          await runtime.registerDataSource(
            envelopeFromBody("mutation", "pulse.datasource.register.v1", tenantId, body) as ProtocolEnvelope<RegisterDataSourcePayload>
          )
        );
        return;
      }

      if (request.method === "GET" && /^\/datasources\/[^/]+$/.test(url.pathname)) {
        const id = url.pathname.split("/")[2];
        json(response, 200, await runtime.getDataSource(createEnvelope("query", "pulse.datasource.get.v1", tenantId, { id })));
        return;
      }

      if (request.method === "POST" && /^\/datasources\/[^/]+\/validate$/.test(url.pathname)) {
        const id = url.pathname.split("/")[2];
        json(response, 200, await runtime.validateDataSource(createEnvelope("mutation", "pulse.datasource.validate.v1", tenantId, { dataSourceId: id })));
        return;
      }

      if (request.method === "POST" && url.pathname === "/extractions") {
        const body = await readBody(request);
        json(
          response,
          200,
          await runtime.extractSqlSnapshot(
            envelopeFromBody("mutation", "pulse.source.sql.extract.v1", tenantId, body) as ProtocolEnvelope<ExtractSqlPayload>
          )
        );
        return;
      }

      if (request.method === "GET" && /^\/extractions\/[^/]+$/.test(url.pathname)) {
        const id = url.pathname.split("/")[2];
        json(response, 200, await runtime.getExtractionJob(createEnvelope("query", "pulse.extraction-job.get.v1", tenantId, { id })));
        return;
      }

      if (request.method === "POST" && url.pathname === "/datasets/snapshot") {
        const body = await readBody(request);
        json(
          response,
          200,
          await runtime.createDatasetSnapshot(
            envelopeFromBody("mutation", "pulse.dataset.snapshot.create.v1", tenantId, body) as ProtocolEnvelope<CreateDatasetSnapshotPayload>
          )
        );
        return;
      }

      if (request.method === "POST" && url.pathname.startsWith("/mutations/")) {
        const name = url.pathname.replace("/mutations/", "");
        const body = await readBody(request);
        json(response, 200, await runtime.dispatchMutation(envelopeFromBody("mutation", name, tenantId, body)));
        return;
      }

      if (request.method === "POST" && url.pathname.startsWith("/queries/")) {
        const name = url.pathname.replace("/queries/", "");
        const body = await readBody(request);
        json(response, 200, await runtime.dispatchQuery(envelopeFromBody("query", name, tenantId, body)));
        return;
      }

      json(response, 404, { error: "not_found" });
    } catch (error) {
      json(response, 500, { error: (error as Error).message });
    }
  });
}
