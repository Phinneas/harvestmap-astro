import { useMemo, useState } from "react";
import { states } from "@/data/harvest";
import { Reveal } from "@/components/Motion";

export default function States() {
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(() => [...states].sort((a, b) => b.farms - a.farms), []);
  const visible = showAll ? sorted : sorted.slice(0, 18);

  return (
    <section id="states" className="mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">
            Browse by state
          </p>
          <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
            7,025 farms across 51 states
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ink/65">
            Pick a state to see all farms, farmers markets, CSAs, and agritourism listings in
            our database.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {visible.map((s, i) => (
          <Reveal key={s.name} i={i % 6}>
          <a
            key={s.name}
            href={`#state-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
            className={`group rounded-2xl p-4 ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(46,79,62,0.12)] ${
              i < 3 ? "bg-pine text-cream" : "bg-white"
            }`}
          >
            <p
              className={`font-display text-lg font-semibold leading-tight ${
                i < 3 ? "text-cream group-hover:text-harvest" : "text-pine-deep group-hover:text-ember"
              }`}
            >
              {s.name}
            </p>
            <p className={`mt-1 text-xs ${i < 3 ? "text-cream/65" : "text-ink/50"}`}>
              {s.farms} farms{s.enriched > 0 ? ` · ${s.enriched} enriched` : ""}
            </p>
          </a>
          </Reveal>
        ))}
      </div>

      {!showAll && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-pine ring-1 ring-ink/10 transition-colors hover:bg-cream-deep"
          >
            Show all 51 states
          </button>
        </div>
      )}
    </section>
  );
}
