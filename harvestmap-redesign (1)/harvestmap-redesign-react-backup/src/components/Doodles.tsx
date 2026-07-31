/** Hand-drawn doodle helpers — the "20% HowManyPlants" layer. */

/** Wavy squiggle underline as a data-URI background, tinted per link. */
export function squiggleStyle(color: string): React.CSSProperties {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='7' viewBox='0 0 24 7'><path d='M0 4 Q3 0.5 6 4 T12 4 T18 4 T24 4' fill='none' stroke='${encodeURIComponent(
    color
  )}' stroke-width='2.2' stroke-linecap='round'/></svg>`;
  return { ["--squiggle-url" as string]: `url("data:image/svg+xml,${svg}")` };
}

/** Loose hand-drawn circle scribble, used to ring a headline word. */
export function CircleScribble({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 90"
      fill="none"
      className={`pointer-events-none absolute -inset-x-4 -inset-y-2 h-auto w-[calc(100%+2rem)] ${className}`}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M12 52 C 8 22, 90 6, 148 10 C 200 14, 214 34, 210 52 C 206 74, 120 88, 66 82 C 24 77, 6 66, 14 44"
        stroke="#c4632c"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/** Curvy hand-drawn arrow (points down-right by default). */
export function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 70" fill="none" className={className} aria-hidden>
      <path
        d="M8 8 C 30 14, 62 26, 70 52"
        stroke="#2e4f3e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M56 46 L 71 54 L 62 38"
        stroke="#2e4f3e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Little 4-point sparkle/star doodle. */
export function StarDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2 C 12.8 7, 13.5 9.5, 22 12 C 13.5 14.5, 12.8 17, 12 22 C 11.2 17, 10.5 14.5, 2 12 C 10.5 9.5, 11.2 7, 12 2 Z"
        stroke="#e3a63b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
