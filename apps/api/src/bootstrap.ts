import { createSeedRuntime, type PulseRuntime } from "@pulse/runtime";

export interface BootstrapOptions {
  stateDir?: string;
  encryptionKey?: string;
}

export async function createDefaultRuntime(options: BootstrapOptions = {}): Promise<PulseRuntime> {
  return createSeedRuntime(options);
}
