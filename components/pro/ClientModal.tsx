"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Plus, Settings } from "lucide-react";
import { createClient, updateClient } from "@/lib/actions/clients";
import ClientForm, { type ClientValues } from "@/components/pro/ClientForm";

export default function ClientModal({
  label,
  variant,
  fromMessage,
  prefill,
  client,
}: {
  label?: string;
  variant?: "solid" | "ghost";
  fromMessage?: string;
  prefill?: ClientValues;
  /** Fiche existante : bascule le modal en mode « Modifier ». */
  client?: ClientValues & { id: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEdit = !!client;

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

  const btnLabel = label ?? (isEdit ? "Modifier" : "Nouveau client");
  const btnVariant = variant ?? (isEdit ? "ghost" : "solid");
  const title = isEdit ? "Modifier la fiche" : "Nouveau client";
  const subtitle = isEdit
    ? "Mettre à jour les coordonnées de ce client."
    : "Créer une fiche client définitive.";

  return (
    <>
      <button
        type="button"
        className={`pro-btn ${btnVariant}`}
        onClick={() => setOpen(true)}
      >
        {isEdit ? (
          <Settings className="h-4 w-4" />
        ) : btnVariant === "solid" ? (
          <Plus className="h-4 w-4" />
        ) : null}
        {btnLabel}
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
            aria-label={title}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="pro-modal-close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pro-modal-head">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            <div className="pro-modal-body">
              <ClientForm
                action={
                  isEdit ? updateClient.bind(null, client!.id) : createClient
                }
                values={isEdit ? client : prefill}
                fromMessage={fromMessage}
                stay={!isEdit && !fromMessage}
                bare
                onCancel={() => setOpen(false)}
                onDone={
                  isEdit
                    ? undefined
                    : () => {
                        setOpen(false);
                        router.push(`${pathname}?created=${Date.now()}`);
                      }
                }
                submitLabel={isEdit ? "Enregistrer" : "Créer"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
