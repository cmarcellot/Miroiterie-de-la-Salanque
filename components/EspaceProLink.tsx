"use client";

import { useEspacePro } from "@/components/EspaceProProvider";

/** Remplace le lien "Espace pro" du footer : ouvre le modal de connexion au lieu de naviguer. */
export default function EspaceProLink({ className }: { className?: string }) {
  const openLogin = useEspacePro();
  return (
    <button
      type="button"
      onClick={openLogin}
      className={`border-0 bg-transparent p-0 text-left ${className ?? ""}`}
    >
      Espace pro
    </button>
  );
}
