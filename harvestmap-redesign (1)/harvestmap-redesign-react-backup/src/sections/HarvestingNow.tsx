import { ArrowRight } from "lucide-react";
import { confirmedFarms } from "@/data/harvest";
import { Reveal } from "@/components/Motion";

export default function HarvestingNow() {
  return (
    <section id="now" className="bg-pine-deep py-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-harvest">
              <span className="live-dot" style={{ backgroundColor: "#a3c586" }} />
              Fresh off the farm wire
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-cream">
              Harvesting right now
            </h2>
          </div>
          <a
            href="#directory"
            className="flex items-center gap-1.5 text-sm font-semibold text-cream/80 transition-colors hover:text-harvest"
          >
            Browse this week&rsquo;s harvest <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="no-scrollbar -mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-2 snap-x">
          {confirmedFarms.map((f, i) => (
            <Reveal key={f.slug} i={i} className="w-64 shrink-0 snap-start">
            <a
              key={f.slug}
              href={`#farm-${f.slug}`}
              className={`group block rounded-2xl bg-pine p-5 ring-1 ring-cream/10 transition-all hover:bg-[#2a4636] ${
                i % 2 === 0 ? "sticker-tilt-l" : "sticker-tilt-r"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cream/50">
                  {f.region}
                </span>
                {f.harvestingNow && (
                  <span className="sticker flex items-center gap-1.5 bg-[#3d5c43] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b7d69b]">
                    <span className="live-dot" style={{ backgroundColor: "#a3c586" }} />
                    Now
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-cream group-hover:text-harvest">
                {f.name}
              </h3>
              <p className="mt-1 text-sm text-cream/60">{f.location}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/75">
                {f.upick.slice(0, 3).join(" · ")}
              </p>
            </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
