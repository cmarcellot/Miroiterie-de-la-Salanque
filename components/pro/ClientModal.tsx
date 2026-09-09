"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/actions/clients";
import ClientForm, { type ClientValues } from "@/components/pro/ClientForm";

export default function ClientModal({
  label = "Ajouter un client",
  variant = "solid",
  fromMessage,
  prefill,
}: {
  label?: string;
  variant?: "solid" | "ghost";
  fromMessage?: string;
  prefill?: ClientValues;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`pro-btn ${variant}`}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>

      {open && (
        <div
          className="pro-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="pro-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Nouvelle fiche client"
          >
            <div className="pro-modal-head">
              <h3>Nouvelle fiche client</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="pro-modal-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="pro-modal-body">
              <ClientForm
                action={createClient}
                values={prefill}
                fromMessage={fromMessage}
                stay={!fromMessage}
                bare
                onCancel={() => setOpen(false)}
                onDone={() => {
                  setOpen(false);
                  router.push(`${pathname}?created=${Date.now()}`);
                }}
                submitLabel="Créer la fiche"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
