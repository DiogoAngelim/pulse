# Pulse

Pulse is a standalone, protocol-first, serverless-first AI runtime for safe model training, promotion, inference, feedback, drift detection, and self-retraining. It follows explicit `Queries`, `Mutations`, and `Events` contracts in a Signal-style envelope while remaining fully decoupled from live client schemas.

This scaffold treats client databases as first-class sources and enforces a hard rule: training never runs on mutable live data. Every training job must use a versioned dataset snapshot materialized from a controlled extraction job.

## Repository Layout

```text
apps/
  api/       HTTP API exposing named protocol operations and convenience endpoints
  worker/    background orchestration for recovery and scheduled retraining checks
packages/
  contracts/ explicit versioned Pulse envelopes and operation payloads
  runtime/   orchestration engine and state transitions
  core/      domain entities, lineage, and policy logic
  storage/   metadata stores, object stores, encryption, and Drizzle SQL migration scaffold
  ml/        deterministic feature building, baseline training, evaluation, and drift logic
  connectors/pluggable datasource connectors and SQL executor abstractions
  sdk/       API client for Pulse operations
  shared/    ids, hashing, stable JSON, and time helpers
tests/       end-to-end runtime tests
```

## Core Guarantees

- Protocol-first contracts with explicit names like `pulse.source.sql.extract.v1`.
- Serverless-first runtime design with externalized metadata and object storage.
- Read-only datasource access by default, encrypted connection configs, and allowlisted SQL objects.
- Snapshot-before-training enforcement for reproducibility and auditability.
- Idempotent mutations, replay-safe events, explicit statuses, and lineage edges across the pipeline.
- Retraining decisions driven by drift, feedback, data freshness, and scheduled policies.

## Datasource Model

Pulse supports these datasource types:

- `postgres`
- `mysql`
- `sqlserver`
- `http` (reserved for future implementation)
- `object_storage`

Each connector implements:

- `inspectSchema()`
- `validateConnection()`
- `extractSnapshot()`
- `streamData()`
- `estimateSize()`

SQL extraction is intentionally constrained to allowlisted views, stored queries, or predefined query identifiers. Arbitrary SQL is not enabled by default.

## Snapshot Flow

1. `pulse.datasource.register.v1`
2. `pulse.datasource.validate.v1`
3. `pulse.source.sql.extract.v1`
4. Snapshot written incrementally to object storage
5. `pulse.dataset.snapshot.create.v1`
6. Dataset version locked and used by `pulse.training.start.v1`

Training accepts only `datasetId` and `datasetVersion`.

## API Surface

Convenience endpoints:

- `POST /datasources`
- `GET /datasources/:id`
- `POST /datasources/:id/validate`
- `POST /extractions`
- `GET /extractions/:id`
- `POST /datasets/snapshot`

Generic protocol endpoints:

- `POST /mutations/:name`
- `POST /queries/:name`

## Local Development

Pulse is dependency-light and uses Node's standard library in this scaffold. The default API bootstrap wires a static SQL executor with example allowlisted views (`ai_orders_v1`, `ai_customer_features_v1`, `ai_labels_v1`) so the end-to-end flow is runnable without external infrastructure.

```bash
npm install
npm run build
npm test
npm run start:api
npm run start:worker
```

Default local state is stored under `.pulse/`:

- `.pulse/metadata.json` for metadata and events
- `.pulse/objects/` for snapshots, models, and evaluation artifacts

## Protocol Examples

Register a datasource:

```json
{
  "protocol": "pulse",
  "kind": "mutation",
  "name": "pulse.datasource.register.v1",
  "version": "v1",
  "messageId": "msg_123",
  "timestamp": "2026-03-26T00:00:00.000Z",
  "idempotencyKey": "datasource-tenant-a-orders",
  "tenantId": "tenant_a",
  "payload": {
    "name": "Orders Warehouse",
    "type": "postgres",
    "connectionConfig": {
      "dsn": "postgres://readonly@warehouse/orders"
    },
    "allowedSchemas": ["public"],
    "allowedTables": [],
    "allowedViews": ["ai_orders_v1"]
  },
  "metadata": {}
}
```

Create a snapshot extraction:

```json
{
  "protocol": "pulse",
  "kind": "mutation",
  "name": "pulse.source.sql.extract.v1",
  "version": "v1",
  "messageId": "msg_124",
  "timestamp": "2026-03-26T00:00:01.000Z",
  "tenantId": "tenant_a",
  "payload": {
    "dataSourceId": "ds_...",
    "queryDefinition": {
      "kind": "view",
      "identifier": "ai_orders_v1",
      "cursorField": "updated_at"
    },
    "extractionMode": "full_snapshot",
    "chunkSize": 500
  },
  "metadata": {}
}
```

Trace lineage:

```json
{
  "protocol": "pulse",
  "kind": "query",
  "name": "pulse.lineage.trace.v1",
  "version": "v1",
  "messageId": "msg_125",
  "timestamp": "2026-03-26T00:00:02.000Z",
  "tenantId": "tenant_a",
  "payload": {
    "entityId": "pred_...",
    "entityType": "prediction"
  },
  "metadata": {}
}
```

## Implementation Notes

- `packages/storage/drizzle/0000_init.sql` defines the metadata schema expected in PostgreSQL.
- `packages/connectors/src/sql-common.ts` enforces allowlists and exposes a DB-driver-agnostic executor seam.
- `packages/runtime/src/runtime.ts` is the operational core for datasource registration, extraction, dataset snapshotting, training, evaluation, promotion, prediction, feedback, drift detection, retraining, and lineage.
- `apps/worker` resumes failed extraction jobs and performs scheduled retraining checks.

## Gaps To Close In A Real Deployment

- Replace the static SQL executor with real Postgres, MySQL, and SQL Server drivers behind the `SqlExecutor` interface.
- Swap the file-based metadata/object stores for PostgreSQL + object storage implementations.
- Add authentication, tenant isolation enforcement, secrets management, and structured observability.
- Extend the ML package beyond the deterministic baseline model to your target frameworks and evaluators.
