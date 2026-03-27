import { createHash } from "node:crypto";

import { stableStringify } from "./json.js";

export function hashValue(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

