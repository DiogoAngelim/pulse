import { ArrowRight, Terminal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="docs" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to build safe ML pipelines?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get started with Pulse in minutes. Clone the repository, run the API, 
                and start building reproducible, auditable AI systems.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/docs/getting-started">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link href="/docs">Read the Docs</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background/80 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Quick Start</span>
              </div>
              <pre className="overflow-x-auto font-mono text-sm">
                <code className="text-foreground">
                  <span className="text-muted-foreground"># Clone and install</span>
                  {"\n"}
                  <span className="text-primary">git clone</span> https://github.com/DiogoAngelim/pulse
                  {"\n"}
                  <span className="text-primary">cd</span> pulse
                  {"\n"}
                  <span className="text-primary">npm</span> install
                  {"\n\n"}
                  <span className="text-muted-foreground"># Start the API and worker</span>
                  {"\n"}
                  <span className="text-primary">npm run</span> start:api
                  {"\n"}
                  <span className="text-primary">npm run</span> start:worker
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
