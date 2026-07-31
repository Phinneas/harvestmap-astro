import { ShoppingBasket } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: ["Browse farms", "What's in season", "By state", "Guides", "Blog"],
    hrefs: ["#directory", "#seasons", "#states", "#guides", "#guides"],
  },
  {
    title: "For growers",
    links: ["List your farm", "Update your harvest", "Grower handbook", "Contact"],
    hrefs: ["#growers", "#growers", "#guides", "#growers"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-pine-deep pb-10 pt-16 text-cream">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-ember text-cream">
                <ShoppingBasket className="size-5" strokeWidth={1.8} />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">
                Harvest<span className="text-harvest">Map</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm leading-relaxed text-cream/65">
              Find what&rsquo;s ripe near you. A community directory of small farms, orchards,
              and growers — sorted by what they&rsquo;re harvesting right now.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/45">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l, i) => (
                  <li key={l}>
                    <a
                      href={col.hrefs[i]}
                      className="text-sm text-cream/75 transition-colors hover:text-harvest"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-sm text-cream/50 md:flex-row">
          <p>© 2026 HarvestMap. A demonstration of the HarvestMap design system.</p>
          <p className="font-display italic">Grown with sun, soil &amp; a little whimsy.</p>
        </div>
      </div>
    </footer>
  );
}
