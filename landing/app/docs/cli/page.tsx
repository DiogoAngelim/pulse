import { CodeBlock } from "@/components/code-block"

const commands = [
  {
    name: "init",
    description: "Initialize a new Pulse project",
    usage: "pulse init [project-name] [options]",
    options: [
      { flag: "--template", description: "Use a starter template", default: "default" },
      { flag: "--runtime", description: "Default runtime for models", default: "python3.11" },
    ],
  },
  {
    name: "validate",
    description: "Validate configuration files",
    usage: "pulse validate [options]",
    options: [
      { flag: "--config", description: "Path to config file", default: "pulse.yaml" },
      { flag: "--strict", description: "Fail on warnings", default: "false" },
    ],
  },
  {
    name: "snapshot",
    description: "Create a data snapshot",
    usage: "pulse snapshot <datasource> [options]",
    options: [
      { flag: "--force", description: "Force snapshot even if recent", default: "false" },
      { flag: "--dry-run", description: "Preview without creating", default: "false" },
    ],
  },
  {
    name: "train",
    description: "Train a model",
    usage: "pulse train <model> [options]",
    options: [
      { flag: "--snapshot", description: "Use specific snapshot", default: "latest" },
      { flag: "--watch", description: "Stream training logs", default: "true" },
      { flag: "--gpu", description: "Request GPU resources", default: "false" },
    ],
  },
  {
    name: "deploy",
    description: "Deploy a model to inference runtime",
    usage: "pulse deploy <model> [options]",
    options: [
      { flag: "--version", description: "Deploy specific version", default: "latest" },
      { flag: "--canary", description: "Canary deployment percentage", default: "0" },
      { flag: "--rollback", description: "Rollback to previous version", default: "false" },
    ],
  },
  {
    name: "infer",
    description: "Run inference on a deployed model",
    usage: "pulse infer <model> [options]",
    options: [
      { flag: "--input", description: "Input JSON or file path", default: "-" },
      { flag: "--output", description: "Output format", default: "json" },
    ],
  },
  {
    name: "lineage",
    description: "View lineage for a model or inference",
    usage: "pulse lineage <id> [options]",
    options: [
      { flag: "--depth", description: "Lineage depth to show", default: "full" },
      { flag: "--format", description: "Output format", default: "tree" },
    ],
  },
  {
    name: "drift",
    description: "Check for model drift",
    usage: "pulse drift <model> [options]",
    options: [
      { flag: "--baseline", description: "Baseline snapshot for comparison", default: "training" },
      { flag: "--threshold", description: "Drift detection threshold", default: "0.1" },
    ],
  },
]

export default function CLIPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        CLI Reference
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Complete reference for all Pulse command-line interface commands.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Installation</h2>
        <div className="mt-4">
          <CodeBlock
            code={`# Install globally with npm
npm install -g @anthropic/pulse

# Or with pnpm
pnpm add -g @anthropic/pulse

# Verify installation
pulse --version`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Global Options
        </h2>
        <p className="mt-4 text-muted-foreground">
          These options are available for all commands:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Flag
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --help, -h
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Show help for command
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --version, -v
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Show CLI version
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --config, -c
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Path to config file (default: pulse.yaml)
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --verbose
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Enable verbose output
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --json
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Output in JSON format
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  --quiet, -q
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Suppress non-error output
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Commands</h2>
        <div className="mt-6 space-y-8">
          {commands.map((cmd) => (
            <div
              key={cmd.name}
              className="rounded-lg border border-border bg-card/50 p-6"
            >
              <h3 className="text-xl font-semibold text-foreground">
                pulse {cmd.name}
              </h3>
              <p className="mt-2 text-muted-foreground">{cmd.description}</p>

              <h4 className="mt-4 text-sm font-semibold text-foreground">
                Usage
              </h4>
              <div className="mt-2">
                <code className="rounded bg-muted px-2 py-1 text-sm text-primary">
                  {cmd.usage}
                </code>
              </div>

              <h4 className="mt-4 text-sm font-semibold text-foreground">
                Options
              </h4>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {cmd.options.map((opt) => (
                      <tr key={opt.flag} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-primary font-mono">
                          {opt.flag}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {opt.description}
                        </td>
                        <td className="py-2 text-muted-foreground/60">
                          default: {opt.default}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Examples</h2>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          Full Workflow
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# Initialize project
pulse init fraud-detection

# Validate configuration
pulse validate

# Create a snapshot of training data
pulse snapshot transactions-db

# Train the model
pulse train fraud-detector --watch

# Deploy to production
pulse deploy fraud-detector

# Run inference
echo '{"amount": 1500, "merchant": "electronics"}' | pulse infer fraud-detector

# Check lineage
pulse lineage fraud-detector@latest

# Monitor for drift
pulse drift fraud-detector --threshold 0.05`}
            language="bash"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          CI/CD Integration
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# In your CI pipeline
pulse validate --strict
pulse train fraud-detector --snapshot snap_abc123
pulse deploy fraud-detector --canary 10

# After validation
pulse deploy fraud-detector --canary 100`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Environment Variables
        </h2>
        <p className="mt-4 text-muted-foreground">
          Configure Pulse behavior with environment variables:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  PULSE_API_KEY
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  API key for Pulse cloud services
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  PULSE_CONFIG
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Default config file path
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  PULSE_LOG_LEVEL
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Log level (debug, info, warn, error)
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-4 py-3 text-sm text-primary font-mono">
                  PULSE_CACHE_DIR
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  Local cache directory
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
