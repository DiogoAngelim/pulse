import { CodeBlock } from "@/components/code-block"

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Getting Started
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Get up and running with Pulse in under 5 minutes.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Installation</h2>
        <p className="mt-4 text-muted-foreground">
          Install the Pulse CLI globally using npm (official package: <b>@digelim/pulse</b>):
        </p>
        <div className="mt-4">
          <CodeBlock
            code="npm install -g @digelim/pulse"
            language="bash"
          />
        </div>
        <p className="mt-4 text-muted-foreground">Or using pnpm:</p>
        <div className="mt-4">
          <CodeBlock code="pnpm add -g @digelim/pulse" language="bash" />
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <b>Note:</b> The package is published on npm as <b>@digelim/pulse</b>. Use this name in all install and import commands.
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Initialize a Project
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create a new Pulse project with the init command:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`pulse init my-ml-project
cd my-ml-project`}
            language="bash"
          />
        </div>
        <p className="mt-4 text-muted-foreground">
          This creates a new directory with the following structure:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`my-ml-project/
├── pulse.yaml           # Main configuration
├── models/
│   └── example.model.yaml
├── datasources/
│   └── default.datasource.yaml
└── .pulse/
    └── cache/`}
            language="text"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Define Your First Model
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create a model definition in <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-primary">models/fraud-detector.model.yaml</code>:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`model: fraud-detector
version: "1.0.0"
runtime: python3.11

input:
  type: object
  properties:
    transaction_amount:
      type: number
    merchant_category:
      type: string
    user_history:
      type: array
      items:
        type: object

output:
  type: object
  properties:
    is_fraud:
      type: boolean
    confidence:
      type: number
      minimum: 0
      maximum: 1

training:
  datasource: transactions-db
  snapshot: required
  schedule: "0 2 * * *"  # Daily at 2 AM

inference:
  timeout: 100ms
  retries: 3
  cache:
    ttl: 60s
    key: [user_id, merchant_category]`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Configure a Datasource
        </h2>
        <p className="mt-4 text-muted-foreground">
          Define your data source in <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-primary">datasources/transactions-db.datasource.yaml</code>:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: transactions-db
type: postgresql

connection:
  host: \${POSTGRES_HOST}
  port: 5432
  database: transactions
  ssl: required

schema:
  table: transactions
  columns:
    - name: id
      type: uuid
      primary: true
    - name: amount
      type: decimal
    - name: merchant_category
      type: string
    - name: is_fraud
      type: boolean
    - name: created_at
      type: timestamp

snapshot:
  strategy: incremental
  column: created_at
  retention: 90d`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Validate Your Configuration
        </h2>
        <p className="mt-4 text-muted-foreground">
          Run the validate command to ensure your configuration is correct:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`pulse validate

✓ Configuration valid
✓ Model schema: fraud-detector (1.0.0)
✓ Datasource: transactions-db (postgresql)
✓ Snapshot strategy: incremental`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Train Your Model
        </h2>
        <p className="mt-4 text-muted-foreground">
          Trigger a training run with automatic snapshot creation:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`pulse train fraud-detector

→ Creating snapshot: transactions-db@2024-01-15T10:30:00Z
→ Snapshot created: snap_abc123
→ Training started: run_xyz789
→ Model artifact: fraud-detector@1.0.0-abc123
✓ Training complete in 4m 32s`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Deploy and Infer
        </h2>
        <p className="mt-4 text-muted-foreground">
          Deploy your model and run inference:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`pulse deploy fraud-detector

✓ Deployed: fraud-detector@1.0.0-abc123
→ Endpoint: https://api.pulse.dev/v1/infer/fraud-detector`}
            language="bash"
          />
        </div>
        <p className="mt-4 text-muted-foreground">
          Make inference requests:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`curl -X POST https://api.pulse.dev/v1/infer/fraud-detector \\
  -H "Authorization: Bearer \$PULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_amount": 1500.00,
    "merchant_category": "electronics",
    "user_history": []
  }'`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Next Steps</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>
            <a href="/docs/architecture" className="text-primary hover:underline">
              Learn about the architecture
            </a>{" "}
            - Understand how Pulse modules work together
          </li>
          <li>
            <a href="/docs/protocol" className="text-primary hover:underline">
              Explore the protocol
            </a>{" "}
            - Deep dive into model and datasource contracts
          </li>
          <li>
            <a href="/docs/datasources" className="text-primary hover:underline">
              Configure datasources
            </a>{" "}
            - Connect to your data infrastructure
          </li>
          <li>
            <a href="/docs/examples" className="text-primary hover:underline">
              View examples
            </a>{" "}
            - Real-world use cases and patterns
          </li>
        </ul>
      </section>
    </div>
  )
}
