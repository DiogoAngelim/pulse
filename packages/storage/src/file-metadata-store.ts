import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { createEmptyState, type MetadataStore, type PulseState } from "./interfaces.js";

export class FileMetadataStore implements MetadataStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<PulseState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as PulseState;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
        return createEmptyState();
      }

      throw error;
    }
  }

  async save(state: PulseState): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(state, null, 2));
  }
}
