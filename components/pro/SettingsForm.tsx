"use client";

import { useState } from "react";
import type { AppSettings } from "@/lib/settings";
import Toast from "@/components/pro/Toast";

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="pro-lab">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pro-field"
        style={{ marginTop: 8 }}
      />
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pro-card" style={{ padding: "18px 20px" }}>
      <div className="pro-lab" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </div>
  );
}

export default function SettingsForm({
  action,
  settings,
}: {
  action: (formData: FormData) => Promise<void>;
  settings: AppSettings;
}) {
  const [pending, setPending] = useState(false);
  const { company, legal, devis } = settings;

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
      style={{ display: "grid", gap: 14, maxWidth: 720 }}
    >
      <Toast message="Paramètres enregistrés." />

      <Card title="Entreprise (en-tête des documents)">
        <Field name="company.name" label="Nom" defaultValue={company.name} />
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <Field name="company.phone" label="Téléphone" defaultValue={company.phone} />
          <Field name="company.email" label="Email" defaultValue={company.email} />
        </div>
        <Field name="company.street" label="Adresse" defaultValue={company.street} />
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "140px 1fr" }}>
          <Field name="company.zip" label="Code postal" defaultValue={company.zip} />
          <Field name="company.city" label="Ville" defaultValue={company.city} />
        </div>
      </Card>

      <Card title="Mentions légales (pied des devis / factures)">
        <Field
          name="legal.forme"
          label="Forme juridique"
          defaultValue={legal.forme}
          placeholder="ex. SARL au capital de 10 000 €"
        />
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <Field
            name="legal.siret"
            label="SIRET"
            defaultValue={legal.siret}
            placeholder="000 000 000 00000"
          />
          <Field
            name="legal.ape"
            label="Code APE / NAF"
            defaultValue={legal.ape}
            placeholder="4332A"
          />
        </div>
        <Field
          name="legal.rcs"
          label="RCS"
          defaultValue={legal.rcs}
          placeholder="RCS Perpignan 000 000 000"
        />
        <Field
          name="legal.tvaIntra"
          label="N° TVA intracommunautaire"
          defaultValue={legal.tvaIntra}
          placeholder="FR00 000000000"
        />
        <Field
          name="legal.assuranceDecennale"
          label="Assurance décennale"
          defaultValue={legal.assuranceDecennale}
          placeholder="AXA — police n° 000000"
        />
      </Card>

      <Card title="Valeurs par défaut des devis">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <Field
            name="devis.validityDays"
            label="Validité (jours)"
            type="number"
            defaultValue={devis.validityDays}
          />
          <Field
            name="devis.depositPct"
            label="Acompte par défaut (%)"
            type="number"
            defaultValue={devis.depositPct}
          />
        </div>
        <div>
          <label className="pro-lab">Mentions / conditions par défaut</label>
          <textarea
            name="devis.notes"
            rows={3}
            defaultValue={devis.notes}
            placeholder="Conditions de règlement, garanties…"
            className="pro-field"
            style={{ marginTop: 8, resize: "vertical" }}
          />
        </div>
      </Card>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="pro-btn solid"
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
        </button>
      </div>
    </form>
  );
}
