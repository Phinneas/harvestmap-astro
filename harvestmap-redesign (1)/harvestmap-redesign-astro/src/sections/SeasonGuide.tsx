import { ArrowRight, Leaf, Sun, TreeDeciduous, Snowflake } from "lucide-react";
import { Reveal, TiltCard } from "@/components/Motion";
import { seasons, type Season } from "@/data/harvest";

const icons: Record<Season, React.ReactNode> = {
  Spring: <Leaf className="size-5" />,
  Summer: <Sun className="size-5" />,
  Autumn: <TreeDeciduous className="size-5" />,
  Winter: <Snowflake className="size-5" />,
};

const cardTheme: Record<Season, string> = {
  Spring: "bg-[#eef3e4]",
  Summer: "bg-[#f9eecd]",
  Autumn: "bg-[#f6e3cd]",
  Winter: "bg-[#e8eef0]",
};

interface Props {
  onPickSeason?: (s: Season) => void;
}

export default function SeasonGuide({ onPickSeason }: Props) {
  // Default for Astro island usage: just scroll to the finder.
  const pickSeason =
    onPickSeason ??
    (() => document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" }));
  return (
    <section id="seasons" className="bg-cream-deep py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">
            The season guide
          </p>
          <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
            What&rsquo;s ripe, by season
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ink/65">
            Eat with the calendar. Here&rsquo;s the rhythm of the year across our growers —
            tap a season to find who&rsquo;s harvesting.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {seasons.map((s, idx) => (
            <Reveal key={s.name} i={idx}>
            <TiltCard max={8}>
            <button
              onClick={() => pickSeason(s.name)}
              className={`group relative flex h-full w-full flex-col rounded-3xl p-6 text-left ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(46,79,62,0.14)] ${cardTheme[s.name]}`}
            >
              {s.current && (
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-pine px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                  <span className="live-dot" style={{ backgroundColor: "#a3c586" }} />
                  Now
                </span>
              )}
              <span className="grid size-11 place-items-center rounded-2xl bg-white/70 text-pine">
                {icons[s.name]}
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-pine-deep">
                {s.name}
              </h3>
              <p className="mt-0.5 text-sm italic text-ink/55">{s.tagline}</p>

              <ul className="mt-4 space-y-2.5">
                {s.crops.map((c) => (
                  <li key={c.name} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-ink/80">{c.name}</span>
                    <span className="shrink-0 text-xs text-ink/50">{c.months}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-5 flex items-center gap-1.5 pt-1 text-sm font-semibold text-ember">
                {s.farmCount} farms in {s.name.toLowerCase()}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
