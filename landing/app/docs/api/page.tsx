import { CodeBlock } from "@/components/code-block"

const endpoints = [
  {
    method: "POST",
    path: "/v1/infer/{model}",
    description: "Run inference on a deployed model",
    request: `{
  "input": {
    "transaction_amount": 1500.00,
    "merchant_category": "electronics"
  },
  "options": {
    "include_metadata": true
  }
}`,
    response: `{
  "id": "inf_abc123",
  "model": "fraud-detector",
  "version": "1.0.0-def456",
  "output": {
    "is_fraud": false,
    "confidence": 0.12
  },
  "metadata": {
    "latency_ms": 45,
    "cached": false
  }
}`,
  },
  {
    method: "POST",
    path: "/v1/train/{model}",
    description: "Trigger a training run",
    request: `{
  "snapshot": "snap_abc123",
  "options": {
    "gpu": true,
    "notify_on_complete": true
  }
}`,
    response: `{
  "id": "run_xyz789",
  "model": "fraud-detector",
  "status": "running",
  "started_at": "2024-01-15T10:30:00Z",
  "snapshot": "snap_abc123"
}`,
  },
  {
    method: "POST",
    path: "/v1/snapshot/{datasource}",
    description: "Create a new data snapshot",
    request: `{
  "options": {
    "force": false,
    "compression": "zstd"
  }
}`,
    response: `{
  "id": "snap_def456",
  "datasource": "transactions-db",
  "created_at": "2024-01-15T10:30:00Z",
  "rows": 1247832,
  "size_bytes": 524288000,
  "hash": "sha256:e3b0c442..."
}`,
  },
  {
    method: "GET",
    path: "/v1/models/{model}/versions",
    description: "List model versions",
    request: null,
    response: `{
  "model": "fraud-detector",
  "versions": [
    {
      "version": "1.0.0-def456",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "deployed",
      "metrics": {
        "accuracy": 0.9847,
        "f1_score": 0.9621
      }
    },
    {
      "version": "1.0.0-abc123",
      "created_at": "2024-01-10T08:00:00Z",
      "status": "archived"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/lineage/{id}",
    description: "Get lineage information",
    request: null,
    response: `{
  "id": "inf_abc123",
  "type": "inference",
  "model": {
    "name": "fraud-detector",
    "version": "1.0.0-def456"
  },
  "training": {
    "id": "run_xyz789",
    "snapshot": "snap_abc123",
    "started_at": "2024-01-15T02:00:00Z",
    "completed_at": "2024-01-15T02:04:32Z"
  },
  "datasource": {
    "name": "transactions-db",
    "type": "postgresql",
    "rows": 1247832
  }
}`,
  },
]

export default function APIPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        API Reference
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        RESTful API for programmatic access to Pulse functionality.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Authentication
        </h2>
        <p className="mt-4 text-muted-foreground">
          All API requests require authentication using a Bearer token:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`curl -X POST https://api.pulse.dev/v1/infer/fraud-detector \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": {...}}'`}
            language="bash"
          />
        </div>
        <p className="mt-4 text-muted-foreground">
          Get your API key from the Pulse dashboard or by running{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-primary">
            pulse auth login
          </code>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Base URL</h2>
        <div className="mt-4">
          <code className="rounded bg-muted px-3 py-2 text-sm text-primary">
            https://api.pulse.dev
          </code>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Endpoints</h2>
        <div className="mt-6 space-y-8">
          {endpoints.map((endpoint, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card/50 p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    endpoint.method === "GET"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm text-foreground">{endpoint.path}</code>
              </div>
              <p className="mt-3 text-muted-foreground">
                {endpoint.description}
              </p>

              {endpoint.request && (
                <>
                  <h4 className="mt-6 text-sm font-semibold text-foreground">
                    Request Body
                  </h4>
                  <div className="mt-2">
                    <CodeBlock code={endpoint.request} language="json" />
                  </div>
                </>
              )}

              <h4 className="mt-6 text-sm font-semibold text-foreground">
                Response
              </h4>
              <div className="mt-2">
                <CodeBlock code={endpoint.response} language="json" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Error Handling</h2>
        <p className="mt-4 text-muted-foreground">
          All errors follow a consistent format:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {
        "field": "transaction_amount",
        "message": "must be a positive number"
      }
    ]
  }
}`}
            language="json"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          Error Codes
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  HTTP Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  VALIDATION_ERROR
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">400</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Invalid input data
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  UNAUTHORIZED
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">401</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Invalid or missing API key
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  NOT_FOUND
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">404</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Resource not found
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  RATE_LIMITED
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">429</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Too many requests
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  INTERNAL_ERROR
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">500</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Internal server error
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Rate Limits</h2>
        <p className="mt-4 text-muted-foreground">
          API requests are rate limited based on your plan:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Requests/min
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Burst
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-foreground">Free</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">60</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">10</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-foreground">Pro</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">600</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">100</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-foreground">Enterprise</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Unlimited
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Custom
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">SDKs</h2>
        <p className="mt-4 text-muted-foreground">
          Official SDKs for popular languages:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`# Python
pip install pulse-sdk

# JavaScript/TypeScript
npm install @anthropic/pulse

# Go
go get github.com/anthropic/pulse-go`}
            language="bash"
          />
        </div>
      </section>
    </div>
  )
}
