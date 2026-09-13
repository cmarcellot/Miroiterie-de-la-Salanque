"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Pencil } from "lucide-react";
import { createPrestation, updatePrestation } from "@/lib/actions/prestations";
import PrestationForm, {
  type PrestationValues,
} from "@/components/pro/PrestationForm";

export default function PrestationModal({
  label,
  variant,
  iconOnly,
  prestation,
}: {
  label?: string;
  variant?: "solid" | "ghost";
  iconOnly?: boolean;
  /** Article existant : bascule le modal en mode « Modifier ». */
  prestation?: PrestationValues & { id: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = !!prestation;

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

  const btnLabel = label ?? (isEdit ? "Modifier" : "Nouveau");
  const btnVariant = variant ?? (isEdit ? "ghost" : "solid");
  const title = isEdit ? "Modifier l'article" : "Nouvel article";
  const subtitle = isEdit
    ? "Mettre à jour ce produit ou cette prestation."
    : "Ajouter un produit ou une prestation au catalogue.";

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          className="ra"
          title="Modifier"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          className={`pro-btn ${btnVariant}`}
          onClick={() => setOpen(true)}
        >
          {btnVariant === "solid" && <Plus className="h-4 w-4" />}
          {btnLabel}
        </button>
      )}

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
              <PrestationForm
                action={
                  isEdit
                    ? updatePrestation.bind(null, prestation!.id)
                    : createPrestation
                }
                values={isEdit ? prestation : undefined}
                stay={!isEdit}
                bare
                onCancel={() => setOpen(false)}
                onDone={() => {
                  setOpen(false);
                  if (isEdit) router.refresh();
                  else router.push(`/pro/prestations?created=${Date.now()}`);
                }}
                submitLabel={isEdit ? "Enregistrer" : "Ajouter"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
