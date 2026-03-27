import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { ObjectStore } from "./interfaces.js";

export class LocalObjectStore implements ObjectStore {
  constructor(private readonly rootDir: string) {}

  private resolvePath(uri: string): string {
    return join(this.rootDir, uri.replace(/^object:\/\//, ""));
  }

  async writeJson(uri: string, data: unknown): Promise<void> {
    const filePath = this.resolvePath(uri);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async appendJsonLines(uri: string, rows: Array<Record<string, unknown>>): Promise<void> {
    const filePath = this.resolvePath(uri);
    await mkdir(dirname(filePath), { recursive: true });
    const content = rows.map((row) => `${JSON.stringify(row)}\n`).join("");
    await appendFile(filePath, content);
  }

  async readJsonLines(uri: string): Promise<Array<Record<string, unknown>>> {
    const filePath = this.resolvePath(uri);
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  }

  async readJson<T>(uri: string): Promise<T> {
    const filePath = this.resolvePath(uri);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  }
}
