import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import CraftGrid from "@/components/CraftGrid";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { getSessionUserId } from "@/lib/auth";

export default async function Home() {
  const isLoggedIn = Boolean(await getSessionUserId());

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero />
        <MarqueeStrip />
        <CraftGrid />
        <div className="seam" />
        <Features />
        <HowItWorks />
        <div className="seam" />
        <Community />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}