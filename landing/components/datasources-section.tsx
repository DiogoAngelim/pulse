import { Database, Server, Cloud, HardDrive, Globe } from "lucide-react"

const datasources = [
  {
    icon: <Database className="h-6 w-6" />,
    name: "PostgreSQL",
    description: "Full support with schema inspection and incremental extraction",
  },
  {
    icon: <Database className="h-6 w-6" />,
    name: "MySQL",
    description: "Read-only connections with allowlisted views and tables",
  },
  {
    icon: <Server className="h-6 w-6" />,
    name: "SQL Server",
    description: "Enterprise database support with cursor-based pagination",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    name: "Object Storage",
    description: "S3-compatible storage for snapshots and model artifacts",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    name: "HTTP",
    description: "REST API sources (coming soon)",
  },
]

const connectorMethods = [
  "inspectSchema()",
  "validateConnection()",
  "extractSnapshot()",
  "streamData()",
  "estimateSize()",
]

export function DatasourcesSection() {
  return (
    <section className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pluggable Datasources
            </h2>
            <p className="mt-4 text-muted-foreground">
              Connect to your existing data infrastructure with secure, read-only connectors 
              that enforce allowlists and encryption by default.
            </p>

            <div className="mt-8 space-y-4">
              {datasources.map((ds) => (
                <div
                  key={ds.name}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {ds.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{ds.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{ds.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-xl border border-border bg-card/30 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-semibold text-foreground">Connector Interface</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Every connector implements a standard interface for consistent behavior across all datasource types.
              </p>
              <div className="space-y-2">
                {connectorMethods.map((method) => (
                  <div
                    key={method}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <code className="font-mono text-sm text-foreground">{method}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
