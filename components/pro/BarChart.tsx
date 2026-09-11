"use client";

import { useEffect, useState } from "react";

export type BarDatum = { label: string; value: number; highlight?: boolean };

/** Graphe barres animé — repris du prototype (data/valeur -> hauteur, montée au montage). */
export default function BarChart({
  data,
  height = 180,
  color = "var(--marine)",
  format = (v: number) => String(v),
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, []);

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height,
          padding: "0 4px",
        }}
      >
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 28);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
              }}
            >
              <div
                className="pro-mono"
                style={{ fontSize: 10, color: "var(--ink-3)", whiteSpace: "nowrap" }}
              >
                {d.value > 0 ? format(d.value) : ""}
              </div>
              <div
                style={{
                  width: "100%",
                  height: grown ? Math.max(h, 2) : 0,
                  background: d.highlight
                    ? color
                    : `color-mix(in oklab, ${color} 55%, transparent)`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 600ms cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 4px 0",
          borderTop: "1px solid var(--line)",
          marginTop: 4,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: d.highlight ? "var(--ink)" : "var(--ink-3)",
              fontWeight: d.highlight ? 500 : 400,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
