import { CodeBlock } from "@/components/code-block"

const modules = [
  {
    name: "Protocol Layer",
    description:
      "YAML-based contracts defining model schemas, input/output types, and validation rules. Ensures type safety across the entire pipeline.",
    color: "bg-emerald-500/20 border-emerald-500/50",
  },
  {
    name: "Snapshot Engine",
    description:
      "Immutable point-in-time captures of training data. Guarantees reproducibility and provides automatic rollback capabilities.",
    color: "bg-teal-500/20 border-teal-500/50",
  },
  {
    name: "Training Orchestrator",
    description:
      "Serverless training execution with automatic resource scaling. Supports distributed training across multiple workers.",
    color: "bg-cyan-500/20 border-cyan-500/50",
  },
  {
    name: "Inference Runtime",
    description:
      "Low-latency model serving with automatic batching, caching, and circuit breaker patterns for reliability.",
    color: "bg-sky-500/20 border-sky-500/50",
  },
  {
    name: "Lineage Tracker",
    description:
      "Complete audit trail from data ingestion through model deployment. Enables compliance and debugging.",
    color: "bg-blue-500/20 border-blue-500/50",
  },
  {
    name: "Drift Detector",
    description:
      "Continuous monitoring of model performance and data distribution. Triggers retraining when drift exceeds thresholds.",
    color: "bg-indigo-500/20 border-indigo-500/50",
  },
]

export default function ArchitecturePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Architecture
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Pulse is built on a modular, serverless-first architecture designed for
        safe, reproducible ML pipelines.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Design Principles
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-foreground">Protocol-First</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every model starts with an explicit contract. No implicit
              behaviors, no surprises in production.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-foreground">Serverless-Native</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Scale to zero when idle, scale infinitely under load. Pay only for
              what you use.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-foreground">
              Immutable by Default
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Training data is snapshotted before use. No silent data mutations
              can affect reproducibility.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="font-semibold text-foreground">Observable</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete lineage tracing from data source to deployed model.
              Debug any prediction.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Core Modules</h2>
        <p className="mt-4 text-muted-foreground">
          Pulse consists of six core modules that work together to provide a
          complete ML runtime:
        </p>
        <div className="mt-6 space-y-4">
          {modules.map((module) => (
            <div
              key={module.name}
              className={`rounded-lg border p-4 ${module.color}`}
            >
              <h3 className="font-semibold text-foreground">{module.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Data Flow</h2>
        <p className="mt-4 text-muted-foreground">
          Data flows through Pulse in a predictable, auditable manner:
        </p>
        <div className="mt-6 rounded-lg border border-border bg-card/50 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground">Data Ingestion</h4>
                <p className="text-sm text-muted-foreground">
                  Datasource connectors pull data from configured sources
                </p>
              </div>
            </div>
            <div className="ml-4 h-8 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Snapshot Creation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Immutable snapshot captured before any training begins
                </p>
              </div>
            </div>
            <div className="ml-4 h-8 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Schema Validation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Data validated against protocol contract
                </p>
              </div>
            </div>
            <div className="ml-4 h-8 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                4
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Training Execution
                </h4>
                <p className="text-sm text-muted-foreground">
                  Model trained on validated, snapshotted data
                </p>
              </div>
            </div>
            <div className="ml-4 h-8 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                5
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Artifact Storage
                </h4>
                <p className="text-sm text-muted-foreground">
                  Model artifacts stored with full lineage metadata
                </p>
              </div>
            </div>
            <div className="ml-4 h-8 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                6
              </div>
              <div>
                <h4 className="font-medium text-foreground">Deployment</h4>
                <p className="text-sm text-muted-foreground">
                  Model deployed to inference runtime with monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Lineage Example
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every inference can be traced back to its training data:
        </p>
        <div className="mt-4">
          <CodeBlock
            code={`pulse lineage inference_abc123

Inference: inference_abc123
├── Model: fraud-detector@1.0.0-def456
│   ├── Training Run: run_xyz789
│   │   ├── Started: 2024-01-15T02:00:00Z
│   │   ├── Duration: 4m 32s
│   │   └── Metrics:
│   │       ├── accuracy: 0.9847
│   │       └── f1_score: 0.9621
│   └── Snapshot: snap_abc123
│       ├── Datasource: transactions-db
│       ├── Created: 2024-01-15T01:59:45Z
│       ├── Rows: 1,247,832
│       └── Hash: sha256:e3b0c442...
├── Input Hash: sha256:a9f2d4...
└── Output Hash: sha256:7c8b1a...`}
            language="text"
          />
        </div>
      </section>
    </div>
  )
}
