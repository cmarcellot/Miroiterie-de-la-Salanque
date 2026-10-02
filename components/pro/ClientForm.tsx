"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  formatFirstName,
  formatLastName,
  formatPhone,
  normalizePhone,
} from "@/lib/pro-enums";
import CityAutocomplete from "@/components/pro/CityAutocomplete";

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
  const [phoneError, setPhoneError] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Numéro pré-rempli (fiche existante, demande du site) non interprétable :
  // on le signale tout de suite plutôt qu'au moment d'enregistrer.
  useEffect(() => {
    const el = phoneRef.current;
    if (el && normalizePhone(el.value) === null) {
      el.setCustomValidity("Numéro de téléphone invalide");
      setPhoneError(true);
    }
  }, []);

  return (
    <form
      onSubmit={() => setPending(true)}
      action={async (fd) => {
        try {
          await action(fd);
          onDone?.();
        } finally {
          setPending(false);
        }
      }}
      className={bare ? "pro-cform" : "pro-card pro-cform"}
      style={bare ? undefined : { padding: "20px 22px", maxWidth: 620 }}
    >
      {fromMessage && (
        <input type="hidden" name="fromMessage" value={fromMessage} />
      )}
      {stay && <input type="hidden" name="stay" value="1" />}
      <input type="hidden" name="type" value={type} />

      <div>
        <label className="pro-lbl">Type</label>
        <div className="pro-seg">
          {CLIENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={type === t ? "active" : ""}
              onClick={() => setType(t)}
            >
              {CLIENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {isPro && (
        <div>
          <label className="pro-lbl">Raison sociale *</label>
          <input
            name="company"
            required={isPro}
            defaultValue={values.company}
            className="pro-field"
            placeholder="ex. SCI Les Pins"
          />
        </div>
      )}

      <div className="pro-row2">
        <div>
          <label className="pro-lbl">Prénom</label>
          <input
            name="firstName"
            defaultValue={formatFirstName(values.firstName ?? "")}
            onBlur={(e) => {
              e.currentTarget.value = formatFirstName(e.currentTarget.value);
            }}
            className="pro-field"
            placeholder="ex. Jean"
          />
        </div>
        <div>
          <label className="pro-lbl">Nom {isPro ? "du contact" : "*"}</label>
          <input
            name="lastName"
            required={!isPro}
            defaultValue={formatLastName(values.lastName ?? "")}
            onBlur={(e) => {
              e.currentTarget.value = formatLastName(e.currentTarget.value);
            }}
            className="pro-field"
            placeholder="ex. Bernard"
          />
        </div>
      </div>

      <div className="pro-row2">
        <div>
          <label className="pro-lbl">Téléphone</label>
          <input
            ref={phoneRef}
            name="phone"
            type="tel"
            defaultValue={values.phone ? formatPhone(values.phone) : ""}
            className="pro-field"
            placeholder="06 12 34 56 78"
            onChange={(e) => {
              // Bloque l'envoi (validation HTML5) tant que le numéro est invalide.
              e.currentTarget.setCustomValidity(
                normalizePhone(e.currentTarget.value) === null
                  ? "Numéro de téléphone invalide"
                  : ""
              );
              setPhoneError(false);
            }}
            onBlur={(e) => {
              const n = normalizePhone(e.currentTarget.value);
              if (n === null) setPhoneError(true);
              else e.currentTarget.value = formatPhone(n);
            }}
          />
          <div
            style={{
              fontSize: 12,
              marginTop: 4,
              color: phoneError ? "var(--danger)" : "var(--ink-3)",
            }}
          >
            {phoneError
              ? "Numéro de téléphone invalide"
              : "Numéro belge : saisir +32…"}
          </div>
        </div>
        <div>
          <label className="pro-lbl">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={values.email}
            className="pro-field"
            placeholder="email@…"
          />
        </div>
      </div>

      <div>
        <label className="pro-lbl">Rue</label>
        <input
          name="street"
          defaultValue={values.street}
          className="pro-field"
          placeholder="N° et voie"
        />
      </div>

      <CityAutocomplete
        defaultZip={values.zip ?? ""}
        defaultCity={values.city ?? ""}
      />

      <div>
        <label className="pro-lbl">Notes (optionnel)</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={values.notes}
          className="pro-field"
          placeholder="Préférences, contraintes d'accès, historique…"
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
