"use client";

import { useState } from "react";
import Link from "next/link";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS } from "@/lib/pro-enums";

export type ClientValues = {
  name?: string;
  type?: string;
  email?: string;
  phone?: string;
  street?: string;
  zip?: string;
  city?: string;
  notes?: string;
};

export default function ClientForm({
  action,
  values = {},
  fromMessage,
  cancelHref,
  submitLabel = "Enregistrer",
}: {
  action: (formData: FormData) => Promise<void>;
  values?: ClientValues;
  fromMessage?: string;
  cancelHref: string;
  submitLabel?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (fd) => {
        setPending(true);
        try {
          await action(fd);
        } finally {
          setPending(false);
        }
      }}
      className="pro-card"
      style={{ padding: "20px 22px", display: "grid", gap: 16, maxWidth: 620 }}
    >
      {fromMessage && (
        <input type="hidden" name="fromMessage" value={fromMessage} />
      )}

      <div>
        <label className="pro-lab">Nom / raison sociale *</label>
        <input
          name="name"
          required
          defaultValue={values.name}
          className="pro-field"
          style={{ marginTop: 8 }}
        />
      </div>

      <div>
        <label className="pro-lab">Type</label>
        <select
          name="type"
          defaultValue={values.type ?? "particulier"}
          className="pro-field"
          style={{ marginTop: 8 }}
        >
          {CLIENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CLIENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="pro-lab">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={values.email}
            className="pro-field"
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <label className="pro-lab">Téléphone</label>
          <input
            name="phone"
            defaultValue={values.phone}
            className="pro-field"
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      <div>
        <label className="pro-lab">Adresse</label>
        <input
          name="street"
          placeholder="Rue"
          defaultValue={values.street}
          className="pro-field"
          style={{ marginTop: 8 }}
        />
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "120px 1fr",
            marginTop: 8,
          }}
        >
          <input
            name="zip"
            placeholder="Code postal"
            defaultValue={values.zip}
            className="pro-field"
          />
          <input
            name="city"
            placeholder="Ville"
            defaultValue={values.city}
            className="pro-field"
          />
        </div>
      </div>

      <div>
        <label className="pro-lab">Notes</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={values.notes}
          className="pro-field"
          style={{ marginTop: 8, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={pending}
          className="pro-btn solid"
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link href={cancelHref} className="pro-btn ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
