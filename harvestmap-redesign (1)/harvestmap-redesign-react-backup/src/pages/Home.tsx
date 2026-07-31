import { useState } from "react";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import RipeThisWeek from "@/sections/RipeThisWeek";
import Finder from "@/sections/Finder";
import SeasonGuide from "@/sections/SeasonGuide";
import States from "@/sections/States";
import Guides from "@/sections/Guides";
import Growers from "@/sections/Growers";
import Footer from "@/sections/Footer";

export default function Home() {
  const [finderCrop, setFinderCrop] = useState<string | null>(null);

  const scrollToFinder = () => {
    document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePickCrop = (crop: string) => {
    setFinderCrop(crop);
    scrollToFinder();
  };

  const handleUseLocation = () => {
    scrollToFinder();
    // let the finder's own resolver run (it sets the pin + radius circle)
    setTimeout(() => (window as any).__finderLocate?.(), 400);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <Hero onFind={scrollToFinder} onUseLocation={handleUseLocation} />
        <RipeThisWeek onPickCrop={handlePickCrop} />
        <Finder selectedCrop={finderCrop} onCropChange={setFinderCrop} />
        <SeasonGuide onPickSeason={() => scrollToFinder()} />
        <States />
        <Guides />
        <Growers />
      </main>
      <Footer />
    </div>
  );
}
