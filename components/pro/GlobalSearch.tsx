"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  FileText,
  ReceiptText,
  HardHat,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { SearchResult } from "@/app/api/pro/search/route";

const TYPE_META: Record<SearchResult["type"], { icon: LucideIcon; label: string }> = {
  client: { icon: Users, label: "Client" },
  devis: { icon: FileText, label: "Devis" },
  facture: { icon: ReceiptText, label: "Facture" },
  chantier: { icon: HardHat, label: "Chantier" },
  demande: { icon: Inbox, label: "Demande" },
};

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
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
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/pro/search?q=${encodeURIComponent(query)}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data: { results: SearchResult[] }) => {
          setResults(Array.isArray(data.results) ? data.results : []);
          setActive(0);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  function go(r: SearchResult) {
    router.push(r.href);
    setOpen(false);
    setQ("");
  }

  return (
    <div ref={boxRef} style={{ position: "relative", flex: 1, maxWidth: 420 }}>
      <div className="pro-search">
        <Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Rechercher un client, un devis, une demande…"
          autoComplete="off"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="pro-search-panel">
          {loading ? (
            <div className="pro-search-empty">Recherche…</div>
          ) : results.length === 0 ? (
            <div className="pro-search-empty">Aucun résultat.</div>
          ) : (
            results.map((r, i) => {
              const meta = TYPE_META[r.type];
              const Icon = meta.icon;
              return (
                <button
                  key={`${r.type}-${r.href}`}
                  type="button"
                  className={`pro-search-item${i === active ? " active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                >
                  <span className="ico">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="tx">
                    <span className="nm">{r.label}</span>
                    {r.sublabel && <span className="sb">{r.sublabel}</span>}
                  </span>
                  <span className="tp">{meta.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
