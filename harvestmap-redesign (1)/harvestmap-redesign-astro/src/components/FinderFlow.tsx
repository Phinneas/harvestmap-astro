import { useState } from "react";
import RipeThisWeek from "@/sections/RipeThisWeek";
import Finder from "@/sections/Finder";

/**
 * One island wrapping "Ripe this week" + the finder so the crop-pick
 * state flows between them (islands can't share React state).
 */
export default function FinderFlow() {
  const [finderCrop, setFinderCrop] = useState<string | null>(null);

  const scrollToFinder = () => {
    document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePickCrop = (crop: string) => {
    setFinderCrop(crop);
    scrollToFinder();
  };

  return (
    <>
      <RipeThisWeek onPickCrop={handlePickCrop} />
      <Finder selectedCrop={finderCrop} onCropChange={setFinderCrop} />
    </>
  );
}
