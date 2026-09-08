"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="pro-btn solid"
    >
      <Printer className="h-4 w-4" /> Imprimer / Enregistrer en PDF
    </button>
  );
}
