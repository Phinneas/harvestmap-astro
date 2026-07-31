import { useState } from "react";
import { Navigation, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { CircleScribble, ArrowDoodle, StarDoodle } from "@/components/Doodles";
import LeafField from "@/components/LeafField";
import { CountUp } from "@/components/Motion";
import { listings, peakCounts } from "@/data/directory";
import { motion } from "framer-motion";

interface Props {
  onFind: () => void;
  onUseLocation: () => void;
}

export default function Hero({ onFind, onUseLocation }: Props) {
  const [locating, setLocating] = useState(false);
  const picking = peakCounts(listings).reduce((n, c) => n + c.picking, 0);
  const topCrops = peakCounts(listings).slice(0, 3).map((c) => c.name.toLowerCase());

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocating(false);
          onUseLocation();
        },
        () => {
          setLocating(false);
          onFind(); // fall through to the finder where they can type instead
        },
        { timeout: 6000 }
      );
    } else {
      setLocating(false);
      onFind();
    }
  };

  return (
    <section id="top" className="relative overflow-hidden pt-24">
      {/* three.js drifting leaves */}
      <LeafField className="z-0 opacity-90" />
      {/* scattered sparkles */}
      <StarDoodle className="absolute left-[6%] top-32 hidden size-6 lg:block" />
      <StarDoodle className="absolute right-[4%] top-56 hidden size-4 lg:block" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-8 md:grid-cols-[1.05fr_1fr] md:pt-12">
        {/* Copy + location CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-cream-deep px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ember">
            Late July · Week 31
          </p>

          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] tracking-tight text-pine-deep md:text-6xl">
            What&rsquo;s{" "}
            <span className="relative inline-block whitespace-nowrap">
              <em className="relative z-10 font-medium italic text-ember">ripe near you</em>
              <CircleScribble />
            </span>
            <br />
            this week
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
            <strong className="font-semibold text-pine-deep">
              <CountUp value={picking} /> farms
            </strong>{" "}
            are picking right now — {topCrops.join(", ")} at their peak. Tell us roughly where
            you are and we&rsquo;ll put the closest ones on the map.
          </p>

          {/* Location-first CTAs */}
          <div className="relative mt-7 max-w-lg">
            <ArrowDoodle className="absolute -top-14 right-2 hidden w-16 -scale-x-100 rotate-[-8deg] md:block" />
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <button
                onClick={handleLocate}
                disabled={locating}
                className="flex items-center gap-2 rounded-2xl bg-ember px-6 py-4 text-base font-semibold text-cream shadow-[0_8px_30px_rgba(196,99,44,0.35)] transition-all hover:bg-ember-deep hover:shadow-[0_10px_34px_rgba(196,99,44,0.45)]"
              >
                <Navigation className="size-5" />
                {locating ? "Finding you…" : "Use my location"}
              </button>
              <button
                onClick={onFind}
                className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-pine-deep ring-1 ring-ink/10 transition-colors hover:bg-cream-deep"
              >
                Enter a town or ZIP
                <ArrowRight className="size-4 text-ember transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/50">
            Season is estimated from growing zone, not confirmed by the farms — always call
            ahead.
          </p>
        </motion.div>

        {/* Illustration */}
        <motion.div
          className="relative rotate-[0.6deg]"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="doodle-ring" />
          <div className="overflow-hidden rounded-t-[10rem] rounded-b-3xl shadow-[0_24px_60px_rgba(46,79,62,0.25)] ring-1 ring-ink/10">
            <img
              src={hero}
              alt="Illustrated farm valley at golden hour"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
