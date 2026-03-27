"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Book,
  Rocket,
  Layers,
  FileCode,
  Database,
  Terminal,
  Code,
  Boxes,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    icon: Rocket,
  },
  {
    title: "Architecture",
    href: "/docs/architecture",
    icon: Layers,
  },
  {
    title: "Protocol",
    href: "/docs/protocol",
    icon: FileCode,
  },
  {
    title: "Datasources",
    href: "/docs/datasources",
    icon: Database,
  },
  {
    title: "CLI Reference",
    href: "/docs/cli",
    icon: Terminal,
  },
  {
    title: "API Reference",
    href: "/docs/api",
    icon: Code,
  },
  {
    title: "Examples",
    href: "/docs/examples",
    icon: Boxes,
  },
]

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/30 lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
            <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Book className="h-4 w-4 text-primary" />
              Documentation
            </div>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-4xl px-6 py-12">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
