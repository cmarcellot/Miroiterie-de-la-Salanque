"use client";

import { useState } from "react";
import Link from "next/link";

type Values = {
  clientId?: string;
  title?: string;
  plannedDate?: string; // yyyy-mm-dd
  street?: string;
  zip?: string;
  city?: string;
  notes?: string;
};

export default function ChantierForm({
  action,
  clients,
  values = {},
  lockClient = false,
  cancelHref,
  submitLabel = "Enregistrer",
}: {
  action: (formData: FormData) => Promise<void>;
  clients: { id: string; name: string }[];
  values?: Values;
  lockClient?: boolean;
  cancelHref: string;
  submitLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const field = "pro-field";

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
      style={{ padding: "20px 22px", display: "grid", gap: 18 }}
    >
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 200px" }}>
        <div>
          <label className="pro-lab">Client *</label>
          <select
            name="clientId"
            required
            defaultValue={values.clientId ?? ""}
            disabled={lockClient}
            className={field}
            style={{ marginTop: 8 }}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {lockClient && values.clientId && (
            <input type="hidden" name="clientId" value={values.clientId} />
          )}
        </div>
        <div>
          <label className="pro-lab">Date de pose prévue</label>
          <input
            type="date"
            name="plannedDate"
            defaultValue={values.plannedDate}
            className={field}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      <div>
        <label className="pro-lab">Titre du chantier *</label>
        <input
          name="title"
          required
          defaultValue={values.title}
          placeholder="ex. Pose de 4 fenêtres + porte d'entrée"
          className={field}
          style={{ marginTop: 8 }}
        />
      </div>

      <div>
        <label className="pro-lab">Adresse du chantier</label>
        <input
          name="street"
          defaultValue={values.street}
          placeholder="N° et voie"
          className={field}
          style={{ marginTop: 8 }}
        />
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "140px 1fr" }}>
        <input
          name="zip"
          defaultValue={values.zip}
          placeholder="Code postal"
          className={field}
        />
        <input
          name="city"
          defaultValue={values.city}
          placeholder="Ville"
          className={field}
        />
      </div>

      <div>
        <label className="pro-lab">Notes</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={values.notes}
          placeholder="Contraintes d'accès, matériaux à prévoir, suivi d'intervention…"
          className={field}
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
