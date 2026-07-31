import { useEffect, useState } from "react";
import { ShoppingBasket, Menu, X, Sprout, ArrowRight } from "lucide-react";
import { squiggleStyle } from "@/components/Doodles";

const links = [
  { label: "Browse farms", href: "#directory", color: "#c4632c" },
  { label: "What's in season", href: "#seasons", color: "#e3a63b" },
  { label: "By state", href: "#states", color: "#7d8b6f" },
  { label: "Guides", href: "#guides", color: "#2e4f3e" },
];

const stripItems = [
  "Peak blueberry week — 37 NC farms picking",
  "Blackberries and peaches are on too",
  "Season estimated from growing zone — call ahead",
  "Free for small farms, forever",
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* HMP-style announcement strip */}
      <div className="fixed inset-x-0 top-0 z-50 overflow-hidden bg-ember py-1.5 text-cream">
        <a href="#now" className="marquee-track block text-xs font-semibold tracking-wide">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex items-center">
              {[...stripItems, ...stripItems].map((item, i) => (
                <span key={`${dup}-${i}`} className="mx-6 flex items-center gap-2">
                  <Sprout className="size-3.5 shrink-0" />
                  {item}
                  <ArrowRight className="size-3 shrink-0 opacity-70" />
                </span>
              ))}
            </span>
          ))}
        </a>
      </div>

      <header
        className={`fixed inset-x-0 top-7 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-cream/90 shadow-[0_1px_0_rgba(44,42,34,0.08)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-ember text-cream sticker-tilt-l">
              <ShoppingBasket className="size-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-pine-deep">
              Harvest<span className="text-ember">Map</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={squiggleStyle(l.color)}
                className="squiggle text-sm font-medium text-ink/75 transition-colors hover:text-pine-deep"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#growers"
              className="sticker sticker-tilt-r border-2 border-pine bg-cream px-4 py-2 text-sm font-semibold text-pine-deep transition-all hover:bg-pine hover:text-cream"
            >
              List your farm
            </a>
          </div>

          <button
            className="grid size-10 place-items-center rounded-lg text-pine-deep md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-ink/10 bg-cream px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink/80"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#growers"
                onClick={() => setOpen(false)}
                className="mt-2 w-fit rounded-full bg-pine px-4 py-2 text-sm font-semibold text-cream"
              >
                List your farm
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
