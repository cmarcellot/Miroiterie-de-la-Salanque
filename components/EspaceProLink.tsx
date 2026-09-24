"use client";

import { useEspacePro } from "@/components/EspaceProProvider";
import { LockIcon } from "@/components/icons";

/** Bouton "Espace pro" du footer : ouvre le modal de connexion au lieu de naviguer. */
export default function EspaceProLink({ className }: { className?: string }) {
  const openLogin = useEspacePro();
  return (
    <button
      type="button"
      onClick={openLogin}
      className={`inline-flex items-center gap-1.5 ${className ?? ""}`}
    >
      <LockIcon className="h-3.5 w-3.5" />
      Espace pro
    </button>
  );
}
