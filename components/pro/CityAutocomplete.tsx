"use client";

import { useEffect, useRef, useState } from "react";

type Commune = { nom: string; codesPostaux: string[] };

/**
 * Deux champs liés : Code postal + Ville, avec auto-complétion via
 * l'API geo.api.gouv.fr (communes françaises, gratuit, sans clé).
 */
export default function CityAutocomplete({
  defaultZip = "",
  defaultCity = "",
}: {
  defaultZip?: string;
  defaultCity?: string;
}) {
  const [zip, setZip] = useState(defaultZip);
  const [city, setCity] = useState(defaultCity);
  const [results, setResults] = useState<Commune[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<"zip" | "city" | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!active) return;
    const q = active === "zip" ? zip.trim() : city.trim();
    const isZip = active === "zip";
    if (isZip ? q.length !== 5 : q.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const url = isZip
      ? `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(
          q
        )}&fields=nom,codesPostaux&limit=10`
      : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
          q
        )}&fields=nom,codesPostaux&boost=population&limit=7`;
    const t = setTimeout(() => {
      fetch(url, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Commune[]) => {
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [zip, city, active]);

  function pick(c: Commune, cp?: string) {
    setCity(c.nom);
    setZip(cp || c.codesPostaux[0] || "");
    setOpen(false);
    setResults([]);
    setActive(null);
  }

  const field =
    "pro-field";

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <label className="pro-lbl">Code postal &amp; ville</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr",
          gap: 12,
          marginTop: 6,
        }}
      >
        <input
          name="zip"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
          onFocus={() => setActive("zip")}
          placeholder="Code postal"
          inputMode="numeric"
          className={field}
          autoComplete="off"
        />
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => setActive("city")}
          placeholder="Ville (ou tapez le nom)"
          className={field}
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="pro-ac">
          {results.flatMap((c) =>
            (active === "zip" ? [zip] : c.codesPostaux.slice(0, 3)).map((cp) => (
              <li key={`${c.nom}-${cp}`}>
                <button type="button" onClick={() => pick(c, cp)}>
                  <span>{c.nom}</span>
                  <span className="cp">{cp}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
