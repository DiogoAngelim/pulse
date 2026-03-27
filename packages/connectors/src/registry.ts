import type { DataSourceType } from "@pulse/core";

import type { DataSourceConnector } from "./types.js";

export class ConnectorRegistry {
  private readonly connectors = new Map<DataSourceType, DataSourceConnector>();

  register(connector: DataSourceConnector): void {
    this.connectors.set(connector.type, connector);
  }

  get(type: DataSourceType): DataSourceConnector {
    const connector = this.connectors.get(type);
    if (!connector) {
      throw new Error(`connector ${type} is not registered`);
    }

    return connector;
  }
}

