import {
  Shield,
  Database,
  GitBranch,
  Repeat,
  Lock,
  Zap,
} from "lucide-react"
import { FeatureCard } from "./feature-card"

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Protocol-First Contracts",
    description:
      "Explicit versioned envelopes like pulse.source.sql.extract.v1 ensure clear, typed communication across all operations.",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Snapshot-Before-Training",
    description:
      "Training never runs on mutable live data. Every job uses a versioned dataset snapshot for complete reproducibility.",
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: "Full Lineage Tracing",
    description:
      "Track every prediction back to its source data, model version, and training configuration with complete audit trails.",
  },
  {
    icon: <Repeat className="h-6 w-6" />,
    title: "Self-Retraining",
    description:
      "Automatic retraining decisions driven by drift detection, feedback signals, data freshness, and scheduled policies.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Read-Only Datasources",
    description:
      "Encrypted connection configs with allowlisted SQL objects. No arbitrary queries—only predefined, safe extractions.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Serverless-First",
    description:
      "Externalized metadata and object storage design. Scale to zero when idle, burst when needed.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Core Guarantees
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Built from the ground up for safe, reproducible, and auditable ML operations
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
