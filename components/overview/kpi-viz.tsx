"use client";

import { useEffect, useState } from "react";

const G = "var(--green)";
const G2 = "var(--green-2)";

export const VizSteps = () => (
  <svg width="68" height="32" viewBox="0 0 68 32" fill="none" stroke={G} strokeWidth="2">
    <path d="M1 31h10v-7h10v-7h10v-7h10v-5h14" strokeLinejoin="miter" />
  </svg>
);

export const VizBars = () => {
  const h = [10, 14, 12, 18, 16, 22, 26, 32];
  return (
    <svg width="62" height="32" viewBox="0 0 62 32">
      {h.map((v, i) => (
        <rect key={i} x={i * 8} y={32 - v} width="5" height={v} rx="1" fill={i === h.length - 1 ? G : G2} />
      ))}
    </svg>
  );
};

export function VizRing({ pct }: { pct: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="var(--line)" strokeWidth="3.5" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={G}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={on ? c * (1 - pct / 100) : c}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export const VizSpark = () => (
  <svg width="68" height="32" viewBox="0 0 68 32" fill="none" stroke={G} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M1 28 8 21 15 25 23 14 30 18 38 8 46 14 54 7 62 11 67 4" />
  </svg>
);
