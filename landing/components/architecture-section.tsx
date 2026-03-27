"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const architectureItems = [
  {
    id: "apps",
    label: "Apps",
    children: [
      { name: "api/", description: "HTTP API exposing named protocol operations" },
      { name: "worker/", description: "Background orchestration for recovery and retraining" },
    ],
  },
  {
    id: "packages",
    label: "Packages",
    children: [
      { name: "contracts/", description: "Explicit versioned Pulse envelopes and payloads" },
      { name: "runtime/", description: "Orchestration engine and state transitions" },
      { name: "core/", description: "Domain entities, lineage, and policy logic" },
      { name: "storage/", description: "Metadata stores, object stores, and encryption" },
      { name: "ml/", description: "Feature building, training, evaluation, drift" },
      { name: "connectors/", description: "Pluggable datasource connectors" },
      { name: "sdk/", description: "API client for Pulse operations" },
    ],
  },
]

export function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState("apps")

  return (
    <section id="architecture" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Modular Architecture
            </h2>
            <p className="mt-4 text-muted-foreground">
              Clean separation of concerns with explicit boundaries. Each package has a single 
              responsibility and communicates through well-defined interfaces.
            </p>

            <div className="mt-8 flex gap-2">
              {architectureItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {architectureItems
                .find((item) => item.id === activeTab)
                ?.children.map((child) => (
                  <div
                    key={child.name}
                    className="rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/30"
                  >
                    <code className="font-mono text-sm text-primary">{child.name}</code>
                    <p className="mt-1 text-sm text-muted-foreground">{child.description}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="relative">
            {/* Visual diagram */}
            <div className="rounded-xl border border-border bg-card/30 p-8 backdrop-blur-sm">
              <div className="flex flex-col gap-6">
                {/* API Layer */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                    API Layer
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-card px-3 py-2 text-xs text-foreground">
                      POST /mutations/:name
                    </div>
                    <div className="rounded bg-card px-3 py-2 text-xs text-foreground">
                      POST /queries/:name
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Runtime Layer */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Runtime
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Register", "Extract", "Train", "Evaluate", "Promote", "Predict"].map((op) => (
                      <div key={op} className="rounded bg-card px-2 py-1.5 text-center text-xs text-foreground">
                        {op}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Storage Layer */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Storage
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-card px-3 py-2 text-center text-xs text-foreground">
                      Metadata Store
                    </div>
                    <div className="rounded bg-card px-3 py-2 text-center text-xs text-foreground">
                      Object Store
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
