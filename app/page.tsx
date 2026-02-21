import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TrustBanner from "@/components/sections/TrustBanner";
import CollectionsSection from "@/components/sections/CollectionsSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBanner />
        <CollectionsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
