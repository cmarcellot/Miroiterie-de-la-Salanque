"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Kpi = {
  label: string;
  value: number;
  hint?: string;
  href: string;
  spark: string; // points for the <polyline>
  accent?: string;
};

function useCountUp(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function KpiCard({ kpi, run }: { kpi: Kpi; run: boolean }) {
  const n = useCountUp(kpi.value, run);
  const stroke = kpi.accent ?? "var(--acier)";
  return (
    <Link href={kpi.href} className="pro-card pro-kpi">
      <div className="pro-lab">{kpi.label}</div>
      <div className="v">{n.toLocaleString("fr-FR")}</div>
      {kpi.hint && <div className="d">{kpi.hint}</div>}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <polyline
          points={kpi.spark}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
        />
      </svg>
    </Link>
  );
}

export default function Kpis({ items }: { items: Kpi[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="pro-kpis" ref={ref}>
      {items.map((k) => (
        <KpiCard key={k.label} kpi={k} run={run} />
      ))}
    </div>
  );
}
