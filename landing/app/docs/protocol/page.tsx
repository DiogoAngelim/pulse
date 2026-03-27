import { CodeBlock } from "@/components/code-block"

export default function ProtocolPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Protocol
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The Pulse protocol defines explicit contracts for models and
        datasources, ensuring type safety and reproducibility.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Model Protocol
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every model in Pulse is defined by a protocol contract that specifies
          its inputs, outputs, training configuration, and inference behavior.
        </p>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          Basic Structure
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`model: <model-name>
version: <semver>
runtime: <runtime>

input:
  type: object
  properties:
    <field>:
      type: <type>
      description: <string>
      required: <boolean>

output:
  type: object
  properties:
    <field>:
      type: <type>

training:
  datasource: <datasource-ref>
  snapshot: required | optional | disabled
  schedule: <cron-expression>
  
inference:
  timeout: <duration>
  retries: <number>
  cache:
    ttl: <duration>
    key: [<fields>]`}
            language="yaml"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          Input/Output Types
        </h3>
        <p className="mt-4 text-muted-foreground">
          Pulse supports JSON Schema types with additional ML-specific
          extensions:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Example
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">string</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Text values
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                  {'"hello"'}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">number</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Numeric values (int or float)
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">42, 3.14</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">boolean</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  True/false values
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">true</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">array</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Lists of items
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">[1, 2, 3]</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">object</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Nested structures
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{'{"a": 1}'}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">tensor</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  N-dimensional arrays
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                  shape: [224, 224, 3]
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">embedding</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Vector embeddings
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">dim: 768</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Datasource Protocol
        </h2>
        <p className="mt-4 text-muted-foreground">
          Datasource contracts define how Pulse connects to and reads from your
          data infrastructure.
        </p>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          PostgreSQL Example
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: user-events
type: postgresql

connection:
  host: \${POSTGRES_HOST}
  port: 5432
  database: analytics
  ssl: required
  pool:
    min: 2
    max: 10

schema:
  table: events
  columns:
    - name: id
      type: uuid
      primary: true
    - name: user_id
      type: uuid
      index: true
    - name: event_type
      type: string
      enum: [click, view, purchase]
    - name: properties
      type: jsonb
    - name: created_at
      type: timestamp
      index: true

query:
  filter: "created_at >= NOW() - INTERVAL '90 days'"
  order_by: created_at DESC

snapshot:
  strategy: incremental
  column: created_at
  retention: 180d
  compression: zstd`}
            language="yaml"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          S3 Example
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: training-images
type: s3

connection:
  bucket: ml-training-data
  region: us-east-1
  credentials:
    access_key_id: \${AWS_ACCESS_KEY_ID}
    secret_access_key: \${AWS_SECRET_ACCESS_KEY}

schema:
  format: parquet
  partition_by: [date, category]
  columns:
    - name: image_path
      type: string
    - name: label
      type: string
    - name: confidence
      type: number

snapshot:
  strategy: full
  prefix: snapshots/
  retention: 365d`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Snapshot Strategies
        </h2>
        <p className="mt-4 text-muted-foreground">
          Pulse supports multiple snapshot strategies for different use cases:
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-primary">full</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete copy of the dataset. Best for small to medium datasets
              where incremental tracking is complex.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-primary">incremental</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Only captures changes since the last snapshot. Requires a
              timestamp or version column. Best for large, append-only datasets.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-primary">cdc</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Change Data Capture using database replication logs. Captures
              inserts, updates, and deletes. Best for mutable datasets.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Validation Rules
        </h2>
        <p className="mt-4 text-muted-foreground">
          Add validation rules to ensure data quality:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`input:
  type: object
  properties:
    age:
      type: number
      minimum: 0
      maximum: 150
    email:
      type: string
      format: email
    score:
      type: number
      multipleOf: 0.01
    tags:
      type: array
      minItems: 1
      maxItems: 10
      uniqueItems: true
    status:
      type: string
      enum: [pending, active, completed]`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Inference Configuration
        </h2>
        <p className="mt-4 text-muted-foreground">
          Fine-tune inference behavior with these options:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`inference:
  # Request timeout
  timeout: 100ms
  
  # Retry configuration
  retries: 3
  retry_backoff: exponential
  
  # Response caching
  cache:
    enabled: true
    ttl: 60s
    key: [user_id, request_type]
    invalidate_on: [model_deploy, drift_detected]
  
  # Batching for throughput
  batch:
    enabled: true
    max_size: 32
    max_wait: 10ms
  
  # Circuit breaker
  circuit_breaker:
    enabled: true
    failure_threshold: 5
    reset_timeout: 30s
  
  # A/B testing
  traffic:
    canary: 10%
    shadow: true`}
            language="yaml"
          />
        </div>
      </section>
    </div>
  )
}
