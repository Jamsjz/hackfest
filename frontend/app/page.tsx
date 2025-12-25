import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import MasonryGallerySection from "@/components/masonry-gallery-section";
import CTASection from "@/components/cta-section";
import GoogleTranslate from "@/components/GoogleTranslate"; // Import the new component

export default function Home() {
  return (
    <main className="relative" style={{ position: "relative" }}>
			<GoogleTranslate/>
      <Header />
      <HeroSection />
      <div className="relative" style={{ position: "relative" }}>
        <div className="relative z-10">
          <MasonryGallerySection />
        </div>
        <div className="relative z-20">
          <CTASection />
        </div>
      </div>
    </main>
  );
}

