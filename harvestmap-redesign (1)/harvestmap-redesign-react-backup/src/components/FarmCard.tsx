import { MapPin, ArrowRight } from "lucide-react";
import type { Farm, Season } from "@/data/harvest";

const seasonTheme: Record<Season, { band: string; sun: string }> = {
  Spring: { band: "bg-[#dce8d0]", sun: "#9db87f" },
  Summer: { band: "bg-[#f3dfae]", sun: "#e3a63b" },
  Autumn: { band: "bg-[#efd3b8]", sun: "#c4632c" },
  Winter: { band: "bg-[#dde6e8]", sun: "#8fa7ad" },
};

function BandArt({ season }: { season: Season }) {
  const t = seasonTheme[season];
  return (
    <div className={`relative h-28 overflow-hidden ${t.band}`}>
      <svg
        viewBox="0 0 400 112"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <circle cx="330" cy="38" r="20" fill={t.sun} opacity="0.9" />
        <path d="M0 78 Q 100 48 200 74 T 400 70 V112 H0 Z" fill="#2e4f3e" opacity="0.16" />
        <path d="M0 92 Q 120 66 240 88 T 400 86 V112 H0 Z" fill="#2e4f3e" opacity="0.22" />
      </svg>
    </div>
  );
}

export default function FarmCard({ farm }: { farm: Farm }) {
  return (
    <a
      href={`#farm-${farm.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(46,79,62,0.16)]"
    >
      <div className="relative">
        <BandArt season={farm.peak} />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-pine backdrop-blur">
            {farm.peak} peak
          </span>
        </div>
        {farm.inSeasonNow && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-pine px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream">
            <span className="live-dot" style={{ backgroundColor: "#a3c586" }} />
            In season now
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
          {farm.region}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-pine-deep group-hover:text-ember">
          {farm.name}
        </h3>
        <p className="mt-1 text-sm text-ink/60">U-pick: {farm.upick.join(", ")}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {farm.upick.slice(0, 4).map((c) => (
            <span
              key={c}
              className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-medium text-pine"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="flex items-center gap-1.5 text-sm text-ink/60">
            <MapPin className="size-4 text-ember" />
            {farm.location}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-ember">
            View
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
