"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  PRESTATION_TYPES,
  PRESTATION_TYPE_LABELS,
  VAT_RATES,
} from "@/lib/pro-enums";

export type PrestationValues = {
  type?: string;
  name?: string;
  unit?: string;
  unitPrice?: number;
  vatRate?: number;
  description?: string;
};

export default function PrestationForm({
  action,
  values = {},
  cancelHref,
  onCancel,
  onDone,
  stay = false,
  bare = false,
  submitLabel = "Enregistrer",
}: {
  action: (formData: FormData) => Promise<void>;
  values?: PrestationValues;
  cancelHref?: string;
  onCancel?: () => void;
  onDone?: () => void;
  stay?: boolean;
  bare?: boolean;
  submitLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const [type, setType] = useState(values.type ?? "prestation");
  const field = "pro-field";

  return (
    <form
      action={async (fd) => {
        setPending(true);
        try {
          await action(fd);
          onDone?.();
        } finally {
          setPending(false);
        }
      }}
      className={bare ? "pro-cform" : "pro-card pro-cform"}
      style={bare ? undefined : { padding: "20px 22px", maxWidth: 560 }}
    >
      {stay && <input type="hidden" name="stay" value="1" />}
      <input type="hidden" name="type" value={type} />

      <div>
        <label className="pro-lbl">Type</label>
        <div className="pro-seg">
          {PRESTATION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={type === t ? "active" : ""}
              onClick={() => setType(t)}
            >
              {PRESTATION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="pro-lbl">Désignation *</label>
        <input
          name="name"
          required
          defaultValue={values.name}
          className={field}
          placeholder="ex. Fenêtre PVC 2 vantaux"
        />
      </div>

      <div className="pro-row2">
        <div>
          <label className="pro-lbl">Unité *</label>
          <select
            name="unit"
            required
            defaultValue={values.unit ?? ""}
            className={field}
          >
            <option value="" disabled>
              Choisir…
            </option>
            <option value="unité">unité</option>
            <option value="m²">m²</option>
            <option value="ml">ml</option>
            <option value="h">h</option>
            <option value="forfait">forfait</option>
          </select>
        </div>
        <div>
          <label className="pro-lbl">Prix unitaire HT</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="unitPrice"
            defaultValue={values.unitPrice ?? 0}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className="pro-lbl">TVA</label>
        <select
          name="vatRate"
          defaultValue={values.vatRate ?? 20}
          className={field}
        >
          {VAT_RATES.map((r) => (
            <option key={r} value={r}>
              {r} %
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="pro-lbl">Description (optionnel)</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={values.description}
          className={field}
          placeholder="Détails, référence fournisseur, dimensions…"
        />
      </div>

      <div className="pro-cform-foot">
        {onCancel ? (
          <button type="button" className="pro-btn ghost" onClick={onCancel}>
            Annuler
          </button>
        ) : cancelHref ? (
          <Link href={cancelHref} className="pro-btn ghost">
            Annuler
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="pro-btn solid"
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          <Plus className="h-4 w-4" />
          {pending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
