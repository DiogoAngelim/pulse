import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { ConnectorRegistry, createMySqlConnector, createPostgresConnector, createSqlServerConnector, StaticSqlExecutor } from "@pulse/connectors";
import { FileMetadataStore, LocalObjectStore } from "@pulse/storage";

import { PulseRuntime } from "./runtime.js";

export interface SeedRuntimeOptions {
  stateDir?: string;
  encryptionKey?: string;
}

function seedExecutor(): StaticSqlExecutor {
  return new StaticSqlExecutor([
    {
      identifier: "ai_orders_v1",
      rows: [
        { order_id: 1, amount: 120, country_code: 1, label: 1 },
        { order_id: 2, amount: 40, country_code: 1, label: 0 },
        { order_id: 3, amount: 210, country_code: 44, label: 1 }
      ]
    },
    {
      identifier: "ai_customer_features_v1",
      rows: [
        { customer_id: 1, spend_30d: 180, orders_30d: 4, label: 1 },
        { customer_id: 2, spend_30d: 25, orders_30d: 1, label: 0 }
      ]
    },
    {
      identifier: "ai_labels_v1",
      rows: [
        { entity_id: 1, label: 1 },
        { entity_id: 2, label: 0 }
      ]
    }
  ]);
}

export async function createSeedRuntime(options: SeedRuntimeOptions = {}): Promise<PulseRuntime> {
  const stateDir = resolve(options.stateDir ?? ".pulse");
  await mkdir(stateDir, { recursive: true });

  const connectorRegistry = new ConnectorRegistry();
  const executor = seedExecutor();
  connectorRegistry.register(createPostgresConnector(executor));
  connectorRegistry.register(createMySqlConnector(executor));
  connectorRegistry.register(createSqlServerConnector(executor));

  return new PulseRuntime({
    metadataStore: new FileMetadataStore(resolve(stateDir, "metadata.json")),
    objectStore: new LocalObjectStore(resolve(stateDir, "objects")),
    connectorRegistry,
    encryptionKey: options.encryptionKey ?? process.env.PULSE_ENCRYPTION_KEY ?? "pulse-dev-secret"
  });
}
