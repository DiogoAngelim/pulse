import { createEnvelope, type ProtocolEnvelope } from "@pulse/contracts";

export interface PulseClientOptions {
  baseUrl: string;
  tenantId: string;
}

export class PulseClient {
  constructor(private readonly options: PulseClientOptions) {}

  async mutation<TPayload, TResult>(name: string, payload: TPayload, idempotencyKey?: string): Promise<TResult> {
    const envelope = createEnvelope("mutation", name, this.options.tenantId, payload, { idempotencyKey });
    const response = await fetch(`${this.options.baseUrl}/mutations/${name}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(envelope)
    });
    return (await response.json()) as TResult;
  }

  async query<TPayload, TResult>(name: string, payload: TPayload): Promise<TResult> {
    const envelope = createEnvelope("query", name, this.options.tenantId, payload);
    const response = await fetch(`${this.options.baseUrl}/queries/${name}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(envelope)
    });
    return (await response.json()) as TResult;
  }

  async registerDataSource(payload: Record<string, unknown>) {
    return this.mutation("pulse.datasource.register.v1", payload);
  }

  asEnvelope<TPayload>(kind: ProtocolEnvelope["kind"], name: string, payload: TPayload): ProtocolEnvelope<TPayload> {
    return createEnvelope(kind, name, this.options.tenantId, payload);
  }
}

