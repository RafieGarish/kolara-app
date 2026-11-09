"use client";

import { useEffect, useRef } from "react";
import { animate, inView, motion, useReducedMotion } from "framer-motion";

/** Elements that fade/slide up when they scroll into view. */
const REVEAL = [
  ".page-head", ".tabs-row", ".t-tabs-row", ".p-toolbar", ".cal-filters",
  ".kb-toolbar", ".kpi", ".card", ".ins-card", ".rep-card", ".cal-card", ".p-banner", ".p-meta",
].join(",");

const EASE = [0.22, 1, 0.36, 1] as const;
/**
 * Wraps each route (via app/template.tsx): a soft page-enter transition plus
 * scroll-reveal with stagger for headers, KPI cards and cards.
 */
export function PageMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Hide reveal targets after hydration so server and client markup stay identical.
  useEffect(() => {
    if (reduce) return;
    ref.current?.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      el.style.opacity = "0";
    });
  }, [reduce]);

  useEffect(() => {
    const root = ref.current;
    if (!root || reduce) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(REVEAL));
    let seen = 0;
    const stops = els.map((el) =>
      inView(
        el,
        () => {
          const delay = Math.min(seen++, 10) * 0.06;
          const a = animate(el, { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] }, { duration: 0.55, delay, ease: EASE });
          // clear inline styles afterwards so CSS hover transforms keep working
          a.finished.then(() => {
            el.style.opacity = "";
            el.style.transform = "";
          });
        },
        { amount: 0.15, margin: "0px 0px -6% 0px" },
      ),
    );
    // safety: anything that never intersects must not stay hidden
    const t = window.setTimeout(() => els.forEach((el) => { if (el.style.opacity === "0") el.style.opacity = ""; }), 4000);
    return () => {
      window.clearTimeout(t);
      stops.forEach((s) => s());
    };
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
