import Link from "next/link"
import {
  Rocket,
  Layers,
  FileCode,
  Database,
  Terminal,
  Code,
  Boxes,
  ArrowRight,
} from "lucide-react"

const sections = [
  {
    title: "Getting Started",
    description: "Install Pulse and create your first model configuration in minutes.",
    href: "/docs/getting-started",
    icon: Rocket,
  },
  {
    title: "Architecture",
    description: "Understand the modular, serverless-first architecture of Pulse.",
    href: "/docs/architecture",
    icon: Layers,
  },
  {
    title: "Protocol",
    description: "Learn about explicit contracts and type-safe model definitions.",
    href: "/docs/protocol",
    icon: FileCode,
  },
  {
    title: "Datasources",
    description: "Connect to PostgreSQL, S3, BigQuery, Snowflake, and custom HTTP APIs.",
    href: "/docs/datasources",
    icon: Database,
  },
  {
    title: "CLI Reference",
    description: "Complete reference for all Pulse CLI commands.",
    href: "/docs/cli",
    icon: Terminal,
  },
  {
    title: "API Reference",
    description: "Detailed API documentation for programmatic access.",
    href: "/docs/api",
    icon: Code,
  },
  {
    title: "Examples",
    description: "Real-world examples and use cases to get you started.",
    href: "/docs/examples",
    icon: Boxes,
  },
]

export default function DocsPage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn how to use Pulse to build safe, reproducible ML pipelines with
          explicit contracts and complete lineage tracing.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                {section.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {section.description}
              </p>
              <div className="flex items-center gap-1 text-sm text-primary">
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
