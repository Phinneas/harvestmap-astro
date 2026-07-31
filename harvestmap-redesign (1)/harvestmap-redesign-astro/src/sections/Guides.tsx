import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, TiltCard } from "@/components/Motion";

const guides = [
  {
    season: "Summer",
    crop: "Peaches",
    title: "Peach Picking in the Southeast: Stone Fruit Season",
    blurb:
      "Nothing tastes like a tree-ripe peach eaten in the orchard. A guide to picking peaches and nectarines at u-pick farms.",
    region: "Southeast",
    theme: "bg-[#f9eecd]",
  },
  {
    season: "Summer",
    crop: "Blueberries",
    title: "Blueberry Picking in the Pacific Northwest",
    blurb:
      "When blueberries ripen in Oregon and Washington, what to bring, and how to pick the best berries.",
    region: "Pacific Northwest",
    theme: "bg-[#eef3e4]",
  },
  {
    season: "Autumn",
    crop: "Apples",
    title: "Apple Picking in the Northeast: A Fall Tradition",
    blurb:
      "When to go, what varieties to expect, and how to choose — across New York, Massachusetts, Vermont, and Maine.",
    region: "Northeast",
    theme: "bg-[#f6e3cd]",
  },
];

export default function Guides() {
  return (
    <section id="guides" className="bg-cream-deep py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember">
              Harvest guides
            </p>
            <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
              What to pick, and how
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink/65">
              When to go, what to bring, which varieties to look for, and how to pick the best
              fruit.
            </p>
          </div>
          <a
            href="#guides"
            className="group flex items-center gap-1.5 text-sm font-semibold text-ember"
          >
            All guides
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {guides.map((g, idx) => (
            <Reveal key={g.title} i={idx}>
            <TiltCard max={6}>
            <a
              key={g.title}
              href="#guides"
              className={`group flex flex-col rounded-3xl p-7 ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(46,79,62,0.14)] ${g.theme}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-pine">
                    {g.season}
                  </span>
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-pine">
                    {g.crop}
                  </span>
                </div>
                <ArrowUpRight className="size-5 text-pine/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold leading-snug text-pine-deep group-hover:text-ember">
                {g.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{g.blurb}</p>
              <p className="mt-auto pt-5 text-xs font-semibold uppercase tracking-wider text-ink/45">
                {g.region}
              </p>
            </a>
            </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
