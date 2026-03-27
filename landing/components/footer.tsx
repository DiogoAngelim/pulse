import Link from "next/link"
import { Github, Package } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Architecture", href: "/docs/architecture" },
    { label: "Protocol", href: "/docs/protocol" },
    { label: "Datasources", href: "/docs/datasources" },
  ],
  Documentation: [
    { label: "Getting Started", href: "/docs/getting-started" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Examples", href: "/docs/examples" },
    { label: "CLI Reference", href: "/docs/cli" },
  ],
  Community: [
    { label: "GitHub", href: "https://github.com/DiogoAngelim/pulse" },
    { label: "npm", href: "https://www.npmjs.com/package/@anthropic/pulse" },
    { label: "Contributing", href: "https://github.com/DiogoAngelim/pulse/blob/main/CONTRIBUTING.md" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Pulse</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Protocol-first, serverless-first AI runtime for safe model training and inference.
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                href="https://github.com/DiogoAngelim/pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.npmjs.com/package/@anthropic/pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="npm"
              >
                <Package className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pulse. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}
