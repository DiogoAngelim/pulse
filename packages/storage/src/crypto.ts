import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const IV_SIZE = 12;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, "pulse", 32);
}

export function encryptJson(value: Record<string, unknown>, secret: string): string {
  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptJson<T>(value: string, secret: string): T {
  const payload = Buffer.from(value, "base64");
  const iv = payload.subarray(0, IV_SIZE);
  const authTag = payload.subarray(IV_SIZE, IV_SIZE + 16);
  const encrypted = payload.subarray(IV_SIZE + 16);
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

