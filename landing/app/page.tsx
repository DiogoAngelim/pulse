import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ArchitectureSection } from "@/components/architecture-section"
import { ProtocolSection } from "@/components/protocol-section"
import { DatasourcesSection } from "@/components/datasources-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function PulseLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ArchitectureSection />
        <ProtocolSection />
        <DatasourcesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
