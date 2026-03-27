import { createId, nowIso } from "@pulse/shared";

export type ProtocolKind = "query" | "mutation" | "event";

export interface ProtocolEnvelope<TPayload = unknown, TMetadata = Record<string, unknown>> {
  protocol: "pulse";
  kind: ProtocolKind;
  name: string;
  version: string;
  messageId: string;
  timestamp: string;
  idempotencyKey?: string;
  correlationId?: string;
  causationId?: string;
  tenantId: string;
  payload: TPayload;
  metadata: TMetadata;
}

export function createEnvelope<TPayload>(
  kind: ProtocolKind,
  name: string,
  tenantId: string,
  payload: TPayload,
  options: Partial<ProtocolEnvelope<TPayload>> = {}
): ProtocolEnvelope<TPayload> {
  return {
    protocol: "pulse",
    kind,
    name,
    version: options.version ?? "v1",
    messageId: options.messageId ?? createId("msg"),
    timestamp: options.timestamp ?? nowIso(),
    idempotencyKey: options.idempotencyKey,
    correlationId: options.correlationId,
    causationId: options.causationId,
    tenantId,
    payload,
    metadata: options.metadata ?? {}
  };
}

