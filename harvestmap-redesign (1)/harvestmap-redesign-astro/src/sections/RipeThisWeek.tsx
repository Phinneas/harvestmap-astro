import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CountUp } from "@/components/Motion";
import { listings, peakCounts, CROP_IMAGES } from "@/data/directory";

interface Props {
  onPickCrop: (crop: string) => void;
}

export default function RipeThisWeek({ onPickCrop }: Props) {
  const counts = peakCounts(listings).slice(0, 5);

  return (
    <section id="ripe" className="bg-cream-deep py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">
            Ripe this week
          </p>
          <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
            Late July belongs to the berries
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ink/65">
            Counts are worked out live from each farm&rsquo;s crops and its growing zone —
            tap a crop to filter the finder below.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {counts.map((c, i) => (
            <Reveal key={c.name} i={i}>
              <button
                onClick={() => onPickCrop(c.name)}
                className="group relative block w-full overflow-hidden rounded-3xl text-left ring-1 ring-ink/5 transition-shadow hover:shadow-[0_16px_40px_rgba(46,79,62,0.18)]"
              >
                <img
                  src={CROP_IMAGES[c.name] ?? CROP_IMAGES.default}
                  alt={c.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-deep/85 via-pine-deep/20 to-transparent" />
                {i === 0 && (
                  <span className="sticker absolute left-3 top-3 bg-harvest px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-pine-deep">
                    At peak
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-xl font-semibold text-cream">{c.name}</p>
                  <p className="mt-0.5 text-sm text-cream/80">
                    <CountUp value={c.picking} /> farms picking · <CountUp value={c.peak} /> at peak
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-sm text-ink/55">
          Estimated from growing zone, not confirmed by the farms — always call ahead.
          <a
            href="#finder"
            className="ml-auto hidden items-center gap-1.5 font-semibold text-ember sm:flex"
          >
            Find them near you <ArrowRight className="size-4" />
          </a>
        </p>
      </div>
    </section>
  );
}
