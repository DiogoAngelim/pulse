import {
  type CheckRetrainingPayload,
  createEnvelope,
  type CreateDatasetSnapshotPayload,
  type DetectDriftPayload,
  type EvaluateModelPayload,
  type ExtractSqlPayload,
  type GetDataSourcePayload,
  type GetExtractionJobPayload,
  type ListDataSourcesPayload,
  type PromoteModelPayload,
  type ProtocolEnvelope,
  type PulseMutationResponse,
  type PulseQueryResponse,
  type RecordFeedbackPayload,
  type RegisterDataSourcePayload,
  type RunPredictionPayload,
  type RunRetrainingPayload,
  type StartTrainingPayload,
  type TraceLineagePayload,
  type ValidateDataSourcePayload
} from "@pulse/contracts";
import {
  type ConnectionConfig,
  evaluatePromotionPolicy,
  evaluateRetrainingSignals,
  type DataSource,
  type Dataset,
  type EvaluationReport,
  type ExtractionJob,
  type FeedbackRecord,
  type LineageEdge,
  type LineageNode,
  type ModelArtifact,
  type PredictionRecord,
  type RetrainingDecision,
  type DriftReport,
  traceLineage,
  type TrainingJob
} from "@pulse/core";
import type { ConnectorRegistry } from "@pulse/connectors";
import { buildFeatureSet, detectFeatureDrift, evaluateModelAccuracy, runModelPrediction, trainBaselineModel, type TrainedModel } from "@pulse/ml";
import { decryptJson, encryptJson, type MetadataStore, type ObjectStore, type PulseState } from "@pulse/storage";
import { createId, hashValue, nowIso } from "@pulse/shared";

export interface PulseRuntimeOptions {
  metadataStore: MetadataStore;
  objectStore: ObjectStore;
  connectorRegistry: ConnectorRegistry;
  encryptionKey: string;
}

function datasetVersionNumber(version: string): number {
  return Number(version.replace(/^v/, "")) || 0;
}

function toNode(type: LineageNode["type"], id: string): LineageNode {
  return { type, id };
}

function appendLineage(state: PulseState, from: LineageNode, to: LineageNode, relation: string): void {
  state.lineage.push({
    from,
    to,
    relation,
    createdAt: nowIso()
  });
}

export class PulseRuntime {
  constructor(private readonly options: PulseRuntimeOptions) {}

  async getState(): Promise<PulseState> {
    return this.options.metadataStore.load();
  }

  async dispatchMutation(envelope: ProtocolEnvelope): Promise<PulseMutationResponse> {
    switch (envelope.name) {
      case "pulse.datasource.register.v1":
        return this.registerDataSource(envelope as ProtocolEnvelope<RegisterDataSourcePayload>);
      case "pulse.datasource.validate.v1":
        return this.validateDataSource(envelope as ProtocolEnvelope<ValidateDataSourcePayload>);
      case "pulse.source.sql.extract.v1":
        return this.extractSqlSnapshot(envelope as ProtocolEnvelope<ExtractSqlPayload>);
      case "pulse.dataset.snapshot.create.v1":
        return this.createDatasetSnapshot(envelope as ProtocolEnvelope<CreateDatasetSnapshotPayload>);
      case "pulse.training.start.v1":
        return this.startTraining(envelope as ProtocolEnvelope<StartTrainingPayload>);
      case "pulse.model.evaluate.v1":
        return this.evaluateModel(envelope as ProtocolEnvelope<EvaluateModelPayload>);
      case "pulse.model.promote.v1":
        return this.promoteModel(envelope as ProtocolEnvelope<PromoteModelPayload>);
      case "pulse.prediction.run.v1":
        return this.runPrediction(envelope as ProtocolEnvelope<RunPredictionPayload>);
      case "pulse.feedback.record.v1":
        return this.recordFeedback(envelope as ProtocolEnvelope<RecordFeedbackPayload>);
      case "pulse.drift.detect.v1":
        return this.detectDrift(envelope as ProtocolEnvelope<DetectDriftPayload>);
      case "pulse.retraining.check.v1":
        return this.checkRetraining(envelope as ProtocolEnvelope<CheckRetrainingPayload>);
      case "pulse.retraining.run.v1":
        return this.runRetraining(envelope as ProtocolEnvelope<RunRetrainingPayload>);
      default:
        throw new Error(`unsupported mutation ${envelope.name}`);
    }
  }

  async dispatchQuery(envelope: ProtocolEnvelope): Promise<PulseQueryResponse> {
    switch (envelope.name) {
      case "pulse.datasource.get.v1":
        return this.getDataSource(envelope as ProtocolEnvelope<GetDataSourcePayload>);
      case "pulse.datasource.list.v1":
        return this.listDataSources(envelope as ProtocolEnvelope<ListDataSourcesPayload>);
      case "pulse.extraction-job.get.v1":
        return this.getExtractionJob(envelope as ProtocolEnvelope<GetExtractionJobPayload>);
      case "pulse.lineage.trace.v1":
        return this.traceLineage(envelope as ProtocolEnvelope<TraceLineagePayload>);
      default:
        throw new Error(`unsupported query ${envelope.name}`);
    }
  }

  private async withState<T>(mutator: (state: PulseState) => Promise<T>): Promise<T> {
    const state = await this.options.metadataStore.load();
    const result = await mutator(state);
    await this.options.metadataStore.save(state);
    return result;
  }

  private async emitEvent<TPayload>(state: PulseState, name: string, tenantId: string, payload: TPayload, causationId?: string): Promise<void> {
    state.events.push(
      createEnvelope("event", name, tenantId, payload, {
        causationId,
        correlationId: causationId
      })
    );
  }

  private async withIdempotency<T>(
    state: PulseState,
    idempotencyKey: string | undefined,
    action: () => Promise<T>
  ): Promise<T> {
    if (!idempotencyKey) {
      return action();
    }

    if (idempotencyKey in state.idempotency) {
      return state.idempotency[idempotencyKey] as T;
    }

    const result = await action();
    state.idempotency[idempotencyKey] = result;
    return result;
  }

  private getDataSourceConnection(dataSource: DataSource): ConnectionConfig {
    return decryptJson<ConnectionConfig>(dataSource.connectionConfig, this.options.encryptionKey);
  }

  private findDatasetVersion(state: PulseState, datasetId: string, datasetVersion: string): Dataset {
    const dataset = state.datasets[datasetId];
    if (!dataset || dataset.version !== datasetVersion) {
      throw new Error(`dataset ${datasetId}@${datasetVersion} not found`);
    }
    return dataset;
  }

  private latestProductionModel(state: PulseState, modelName: string): ModelArtifact | undefined {
    return Object.values(state.models)
      .filter((model) => model.modelName === modelName && model.status === "production")
      .sort((left, right) => datasetVersionNumber(right.version) - datasetVersionNumber(left.version))[0];
  }

  private latestDatasetByName(state: PulseState, datasetName: string): Dataset | undefined {
    return Object.values(state.datasets)
      .filter((dataset) => dataset.datasetName === datasetName)
      .sort((left, right) => datasetVersionNumber(right.version) - datasetVersionNumber(left.version))[0];
  }

  async registerDataSource(envelope: ProtocolEnvelope<RegisterDataSourcePayload>): Promise<DataSource> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const dataSource: DataSource = {
          id: createId("ds"),
          name: envelope.payload.name,
          type: envelope.payload.type,
          connectionConfig: encryptJson(envelope.payload.connectionConfig, this.options.encryptionKey),
          accessMode: envelope.payload.accessMode ?? "read_only",
          allowedSchemas: envelope.payload.allowedSchemas,
          allowedTables: envelope.payload.allowedTables,
          allowedViews: envelope.payload.allowedViews,
          schemaWhitelist: envelope.payload.schemaWhitelist ?? envelope.payload.allowedSchemas,
          status: "pending",
          createdAt: nowIso()
        };

        state.dataSources[dataSource.id] = dataSource;
        await this.emitEvent(state, "pulse.datasource.registered.v1", envelope.tenantId, dataSource, envelope.messageId);
        return dataSource;
      })
    );
  }

  async validateDataSource(envelope: ProtocolEnvelope<ValidateDataSourcePayload>): Promise<DataSource> {
    return this.withState(async (state) => {
      const dataSource = state.dataSources[envelope.payload.dataSourceId];
      if (!dataSource) {
        throw new Error(`data source ${envelope.payload.dataSourceId} not found`);
      }

      const connector = this.options.connectorRegistry.get(dataSource.type);
      try {
        const result = await connector.validateConnection({
          dataSource,
          connectionConfig: this.getDataSourceConnection(dataSource)
        });
        dataSource.status = result.valid ? "validated" : "failed";
        dataSource.validatedAt = nowIso();
        dataSource.lastValidationError = result.valid ? undefined : result.warnings.join("; ");
      } catch (error) {
        dataSource.status = "failed";
        dataSource.lastValidationError = (error as Error).message;
      }

      state.dataSources[dataSource.id] = dataSource;
      await this.emitEvent(state, "pulse.datasource.validated.v1", envelope.tenantId, dataSource, envelope.messageId);
      return dataSource;
    });
  }

  async extractSqlSnapshot(envelope: ProtocolEnvelope<ExtractSqlPayload>): Promise<ExtractionJob> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const dataSource = state.dataSources[envelope.payload.dataSourceId];
        if (!dataSource) {
          throw new Error(`data source ${envelope.payload.dataSourceId} not found`);
        }
        if (dataSource.status !== "validated") {
          throw new Error("data source must be validated before extraction");
        }

        const connector = this.options.connectorRegistry.get(dataSource.type);
        const outputUriBase = envelope.payload.resumeFromJobId
          ? state.extractionJobs[envelope.payload.resumeFromJobId]?.outputUri
          : `object://snapshots/${dataSource.id}/${createId("extract")}.jsonl`;
        if (!outputUriBase) {
          throw new Error("resume job must already have an outputUri");
        }

        const job =
          envelope.payload.resumeFromJobId && state.extractionJobs[envelope.payload.resumeFromJobId]
            ? state.extractionJobs[envelope.payload.resumeFromJobId]
            : {
                id: createId("extract"),
                dataSourceId: dataSource.id,
                queryDefinition: envelope.payload.queryDefinition,
                extractionMode: envelope.payload.extractionMode,
                status: "pending",
                rowCount: 0,
                chunkCount: 0
              } satisfies ExtractionJob;

        job.status = "running";
        job.startedAt ??= nowIso();
        job.outputUri = outputUriBase;
        const outputUri = job.outputUri!;
        state.extractionJobs[job.id] = job;
        await this.emitEvent(state, "pulse.extraction.started.v1", envelope.tenantId, job, envelope.messageId);
        await this.options.metadataStore.save(state);

        let schemaDefinition = { fields: [] as Dataset["schemaDefinition"]["fields"] };
        try {
          for await (const chunk of connector.streamData(
            {
              dataSource,
              connectionConfig: this.getDataSourceConnection(dataSource)
            },
            envelope.payload.queryDefinition,
            job.checkpoint,
            envelope.payload.chunkSize
          )) {
            await this.options.objectStore.appendJsonLines(outputUri, chunk.rows);
            job.rowCount += chunk.rows.length;
            job.chunkCount += 1;
            job.checkpoint = chunk.cursor;
            schemaDefinition = chunk.schemaDefinition ?? schemaDefinition;
            state.extractionJobs[job.id] = job;
            await this.options.metadataStore.save(state);
          }

          job.status = "completed";
          job.finishedAt = nowIso();
          job.checksum = hashValue({
            dataSourceId: job.dataSourceId,
            queryDefinition: job.queryDefinition,
            rowCount: job.rowCount,
            schemaDefinition
          });
          state.extractionJobs[job.id] = job;
          await this.emitEvent(state, "pulse.extraction.completed.v1", envelope.tenantId, job, envelope.messageId);
          return job;
        } catch (error) {
          job.status = "failed";
          job.errorMessage = (error as Error).message;
          state.extractionJobs[job.id] = job;
          await this.emitEvent(state, "pulse.extraction.failed.v1", envelope.tenantId, job, envelope.messageId);
          return job;
        }
      })
    );
  }

  async createDatasetSnapshot(envelope: ProtocolEnvelope<CreateDatasetSnapshotPayload>): Promise<Dataset> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const extractionJob = state.extractionJobs[envelope.payload.extractionJobId];
        if (!extractionJob) {
          throw new Error(`extraction job ${envelope.payload.extractionJobId} not found`);
        }
        if (extractionJob.status !== "completed" || !extractionJob.outputUri || !extractionJob.checksum) {
          throw new Error("extraction job must complete before dataset creation");
        }

        const priorVersion = this.latestDatasetByName(state, envelope.payload.datasetName);
        const version = `v${datasetVersionNumber(priorVersion?.version ?? "v0") + 1}`;
        const rows = await this.options.objectStore.readJsonLines(extractionJob.outputUri);
        const schemaDefinition =
          envelope.payload.schemaDefinition ??
          ({
            fields: Object.keys(rows[0] ?? {}).map((name) => ({
              name,
              dataType: typeof rows[0]?.[name],
              nullable: true
            }))
          } satisfies Dataset["schemaDefinition"]);

        const dataset: Dataset = {
          id: createId("dataset"),
          datasetName: envelope.payload.datasetName,
          version,
          sourceType: "sql_snapshot",
          dataSourceId: extractionJob.dataSourceId,
          extractionJobId: extractionJob.id,
          schemaDefinition,
          rowCount: extractionJob.rowCount,
          checksum: extractionJob.checksum,
          storageUri: extractionJob.outputUri,
          status: "finalized",
          createdAt: nowIso(),
          finalizedAt: nowIso()
        };

        state.datasets[dataset.id] = dataset;
        appendLineage(state, toNode("datasource", extractionJob.dataSourceId), toNode("extraction", extractionJob.id), "produced_extraction");
        appendLineage(state, toNode("extraction", extractionJob.id), toNode("dataset", dataset.id), "materialized_dataset");
        await this.emitEvent(state, "pulse.dataset.snapshot.created.v1", envelope.tenantId, dataset, envelope.messageId);
        return dataset;
      })
    );
  }

  async startTraining(envelope: ProtocolEnvelope<StartTrainingPayload>): Promise<ModelArtifact> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const dataset = this.findDatasetVersion(state, envelope.payload.datasetId, envelope.payload.datasetVersion);
        if (dataset.status !== "finalized") {
          throw new Error("dataset must be finalized before training");
        }

        dataset.schemaDefinition.labelField = envelope.payload.labelField;
        const rows = await this.options.objectStore.readJsonLines(dataset.storageUri);
        const featureSet = buildFeatureSet(rows, dataset.schemaDefinition, envelope.payload.labelField);
        const trainedModel = trainBaselineModel(featureSet);
        const metrics = evaluateModelAccuracy(trainedModel, featureSet.labels);

        const trainingJob: TrainingJob = {
          id: createId("train"),
          datasetId: dataset.id,
          datasetVersion: dataset.version,
          modelName: envelope.payload.modelName,
          labelField: envelope.payload.labelField,
          status: "completed",
          startedAt: nowIso(),
          finishedAt: nowIso()
        };

        const model: ModelArtifact = {
          id: createId("model"),
          modelName: envelope.payload.modelName,
          version: `v${Object.values(state.models).filter((entry) => entry.modelName === envelope.payload.modelName).length + 1}`,
          datasetId: dataset.id,
          datasetVersion: dataset.version,
          labelField: envelope.payload.labelField,
          status: "candidate",
          artifactUri: `object://models/${envelope.payload.modelName}/${createId("artifact")}.json`,
          checksum: trainedModel.checksum,
          metrics,
          createdAt: nowIso()
        };

        trainingJob.candidateModelId = model.id;
        state.trainingJobs[trainingJob.id] = trainingJob;
        state.models[model.id] = model;
        await this.options.objectStore.writeJson(model.artifactUri, trainedModel);
        appendLineage(state, toNode("dataset", dataset.id), toNode("model", model.id), "trained_model");
        await this.emitEvent(state, "pulse.training.completed.v1", envelope.tenantId, trainingJob, envelope.messageId);
        return model;
      })
    );
  }

  async evaluateModel(envelope: ProtocolEnvelope<EvaluateModelPayload>): Promise<EvaluationReport> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const model = state.models[envelope.payload.modelId];
        if (!model) {
          throw new Error(`model ${envelope.payload.modelId} not found`);
        }

        const dataset = state.datasets[model.datasetId];
        const rows = await this.options.objectStore.readJsonLines(dataset.storageUri);
        const featureSet = buildFeatureSet(rows, dataset.schemaDefinition, model.labelField);
        const trainedModel = await this.options.objectStore.readJson<TrainedModel>(model.artifactUri);
        const metrics = evaluateModelAccuracy(trainedModel, featureSet.labels);
        const baseline = this.latestProductionModel(state, model.modelName);
        const report: EvaluationReport = {
          id: createId("eval"),
          modelId: model.id,
          baselineModelId: baseline?.id,
          datasetId: dataset.id,
          datasetVersion: dataset.version,
          metrics,
          candidateWins: !baseline || metrics.accuracy >= (baseline.metrics.accuracy ?? 0),
          createdAt: nowIso(),
          artifactUri: `object://evaluations/${model.id}.json`
        };

        state.evaluations[report.id] = report;
        await this.options.objectStore.writeJson(report.artifactUri!, report);
        return report;
      })
    );
  }

  async promoteModel(envelope: ProtocolEnvelope<PromoteModelPayload>): Promise<ModelArtifact> {
    return this.withState(async (state) => {
      const model = state.models[envelope.payload.modelId];
      if (!model) {
        throw new Error(`model ${envelope.payload.modelId} not found`);
      }

      const evaluation = Object.values(state.evaluations)
        .filter((report) => report.modelId === model.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

      if (!evaluation) {
        throw new Error(`no evaluation report found for ${model.id}`);
      }

      const baseline = this.latestProductionModel(state, model.modelName);
      const decision = evaluatePromotionPolicy({
        candidateMetrics: evaluation.metrics,
        baselineMetrics: baseline?.metrics,
        minimumAccuracy: envelope.payload.minimumAccuracy
      });

      if (!decision.approved) {
        model.status = "rejected";
        state.models[model.id] = model;
        return model;
      }

      if (baseline) {
        baseline.status = "archived";
        state.models[baseline.id] = baseline;
      }

      model.status = "production";
      model.promotedAt = nowIso();
      state.models[model.id] = model;
      await this.emitEvent(state, "pulse.model.promoted.v1", envelope.tenantId, model, envelope.messageId);
      return model;
    });
  }

  async runPrediction(envelope: ProtocolEnvelope<RunPredictionPayload>): Promise<PredictionRecord> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const model = this.latestProductionModel(state, envelope.payload.modelName);
        if (!model) {
          throw new Error(`no production model available for ${envelope.payload.modelName}`);
        }

        const trainedModel = await this.options.objectStore.readJson<TrainedModel>(model.artifactUri);
        const output = runModelPrediction(trainedModel, envelope.payload.input);
        const prediction: PredictionRecord = {
          id: createId("pred"),
          modelId: model.id,
          tenantId: envelope.tenantId,
          input: envelope.payload.input,
          output,
          createdAt: nowIso()
        };

        state.predictions[prediction.id] = prediction;
        appendLineage(state, toNode("model", model.id), toNode("prediction", prediction.id), "served_prediction");
        return prediction;
      })
    );
  }

  async recordFeedback(envelope: ProtocolEnvelope<RecordFeedbackPayload>): Promise<FeedbackRecord> {
    return this.withState((state) =>
      this.withIdempotency(state, envelope.idempotencyKey, async () => {
        const prediction = state.predictions[envelope.payload.predictionId];
        if (!prediction) {
          throw new Error(`prediction ${envelope.payload.predictionId} not found`);
        }

        const feedback: FeedbackRecord = {
          id: createId("feedback"),
          predictionId: prediction.id,
          tenantId: envelope.tenantId,
          outcome: envelope.payload.outcome,
          createdAt: nowIso()
        };

        state.feedback[feedback.id] = feedback;
        appendLineage(state, toNode("prediction", prediction.id), toNode("feedback", feedback.id), "captured_feedback");
        await this.emitEvent(state, "pulse.feedback.recorded.v1", envelope.tenantId, feedback, envelope.messageId);
        return feedback;
      })
    );
  }

  async detectDrift(envelope: ProtocolEnvelope<DetectDriftPayload>): Promise<DriftReport> {
    return this.withState(async (state) => {
      const model = state.models[envelope.payload.modelId];
      const dataset = state.datasets[envelope.payload.datasetId];
      if (!model || !dataset) {
        throw new Error("model and dataset are required for drift detection");
      }

      const referenceRows = await this.options.objectStore.readJsonLines(dataset.storageUri);
      const predictionRows = Object.values(state.predictions)
        .filter((prediction) => prediction.modelId === model.id)
        .map((prediction) => prediction.input);

      const reference = buildFeatureSet(referenceRows, dataset.schemaDefinition, model.labelField);
      const candidate = buildFeatureSet(predictionRows, dataset.schemaDefinition, model.labelField);
      const drift = detectFeatureDrift(reference, candidate);
      const report: DriftReport = {
        id: createId("drift"),
        modelId: model.id,
        datasetId: dataset.id,
        score: drift.score,
        driftDetected: drift.score > 0.25,
        featureDiffs: drift.featureDiffs,
        createdAt: nowIso()
      };

      state.driftReports[report.id] = report;
      await this.emitEvent(state, "pulse.drift.detected.v1", envelope.tenantId, report, envelope.messageId);
      return report;
    });
  }

  async checkRetraining(envelope: ProtocolEnvelope<CheckRetrainingPayload>): Promise<RetrainingDecision> {
    return this.withState(async (state) => {
      const model = this.latestProductionModel(state, envelope.payload.modelName);
      if (!model) {
        throw new Error(`no production model found for ${envelope.payload.modelName}`);
      }

      const currentDataset = state.datasets[model.datasetId];
      const latestDataset = Object.values(state.datasets)
        .filter((dataset) => dataset.datasetName === currentDataset.datasetName)
        .sort((left, right) => datasetVersionNumber(right.version) - datasetVersionNumber(left.version))[0];

      const predictions = Object.values(state.predictions).filter((prediction) => prediction.modelId === model.id);
      const feedback = Object.values(state.feedback).filter((item) => {
        const prediction = state.predictions[item.predictionId];
        return prediction?.modelId === model.id;
      });
      const incorrectFeedback = feedback.filter((item) => {
        const prediction = state.predictions[item.predictionId];
        return prediction?.output.prediction !== item.outcome.label;
      }).length;
      const performanceDegraded = feedback.length > 0 ? incorrectFeedback / feedback.length > 0.3 : false;

      const latestDrift = Object.values(state.driftReports)
        .filter((report) => report.modelId === model.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

      const reasons = evaluateRetrainingSignals({
        driftDetected: latestDrift?.driftDetected ?? false,
        performanceDegraded,
        newDataAvailable: latestDataset ? latestDataset.version !== model.datasetVersion : false,
        feedbackVolume: feedback.length,
        scheduled: envelope.payload.scheduled ?? false
      });

      const decision: RetrainingDecision = {
        id: createId("retrain_check"),
        modelName: envelope.payload.modelName,
        reasonCodes: reasons,
        approved: reasons.length > 0,
        createdAt: nowIso(),
        datasetId: latestDataset?.id ?? model.datasetId,
        datasetVersion: latestDataset?.version ?? model.datasetVersion
      };

      state.retrainingDecisions[decision.id] = decision;
      return decision;
    });
  }

  async runRetraining(envelope: ProtocolEnvelope<RunRetrainingPayload>): Promise<RetrainingDecision> {
    const decision = await this.checkRetraining(
      createEnvelope("mutation", "pulse.retraining.check.v1", envelope.tenantId, {
        modelName: envelope.payload.modelName,
        scheduled: true
      }, {
        causationId: envelope.messageId,
        correlationId: envelope.correlationId ?? envelope.messageId
      })
    );

    if (!decision.approved) {
      return decision;
    }

    const state = await this.options.metadataStore.load();
    const productionModel = this.latestProductionModel(state, envelope.payload.modelName);
    if (!productionModel) {
      throw new Error(`no production model found for ${envelope.payload.modelName}`);
    }

    let dataset = state.datasets[decision.datasetId!];
    if (envelope.payload.queryDefinition && dataset.dataSourceId) {
      const extraction = await this.extractSqlSnapshot(
        createEnvelope("mutation", "pulse.source.sql.extract.v1", envelope.tenantId, {
          dataSourceId: dataset.dataSourceId,
          queryDefinition: envelope.payload.queryDefinition,
          extractionMode: "incremental",
          datasetName: dataset.datasetName
        }, {
          correlationId: envelope.messageId,
          causationId: envelope.messageId
        })
      );

      dataset = await this.createDatasetSnapshot(
        createEnvelope("mutation", "pulse.dataset.snapshot.create.v1", envelope.tenantId, {
          extractionJobId: extraction.id,
          datasetName: dataset.datasetName
        }, {
          correlationId: envelope.messageId,
          causationId: envelope.messageId
        })
      );
    }

    const candidate = await this.startTraining(
      createEnvelope("mutation", "pulse.training.start.v1", envelope.tenantId, {
        datasetId: dataset.id,
        datasetVersion: dataset.version,
        modelName: envelope.payload.modelName,
        labelField: productionModel.labelField
      }, {
        correlationId: envelope.messageId,
        causationId: envelope.messageId
      })
    );

    await this.evaluateModel(
      createEnvelope("mutation", "pulse.model.evaluate.v1", envelope.tenantId, { modelId: candidate.id }, {
        correlationId: envelope.messageId,
        causationId: envelope.messageId
      })
    );

    const promoted = await this.promoteModel(
      createEnvelope("mutation", "pulse.model.promote.v1", envelope.tenantId, { modelId: candidate.id }, {
        correlationId: envelope.messageId,
        causationId: envelope.messageId
      })
    );

    const finalDecision: RetrainingDecision = {
      ...decision,
      candidateModelId: candidate.id,
      datasetId: dataset.id,
      datasetVersion: dataset.version,
      approved: promoted.status === "production"
    };

    await this.withState(async (freshState) => {
      freshState.retrainingDecisions[finalDecision.id] = finalDecision;
      await this.emitEvent(freshState, "pulse.retraining.completed.v1", envelope.tenantId, finalDecision, envelope.messageId);
      return finalDecision;
    });

    return finalDecision;
  }

  async getDataSource(envelope: ProtocolEnvelope<GetDataSourcePayload>): Promise<DataSource> {
    const state = await this.options.metadataStore.load();
    const dataSource = state.dataSources[envelope.payload.id];
    if (!dataSource) {
      throw new Error(`data source ${envelope.payload.id} not found`);
    }
    return dataSource;
  }

  async listDataSources(envelope: ProtocolEnvelope<ListDataSourcesPayload>): Promise<DataSource[]> {
    const state = await this.options.metadataStore.load();
    return Object.values(state.dataSources).filter((item) => !envelope.payload.status || item.status === envelope.payload.status);
  }

  async getExtractionJob(envelope: ProtocolEnvelope<GetExtractionJobPayload>): Promise<ExtractionJob> {
    const state = await this.options.metadataStore.load();
    const job = state.extractionJobs[envelope.payload.id];
    if (!job) {
      throw new Error(`extraction job ${envelope.payload.id} not found`);
    }
    return job;
  }

  async traceLineage(envelope: ProtocolEnvelope<TraceLineagePayload>): Promise<{ nodes: Array<{ id: string; type: string }>; edges: Array<{ from: string; to: string; relation: string }> }> {
    const state = await this.options.metadataStore.load();
    const graph = traceLineage(state.lineage, {
      id: envelope.payload.entityId,
      type: envelope.payload.entityType === "extraction" ? "extraction" : envelope.payload.entityType
    });

    return {
      nodes: graph.nodes.map((node) => ({ id: node.id, type: node.type })),
      edges: graph.edges.map((edge) => ({ from: edge.from.id, to: edge.to.id, relation: edge.relation }))
    };
  }
}
