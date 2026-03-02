import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PosterBanner from "@/components/sections/PosterBanner";
import HeroSection from "@/components/sections/HeroSection";
import TrustBanner from "@/components/sections/TrustBanner";
import CollectionsSection from "@/components/sections/CollectionsSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <PosterBanner />
      <main className="flex-1 w-full">
        <HeroSection />
        <TrustBanner />
        <CollectionsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
