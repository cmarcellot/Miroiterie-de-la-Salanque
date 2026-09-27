"use client";

import { useEffect, useState } from "react";
import { formatEUR } from "@/lib/pro-enums";

export type BarDatum = { label: string; value: number; highlight?: boolean };

/**
 * Formatage de la valeur au-dessus de chaque barre. Une chaîne, pas une
 * fonction : ce composant est un Client Component et reçoit ses props
 * depuis des Server Components (pages) — une fonction ne traverserait pas
 * la frontière serveur/client.
 *   "eur"     -> montant compact ("1 234 k€" au-delà de 1000, sinon formatEUR)
 *   "raw"     -> le nombre brut
 */
export type BarFormat = "eur" | "raw";

function formatValue(v: number, mode: BarFormat) {
  if (mode === "raw") return String(v);
  return v >= 1000 ? `${Math.round(v / 1000)}k€` : formatEUR(v);
}

/** Valeur exacte affichée dans l'infobulle au survol. */
function formatExact(v: number, mode: BarFormat) {
  return mode === "raw" ? String(v) : formatEUR(v);
}

// Hauteur approximative de l'infobulle, pour qu'elle ne déborde pas au-dessus du graphe.
const TOOLTIP_H = 38;

/** Graphe barres animé — repris du prototype (data/valeur -> hauteur, montée au montage). */
export default function BarChart({
  data,
  height = 180,
  color = "var(--marine)",
  format = "eur",
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
  format?: BarFormat;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, []);

  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const last = data.length - 1;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 8,
          height,
          padding: "0 4px",
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 28);
          const barH = grown ? Math.max(h, 2) : 0;
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              aria-label={`${d.label} : ${formatExact(d.value, format)}`}
              onMouseEnter={() => setHovered(i)}
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
                cursor: "default",
              }}
            >
              <div
                className="pro-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-3)",
                  whiteSpace: "nowrap",
                  visibility: isHovered ? "hidden" : "visible",
                }}
              >
                {d.value > 0 ? formatValue(d.value, format) : ""}
              </div>
              <div
                style={{
                  width: "100%",
                  height: barH,
                  background: d.highlight || isHovered
                    ? color
                    : `color-mix(in oklab, ${color} 55%, transparent)`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 600ms cubic-bezier(.2,.8,.2,1), background 150ms",
                }}
              />
              {isHovered && (
                <div
                  role="tooltip"
                  style={{
                    position: "absolute",
                    bottom: Math.min(barH + 6, height - TOOLTIP_H),
                    ...(i === 0
                      ? { left: 0 }
                      : i === last
                        ? { right: 0 }
                        : { left: "50%", transform: "translateX(-50%)" }),
                    zIndex: 5,
                    padding: "5px 9px",
                    borderRadius: 8,
                    background: "var(--ink)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    boxShadow: "0 4px 14px rgba(19, 32, 51, 0.18)",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{d.label}</div>
                  <div className="pro-mono" style={{ fontSize: 12, fontWeight: 600 }}>
                    {formatExact(d.value, format)}
                  </div>
                </div>
              )}
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
