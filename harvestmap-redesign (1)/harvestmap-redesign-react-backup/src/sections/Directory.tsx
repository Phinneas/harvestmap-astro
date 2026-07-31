import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import FarmCard from "@/components/FarmCard";
import { directoryFarms, stats, type Season } from "@/data/harvest";
import { motion, AnimatePresence } from "framer-motion";
import basket from "@/assets/basket.png";

const seasonFilters: (Season | "All seasons")[] = [
  "All seasons",
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
];

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  season: Season | "All seasons";
  onSeasonChange: (s: Season | "All seasons") => void;
}

export default function Directory({ query, onQueryChange, season, onSeasonChange }: Props) {
  const [local, setLocal] = useState(query);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directoryFarms.filter((f) => {
      const matchesSeason = season === "All seasons" || f.peak === season;
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.region.toLowerCase().includes(q) ||
        f.upick.some((c) => c.toLowerCase().includes(q));
      return matchesSeason && matchesQuery;
    });
  }, [query, season]);

  return (
    <section id="directory" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">
          The farm directory
        </p>
        <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
          Farms harvesting near you
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-ink/65">
          {stats.inSeasonNow} of {stats.withCropData.toLocaleString()} enriched growers are in
          season right now. {stats.farmsListed.toLocaleString()} farms in our national database.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onQueryChange(local);
          }}
          className="flex w-full max-w-md items-center gap-2 rounded-full bg-white p-1.5 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-ember/60"
        >
          <Search className="ml-3 size-4 shrink-0 text-ink/40" />
          <input
            value={local}
            onChange={(e) => {
              setLocal(e.target.value);
              onQueryChange(e.target.value);
            }}
            placeholder="Search farms, produce, or a place…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {seasonFilters.map((s) => (
            <button
              key={s}
              onClick={() => onSeasonChange(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                season === s
                  ? "bg-ember text-cream"
                  : "bg-white text-pine ring-1 ring-ink/10 hover:bg-cream-deep"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.slice(0, 9).map((f, i) => (
              <motion.div
                key={f.slug}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <FarmCard farm={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-3xl bg-cream-deep px-6 py-14 text-center">
          <img src={basket} alt="Empty harvest basket" className="w-36 rounded-full" />
          <h3 className="mt-5 font-display text-2xl font-semibold text-pine-deep">
            Nothing&rsquo;s sprouted here… yet
          </h3>
          <p className="mt-2 max-w-sm text-ink/60">
            No farms match that search just now. Try a different season, or clear your filters
            to see everyone.
          </p>
          <button
            onClick={() => {
              onQueryChange("");
              setLocal("");
              onSeasonChange("All seasons");
            }}
            className="mt-5 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-cream hover:bg-pine-deep"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <a
          href="#states"
          className="group flex items-center gap-2 rounded-full bg-pine px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-pine-deep"
        >
          Browse all {stats.farmsListed.toLocaleString()} farms by state
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
