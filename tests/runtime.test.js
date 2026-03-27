import test from "node:test";
import assert from "node:assert/strict";

import { createEnvelope } from "@pulse/contracts";
import { ConnectorRegistry, createPostgresConnector, StaticSqlExecutor } from "@pulse/connectors";
import { PulseRuntime } from "@pulse/runtime";
import { InMemoryMetadataStore, InMemoryObjectStore } from "@pulse/storage";

function buildRuntime(rows, options = {}) {
  const executor = new StaticSqlExecutor([
    {
      identifier: "ai_orders_v1",
      rows
    }
  ]);

  if (options.failOnChunk) {
    executor.setFailure("ai_orders_v1", options.failOnChunk);
  }

  const registry = new ConnectorRegistry();
  registry.register(createPostgresConnector(executor));

  return new PulseRuntime({
    metadataStore: new InMemoryMetadataStore(),
    objectStore: new InMemoryObjectStore(),
    connectorRegistry: registry,
    encryptionKey: "test-secret"
  });
}

async function bootstrapSnapshot(runtime, tenantId = "tenant_a") {
  const datasource = await runtime.registerDataSource(
    createEnvelope("mutation", "pulse.datasource.register.v1", tenantId, {
      name: "Orders Source",
      type: "postgres",
      connectionConfig: { dsn: "postgres://readonly@pulse" },
      allowedSchemas: ["public"],
      allowedTables: [],
      allowedViews: ["ai_orders_v1"]
    }, {
      idempotencyKey: "datasource-bootstrap"
    })
  );

  await runtime.validateDataSource(
    createEnvelope("mutation", "pulse.datasource.validate.v1", tenantId, {
      dataSourceId: datasource.id
    })
  );

  const extraction = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", tenantId, {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "full_snapshot",
      chunkSize: 2
    })
  );

  const dataset = await runtime.createDatasetSnapshot(
    createEnvelope("mutation", "pulse.dataset.snapshot.create.v1", tenantId, {
      extractionJobId: extraction.id,
      datasetName: "orders_model"
    })
  );

  return { datasource, extraction, dataset };
}

test("validates datasource, extracts snapshot, trains, evaluates, promotes, predicts, and traces lineage", async () => {
  const runtime = buildRuntime([
    { order_id: 1, amount: 120, region: 1, label: 1 },
    { order_id: 2, amount: 15, region: 1, label: 0 },
    { order_id: 3, amount: 200, region: 44, label: 1 }
  ]);
  const { dataset } = await bootstrapSnapshot(runtime);

  const model = await runtime.startTraining(
    createEnvelope("mutation", "pulse.training.start.v1", "tenant_a", {
      datasetId: dataset.id,
      datasetVersion: dataset.version,
      modelName: "orders_model",
      labelField: "label"
    })
  );

  const report = await runtime.evaluateModel(
    createEnvelope("mutation", "pulse.model.evaluate.v1", "tenant_a", { modelId: model.id })
  );
  const promoted = await runtime.promoteModel(
    createEnvelope("mutation", "pulse.model.promote.v1", "tenant_a", { modelId: model.id, minimumAccuracy: 0.5 })
  );
  const prediction = await runtime.runPrediction(
    createEnvelope("mutation", "pulse.prediction.run.v1", "tenant_a", {
      modelName: "orders_model",
      input: { order_id: 55, amount: 81, region: 1 }
    }, {
      idempotencyKey: "prediction-1"
    })
  );
  const feedback = await runtime.recordFeedback(
    createEnvelope("mutation", "pulse.feedback.record.v1", "tenant_a", {
      predictionId: prediction.id,
      outcome: { label: 1 }
    })
  );
  const lineage = await runtime.traceLineage(
    createEnvelope("query", "pulse.lineage.trace.v1", "tenant_a", {
      entityId: prediction.id,
      entityType: "prediction"
    })
  );

  assert.equal(report.metrics.accuracy, 2 / 3);
  assert.equal(promoted.status, "production");
  assert.equal(feedback.predictionId, prediction.id);
  assert.ok(lineage.nodes.some((node) => node.type === "dataset"));
  assert.ok(lineage.edges.some((edge) => edge.relation === "trained_model"));
});

test("keeps extraction idempotent and snapshot checksums reproducible", async () => {
  const runtime = buildRuntime([
    { order_id: 1, amount: 10, label: 0 },
    { order_id: 2, amount: 20, label: 1 }
  ]);

  const { datasource } = await bootstrapSnapshot(runtime);

  const first = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", "tenant_a", {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "full_snapshot"
    }, {
      idempotencyKey: "extract-1"
    })
  );
  const second = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", "tenant_a", {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "full_snapshot"
    }, {
      idempotencyKey: "extract-1"
    })
  );

  assert.equal(first.id, second.id);
  assert.equal(first.checksum, second.checksum);
});

test("handles extraction failure recovery and retraining with new data", async () => {
  const runtime = buildRuntime([
    { order_id: 1, amount: 10, region: 1, label: 0 },
    { order_id: 2, amount: 20, region: 1, label: 0 },
    { order_id: 3, amount: 30, region: 1, label: 1 },
    { order_id: 4, amount: 40, region: 1, label: 1 }
  ], {
    failOnChunk: 2
  });

  const datasource = await runtime.registerDataSource(
    createEnvelope("mutation", "pulse.datasource.register.v1", "tenant_a", {
      name: "Orders Source",
      type: "postgres",
      connectionConfig: { dsn: "postgres://readonly@pulse" },
      allowedSchemas: ["public"],
      allowedTables: [],
      allowedViews: ["ai_orders_v1"]
    })
  );
  await runtime.validateDataSource(createEnvelope("mutation", "pulse.datasource.validate.v1", "tenant_a", { dataSourceId: datasource.id }));

  const failed = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", "tenant_a", {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "full_snapshot",
      chunkSize: 2
    })
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.rowCount, 2);

  const resumed = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", "tenant_a", {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "full_snapshot",
      chunkSize: 2,
      resumeFromJobId: failed.id
    })
  );
  assert.equal(resumed.status, "completed");
  assert.equal(resumed.rowCount, 4);

  const datasetV1 = await runtime.createDatasetSnapshot(
    createEnvelope("mutation", "pulse.dataset.snapshot.create.v1", "tenant_a", {
      extractionJobId: resumed.id,
      datasetName: "orders_model"
    })
  );
  const modelV1 = await runtime.startTraining(
    createEnvelope("mutation", "pulse.training.start.v1", "tenant_a", {
      datasetId: datasetV1.id,
      datasetVersion: datasetV1.version,
      modelName: "orders_model",
      labelField: "label"
    })
  );
  await runtime.evaluateModel(createEnvelope("mutation", "pulse.model.evaluate.v1", "tenant_a", { modelId: modelV1.id }));
  await runtime.promoteModel(createEnvelope("mutation", "pulse.model.promote.v1", "tenant_a", { modelId: modelV1.id, minimumAccuracy: 0.4 }));

  const nextExtraction = await runtime.extractSqlSnapshot(
    createEnvelope("mutation", "pulse.source.sql.extract.v1", "tenant_a", {
      dataSourceId: datasource.id,
      queryDefinition: { kind: "view", identifier: "ai_orders_v1" },
      extractionMode: "incremental"
    })
  );
  const datasetV2 = await runtime.createDatasetSnapshot(
    createEnvelope("mutation", "pulse.dataset.snapshot.create.v1", "tenant_a", {
      extractionJobId: nextExtraction.id,
      datasetName: "orders_model"
    })
  );

  const drift = await runtime.detectDrift(
    createEnvelope("mutation", "pulse.drift.detect.v1", "tenant_a", {
      modelId: modelV1.id,
      datasetId: datasetV1.id
    })
  );
  const decision = await runtime.checkRetraining(
    createEnvelope("mutation", "pulse.retraining.check.v1", "tenant_a", {
      modelName: "orders_model",
      scheduled: true
    })
  );
  const retraining = await runtime.runRetraining(
    createEnvelope("mutation", "pulse.retraining.run.v1", "tenant_a", {
      modelName: "orders_model"
    })
  );

  assert.equal(datasetV2.version, "v2");
  assert.equal(typeof drift.score, "number");
  assert.ok(decision.reasonCodes.length > 0);
  assert.ok(retraining.candidateModelId);
});

