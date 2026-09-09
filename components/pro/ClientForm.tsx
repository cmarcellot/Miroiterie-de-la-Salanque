"use client";

import { useState } from "react";
import Link from "next/link";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS } from "@/lib/pro-enums";

export type ClientValues = {
  type?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
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
  onCancel,
  onDone,
  stay = false,
  bare = false,
  submitLabel = "Enregistrer",
}: {
  action: (formData: FormData) => Promise<void>;
  values?: ClientValues;
  fromMessage?: string;
  cancelHref?: string;
  onCancel?: () => void;
  onDone?: () => void;
  stay?: boolean;
  bare?: boolean;
  submitLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const [type, setType] = useState(values.type ?? "particulier");
  const isPro = type === "professionnel";

  const fieldStyle = { marginTop: 8 } as const;

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
      className={bare ? undefined : "pro-card"}
      style={{
        padding: bare ? 0 : "20px 22px",
        display: "grid",
        gap: 16,
        maxWidth: bare ? undefined : 620,
      }}
    >
      {fromMessage && (
        <input type="hidden" name="fromMessage" value={fromMessage} />
      )}
      {stay && <input type="hidden" name="stay" value="1" />}

      <div>
        <label className="pro-lab">Type</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="pro-field"
          style={fieldStyle}
        >
          {CLIENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CLIENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {isPro && (
        <div>
          <label className="pro-lab">Raison sociale *</label>
          <input
            name="company"
            required={isPro}
            defaultValue={values.company}
            className="pro-field"
            style={fieldStyle}
            placeholder="ex. SCI Les Pins"
          />
        </div>
      )}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="pro-lab">
            Nom {isPro ? "du contact" : "*"}
          </label>
          <input
            name="lastName"
            required={!isPro}
            defaultValue={values.lastName}
            className="pro-field"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="pro-lab">Prénom</label>
          <input
            name="firstName"
            defaultValue={values.firstName}
            className="pro-field"
            style={fieldStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="pro-lab">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={values.email}
            className="pro-field"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="pro-lab">Téléphone</label>
          <input
            name="phone"
            defaultValue={values.phone}
            className="pro-field"
            style={fieldStyle}
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
          style={fieldStyle}
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
        {onCancel ? (
          <button type="button" className="pro-btn ghost" onClick={onCancel}>
            Annuler
          </button>
        ) : cancelHref ? (
          <Link href={cancelHref} className="pro-btn ghost">
            Annuler
          </Link>
        ) : null}
      </div>
    </form>
  );
}
