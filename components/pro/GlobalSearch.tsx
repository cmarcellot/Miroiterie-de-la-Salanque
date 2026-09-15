"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Users,
  FileText,
  ReceiptText,
  HardHat,
  Inbox,
  Box,
  type LucideIcon,
} from "lucide-react";
import type { SearchResult } from "@/app/api/pro/search/route";

const TYPE_ICON: Record<SearchResult["type"], LucideIcon> = {
  client: Users,
  devis: FileText,
  facture: ReceiptText,
  chantier: HardHat,
  demande: Inbox,
  prestation: Box,
};

const GROUP_ORDER: SearchResult["type"][] = [
  "client",
  "devis",
  "facture",
  "chantier",
  "demande",
  "prestation",
];

const GROUP_LABELS: Record<SearchResult["type"], string> = {
  client: "Clients",
  devis: "Devis",
  facture: "Factures",
  chantier: "Chantiers",
  demande: "Demandes site",
  prestation: "Catalogue",
};

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Cmd/Ctrl+K pour donner le focus à la recherche, où qu'on soit dans l'espace pro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const groups = useMemo(() => {
    return GROUP_ORDER.map((type) => ({
      type,
      items: results.filter((r) => r.type === type),
    })).filter((g) => g.items.length > 0);
  }, [results]);

  function go(r: SearchResult) {
    router.push(r.href);
    setOpen(false);
    setQ("");
  }

  const trimmed = q.trim();

  return (
    <div ref={boxRef} style={{ position: "relative", flex: 1, maxWidth: 420 }}>
      <div className="pro-search">
        <Search />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => trimmed.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Rechercher un client, un devis, une adresse…"
          autoComplete="off"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Effacer"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: "var(--ink-3)",
              display: "flex",
              cursor: "pointer",
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="pro-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            ⌘K
          </span>
        )}
      </div>

      {open && trimmed.length >= 2 && (
        <div className="pro-search-panel">
          {loading ? (
            <div className="pro-search-empty">Recherche…</div>
          ) : groups.length === 0 ? (
            <div className="pro-search-empty">
              <Search className="h-5 w-5" style={{ opacity: 0.4, marginBottom: 8 }} />
              <div>
                Aucun résultat pour «&nbsp;<strong>{trimmed}</strong>&nbsp;».
              </div>
            </div>
          ) : (
            groups.map((group) => {
              const Icon = TYPE_ICON[group.type];
              return (
                <div key={group.type} className="pro-search-group">
                  <div className="pro-search-head">
                    {GROUP_LABELS[group.type]} · {group.items.length}
                  </div>
                  {group.items.map((r, i) => (
                    <button
                      key={`${group.type}-${i}-${r.href}`}
                      type="button"
                      className="pro-search-item"
                      onClick={() => go(r)}
                    >
                      <span className="ico">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="tx">
                        <span className="nm">{r.title}</span>
                        <span className="sb">{r.subtitle}</span>
                      </span>
                      {r.meta && <span className="mt">{r.meta}</span>}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
