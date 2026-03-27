import { ArrowRight, Github } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PulseLine } from "./pulse-line"
import { GridBackground } from "./grid-background"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <GridBackground className="absolute inset-0" />
      
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.18_165/0.1),transparent_70%)]" />
      
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Protocol-first AI Runtime
          </div>

          {/* Main heading */}
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Safe model training,{" "}
            <span className="text-primary">inference</span>, and{" "}
            <span className="text-primary">self-retraining</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            A serverless-first AI runtime with explicit contracts, snapshot-before-training enforcement, 
            and complete lineage tracing for reproducible, auditable ML pipelines.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/docs/getting-started">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="https://github.com/DiogoAngelim/pulse" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "100%", label: "Reproducible" },
              { value: "Zero", label: "Mutable Training Data" },
              { value: "Full", label: "Lineage Tracing" },
              { value: "5+", label: "Datasource Types" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated pulse line */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <PulseLine className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}
