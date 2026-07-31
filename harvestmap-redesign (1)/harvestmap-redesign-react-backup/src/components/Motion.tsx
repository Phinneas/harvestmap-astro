import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform, type Variants } from "framer-motion";

/** Count-up number that animates when scrolled into view. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState("0");
  const [fallback, setFallback] = useState(false);

  // Some headless/preview environments never fire intersection callbacks —
  // if nothing happens shortly after mount, just show the real value.
  useEffect(() => {
    const t = setTimeout(() => setFallback(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (inView || fallback) spring.set(value);
  }, [inView, fallback, value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v).toLocaleString()));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Fade/slide-up when scrolled into view. `i` = stagger index. */
export function Reveal({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={i}
    >
      {children}
    </motion.div>
  );
}

/** Card that tilts in 3D toward the cursor (spring-physics). */
export function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 260, damping: 20 });
  const ry = useSpring(0, { stiffness: 260, damping: 20 });
  const transform = useTransform(
    [rx, ry],
    ([x, y]) => `perspective(800px) rotateX(${x}deg) rotateY(${y}deg)`
  );

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
