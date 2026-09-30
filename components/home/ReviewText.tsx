"use client";

import { useState } from "react";

// Au-delà, le texte est tronqué avec un bouton "Lire la suite".
const LONG_TEXT = 260;

export default function ReviewText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > LONG_TEXT;

  return (
    <div className="mt-3 text-sm leading-relaxed text-slate-600">
      <p className={`whitespace-pre-line ${long && !open ? "line-clamp-5" : ""}`}>
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-1 font-semibold text-royal hover:underline"
        >
          {open ? "Réduire" : "Lire la suite"}
        </button>
      )}
    </div>
  );
}
