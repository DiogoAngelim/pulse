import { createEmptyState, type MetadataStore, type PulseState } from "./interfaces.js";

export class InMemoryMetadataStore implements MetadataStore {
  private state: PulseState = createEmptyState();

  async load(): Promise<PulseState> {
    return structuredClone(this.state);
  }

  async save(state: PulseState): Promise<void> {
    this.state = structuredClone(state);
  }
}

