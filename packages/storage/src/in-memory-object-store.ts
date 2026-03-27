import type { ObjectStore } from "./interfaces.js";

export class InMemoryObjectStore implements ObjectStore {
  private readonly files = new Map<string, string>();

  async writeJson(uri: string, data: unknown): Promise<void> {
    this.files.set(uri, JSON.stringify(data, null, 2));
  }

  async appendJsonLines(uri: string, rows: Array<Record<string, unknown>>): Promise<void> {
    const current = this.files.get(uri) ?? "";
    const next = `${current}${rows.map((row) => `${JSON.stringify(row)}\n`).join("")}`;
    this.files.set(uri, next);
  }

  async readJsonLines(uri: string): Promise<Array<Record<string, unknown>>> {
    return (this.files.get(uri) ?? "")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  }

  async readJson<T>(uri: string): Promise<T> {
    return JSON.parse(this.files.get(uri) ?? "null") as T;
  }
}
