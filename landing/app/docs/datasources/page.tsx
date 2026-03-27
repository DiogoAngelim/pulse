import { CodeBlock } from "@/components/code-block"
import { Database, HardDrive, Cloud, Globe, Snowflake } from "lucide-react"

const datasources = [
  {
    name: "PostgreSQL",
    icon: Database,
    description: "Connect to PostgreSQL databases with connection pooling and SSL support.",
    type: "postgresql",
  },
  {
    name: "Amazon S3",
    icon: HardDrive,
    description: "Read from S3 buckets with support for Parquet, CSV, and JSON formats.",
    type: "s3",
  },
  {
    name: "BigQuery",
    icon: Cloud,
    description: "Query Google BigQuery tables with automatic schema inference.",
    type: "bigquery",
  },
  {
    name: "Snowflake",
    icon: Snowflake,
    description: "Connect to Snowflake data warehouses with role-based access.",
    type: "snowflake",
  },
  {
    name: "HTTP API",
    icon: Globe,
    description: "Fetch data from REST APIs with authentication and pagination support.",
    type: "http",
  },
]

export default function DatasourcesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Datasources
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Pulse supports multiple datasource types out of the box. Each datasource
        is configured with a YAML contract that defines connection settings,
        schema, and snapshot behavior.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Supported Datasources
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {datasources.map((ds) => {
            const Icon = ds.icon
            return (
              <div
                key={ds.type}
                className="rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{ds.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      type: {ds.type}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {ds.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">PostgreSQL</h2>
        <p className="mt-4 text-muted-foreground">
          Connect to PostgreSQL databases with full support for connection
          pooling, SSL, and incremental snapshots.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: transactions
type: postgresql

connection:
  host: \${POSTGRES_HOST}
  port: 5432
  database: production
  user: \${POSTGRES_USER}
  password: \${POSTGRES_PASSWORD}
  ssl:
    mode: require
    ca: /path/to/ca.pem
  pool:
    min: 2
    max: 10
    idle_timeout: 30s

schema:
  table: transactions
  columns:
    - name: id
      type: uuid
      primary: true
    - name: user_id
      type: uuid
      index: true
    - name: amount
      type: decimal
      precision: 10
      scale: 2
    - name: status
      type: string
      enum: [pending, completed, failed]
    - name: created_at
      type: timestamp
      index: true

query:
  filter: "status = 'completed'"
  order_by: created_at DESC
  limit: 1000000

snapshot:
  strategy: incremental
  column: created_at
  retention: 90d`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Amazon S3</h2>
        <p className="mt-4 text-muted-foreground">
          Read data from S3 buckets with support for multiple file formats and
          partitioned data.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: training-data
type: s3

connection:
  bucket: ml-training-data
  region: us-east-1
  credentials:
    access_key_id: \${AWS_ACCESS_KEY_ID}
    secret_access_key: \${AWS_SECRET_ACCESS_KEY}
  # Or use IAM role
  # role_arn: arn:aws:iam::123456789:role/pulse-reader

path:
  prefix: datasets/v2/
  pattern: "**/*.parquet"

schema:
  format: parquet
  compression: snappy
  partition_by:
    - name: date
      type: date
      format: "YYYY-MM-DD"
    - name: region
      type: string
  columns:
    - name: user_id
      type: string
    - name: features
      type: array
      items:
        type: number
    - name: label
      type: string

snapshot:
  strategy: full
  output:
    bucket: ml-snapshots
    prefix: "snapshots/training-data/"
  retention: 365d
  compression: zstd`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">BigQuery</h2>
        <p className="mt-4 text-muted-foreground">
          Query Google BigQuery with automatic schema inference and cost
          controls.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: analytics-events
type: bigquery

connection:
  project: my-gcp-project
  credentials:
    type: service_account
    path: \${GOOGLE_APPLICATION_CREDENTIALS}
  location: US

query:
  dataset: analytics
  table: events
  # Or use a custom query
  # sql: |
  #   SELECT *
  #   FROM analytics.events
  #   WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)

schema:
  columns:
    - name: event_id
      type: string
      primary: true
    - name: user_id
      type: string
    - name: event_name
      type: string
    - name: properties
      type: json
    - name: timestamp
      type: timestamp

cost_control:
  max_bytes_billed: 10GB
  use_query_cache: true

snapshot:
  strategy: incremental
  column: timestamp
  retention: 180d`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Snowflake</h2>
        <p className="mt-4 text-muted-foreground">
          Connect to Snowflake data warehouses with support for role-based
          access and time travel.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: customer-data
type: snowflake

connection:
  account: xy12345.us-east-1
  user: \${SNOWFLAKE_USER}
  password: \${SNOWFLAKE_PASSWORD}
  warehouse: COMPUTE_WH
  database: PRODUCTION
  schema: PUBLIC
  role: DATA_READER

query:
  table: CUSTOMERS
  columns:
    - CUSTOMER_ID
    - EMAIL
    - CREATED_AT
    - LIFETIME_VALUE

schema:
  columns:
    - name: customer_id
      type: string
      primary: true
    - name: email
      type: string
    - name: created_at
      type: timestamp
    - name: lifetime_value
      type: decimal

snapshot:
  strategy: time_travel
  retention: 90d
  # Use Snowflake's time travel feature
  at: \${SNAPSHOT_TIMESTAMP}`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">HTTP API</h2>
        <p className="mt-4 text-muted-foreground">
          Fetch data from REST APIs with authentication, pagination, and rate
          limiting.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: external-api
type: http

connection:
  base_url: https://api.example.com/v1
  auth:
    type: bearer
    token: \${API_TOKEN}
  headers:
    Accept: application/json
    X-Custom-Header: value
  timeout: 30s
  retries: 3

request:
  method: GET
  path: /data/export
  query:
    format: json
    limit: 1000

pagination:
  type: cursor
  cursor_param: cursor
  cursor_path: meta.next_cursor
  has_more_path: meta.has_more

rate_limit:
  requests_per_second: 10
  burst: 20

schema:
  response_path: data
  columns:
    - name: id
      type: string
      primary: true
    - name: name
      type: string
    - name: attributes
      type: object

snapshot:
  strategy: full
  retention: 30d`}
            language="yaml"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Custom Datasource
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create custom datasource adapters for proprietary systems:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`datasource: custom-system
type: custom

adapter:
  # Path to custom adapter implementation
  module: ./adapters/custom_adapter.py
  class: CustomDataSourceAdapter

connection:
  # Custom connection parameters passed to adapter
  endpoint: https://custom.internal.com
  api_key: \${CUSTOM_API_KEY}

# Schema and snapshot config as usual
schema:
  columns:
    - name: id
      type: string
    - name: data
      type: object

snapshot:
  strategy: full
  retention: 90d`}
            language="yaml"
          />
        </div>
      </section>
    </div>
  )
}
