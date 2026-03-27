"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"

const examples = [
  {
    id: "register",
    label: "Register Datasource",
    code: `{
  "protocol": "pulse",
  "kind": "mutation",
  "name": "pulse.datasource.register.v1",
  "version": "v1",
  "messageId": "msg_123",
  "timestamp": "2026-03-26T00:00:00.000Z",
  "idempotencyKey": "datasource-tenant-a-orders",
  "tenantId": "tenant_a",
  "payload": {
    "name": "Orders Warehouse",
    "type": "postgres",
    "connectionConfig": {
      "dsn": "postgres://readonly@warehouse/orders"
    },
    "allowedSchemas": ["public"],
    "allowedViews": ["ai_orders_v1"]
  }
}`,
  },
  {
    id: "extract",
    label: "Extract Snapshot",
    code: `{
  "protocol": "pulse",
  "kind": "mutation",
  "name": "pulse.source.sql.extract.v1",
  "version": "v1",
  "messageId": "msg_124",
  "timestamp": "2026-03-26T00:00:01.000Z",
  "tenantId": "tenant_a",
  "payload": {
    "dataSourceId": "ds_...",
    "queryDefinition": {
      "kind": "view",
      "identifier": "ai_orders_v1",
      "cursorField": "updated_at"
    },
    "extractionMode": "full_snapshot",
    "chunkSize": 500
  }
}`,
  },
  {
    id: "lineage",
    label: "Trace Lineage",
    code: `{
  "protocol": "pulse",
  "kind": "query",
  "name": "pulse.lineage.trace.v1",
  "version": "v1",
  "messageId": "msg_125",
  "timestamp": "2026-03-26T00:00:02.000Z",
  "tenantId": "tenant_a",
  "payload": {
    "entityId": "pred_...",
    "entityType": "prediction"
  }
}`,
  },
]

export function ProtocolSection() {
  const [activeExample, setActiveExample] = useState("register")

  return (
    <section id="protocol" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Protocol Examples
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every operation follows explicit, versioned contracts with idempotency keys and full audit metadata
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeExample === example.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {example.label}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            {examples.map((example) => (
              <div
                key={example.id}
                className={cn(
                  "transition-opacity duration-200",
                  activeExample === example.id ? "block" : "hidden"
                )}
              >
                <CodeBlock
                  code={example.code}
                  language="json"
                  title={example.label}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
