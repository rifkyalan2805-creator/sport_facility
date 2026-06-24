import Navbar from "@/components/Navbar";
import Hero from "@/components/hero/Hero";
import FacilitiesGallery from "@/components/FacilitiesGallery";
import PadelShowcase from "@/components/PadelShowcase";
import SwimmingShowcase from "@/components/SwimmingShowcase";
import SpreadHero from "@/components/SpreadHero";
import WhyUsStats from "@/components/WhyUsStats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FacilitiesGallery />
        <PadelShowcase />
        <SwimmingShowcase />
        <SpreadHero />
        <WhyUsStats />
      </main>
      <Footer />
    </>
  );
}
