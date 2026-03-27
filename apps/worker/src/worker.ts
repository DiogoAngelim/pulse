import { createEnvelope } from "@pulse/contracts";
import type { PulseRuntime } from "@pulse/runtime";

export class PulseWorker {
  constructor(private readonly runtime: PulseRuntime, private readonly tenantId = "default") {}

  async runOnce(): Promise<void> {
    const state = await this.runtime.getState();

    for (const job of Object.values(state.extractionJobs)) {
      if (job.status !== "failed") {
        continue;
      }

      await this.runtime.extractSqlSnapshot(
        createEnvelope("mutation", "pulse.source.sql.extract.v1", this.tenantId, {
          dataSourceId: job.dataSourceId,
          queryDefinition: job.queryDefinition,
          extractionMode: job.extractionMode,
          resumeFromJobId: job.id
        }, {
          correlationId: job.id,
          causationId: job.id
        })
      );
    }

    const modelNames = new Set(Object.values(state.models).filter((model: any) => model.status === "production").map((model: any) => model.modelName));
    for (const modelName of modelNames) {
      await this.runtime.checkRetraining(
        createEnvelope("mutation", "pulse.retraining.check.v1", this.tenantId, {
          modelName,
          scheduled: true
        })
      );
    }
  }
}
