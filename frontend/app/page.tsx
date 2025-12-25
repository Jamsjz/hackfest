import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import MasonryGallerySection from "@/components/masonry-gallery-section"
import CTASection from "@/components/cta-section"

export default function Home() {
  return (
    <main className="relative" style={{ position: "relative" }}>
      <Header />
      <HeroSection />
      <div className="relative z-10" style={{ position: "relative" }}>
        <MasonryGallerySection />
        <CTASection />
      </div>
    </main>
  )
}
