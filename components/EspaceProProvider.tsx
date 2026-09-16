"use client";

import { createContext, useContext, useState } from "react";
import LoginModalCard from "@/components/pro/LoginModalCard";

const EspaceProContext = createContext<() => void>(() => {});

/** Donne accès au déclencheur du modal de connexion depuis n'importe où sur la vitrine. */
export function useEspacePro() {
  return useContext(EspaceProContext);
}

/**
 * Reprend le fonctionnement du proto : "Espace pro" ouvre un modal de
 * connexion par-dessus la page en cours, sans navigation — /pro/login
 * reste en secours pour un accès direct (lien profond, favori...).
 */
export default function EspaceProProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <EspaceProContext.Provider value={() => setOpen(true)}>
      {children}
      {open && (
        <LoginModalCard
          onClose={() => setOpen(false)}
          onSuccess={() => {
            window.location.href = "/pro";
          }}
        />
      )}
    </EspaceProContext.Provider>
  );
}
