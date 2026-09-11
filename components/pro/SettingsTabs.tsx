"use client";

import { useState, type ReactNode } from "react";
import { User, FileText, Bell, Database } from "lucide-react";
import type { AppSettings } from "@/lib/settings";
import Toast from "@/components/pro/Toast";

export type SettingsStats = {
  clients: number;
  devis: number;
  factures: number;
  demandes: number;
};

const TABS = [
  { id: "company", label: "Entreprise", icon: User },
  { id: "billing", label: "Devis & factures", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Données", icon: Database },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ---------- primitives — reprises de SettingsRow / TabBar du prototype ---------- */

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="pro-srow">
      <div>
        <div className="lbl">{label}</div>
        {hint && <div className="hint">{hint}</div>}
      </div>
      <div className="fields">{children}</div>
    </div>
  );
}

function Field({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
}: {
  name: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pro-field"
    />
  );
}

function SectionFoot({
  dirty,
  pending,
  onCancel,
}: {
  dirty: boolean;
  pending: boolean;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 20,
      }}
    >
      {dirty && (
        <span
          style={{
            alignSelf: "center",
            fontSize: 12,
            color: "var(--warn)",
            marginRight: "auto",
          }}
        >
          Modifications non enregistrées
        </span>
      )}
      <button
        type="button"
        className="pro-btn ghost"
        disabled={!dirty || pending}
        onClick={onCancel}
        style={{ opacity: !dirty || pending ? 0.5 : 1 }}
      >
        Annuler
      </button>
      <button
        type="submit"
        className="pro-btn solid"
        disabled={!dirty || pending}
        style={{ opacity: !dirty || pending ? 0.5 : 1 }}
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  children: (helpers: { pending: boolean }) => ReactNode;
}) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="pro-card"
      style={{ padding: "20px 22px" }}
      action={async (fd) => {
        setPending(true);
        try {
          await action(fd);
        } finally {
          setPending(false);
        }
      }}
    >
      <h3 style={{ fontSize: 20, marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 4 }}>
        {description}
      </p>
      {children({ pending })}
    </form>
  );
}

/* ---------- onglet Entreprise ---------- */

function CompanyPanel({
  settings,
  action,
}: {
  settings: AppSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const initial = { ...settings.company, ...settings.legal };
  const [v, setV] = useState(initial);
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const set = (k: keyof typeof v) => (val: string) =>
    setV((s) => ({ ...s, [k]: val }));

  return (
    <Panel
      title="Informations entreprise"
      description="Ces informations apparaissent en en-tête et en pied de vos devis et factures."
      action={action}
    >
      {({ pending }) => (
        <>
          <Row label="Nom commercial" hint="Affiché en grand sur tous les documents.">
            <Field name="company.name" value={v.name} onChange={set("name")} />
          </Row>
          <Row label="Contact">
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field name="company.phone" value={v.phone} onChange={set("phone")} placeholder="Téléphone" />
              <Field name="company.email" value={v.email} onChange={set("email")} placeholder="Email" />
            </div>
          </Row>
          <Row label="Adresse">
            <Field name="company.street" value={v.street} onChange={set("street")} placeholder="Rue / numéro" />
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "140px 1fr" }}>
              <Field name="company.zip" value={v.zip} onChange={set("zip")} placeholder="Code postal" />
              <Field name="company.city" value={v.city} onChange={set("city")} placeholder="Ville" />
            </div>
          </Row>
          <Row label="Identifiants légaux" hint="Obligatoires sur les factures.">
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field name="legal.siret" value={v.siret} onChange={set("siret")} placeholder="SIRET" />
              <Field name="legal.ape" value={v.ape} onChange={set("ape")} placeholder="Code APE / NAF" />
            </div>
            <Field name="legal.forme" value={v.forme} onChange={set("forme")} placeholder="Forme juridique" />
            <Field name="legal.rcs" value={v.rcs} onChange={set("rcs")} placeholder="RCS" />
            <Field name="legal.tvaIntra" value={v.tvaIntra} onChange={set("tvaIntra")} placeholder="N° TVA intracommunautaire" />
            <Field name="legal.assuranceDecennale" value={v.assuranceDecennale} onChange={set("assuranceDecennale")} placeholder="Assurance décennale" />
          </Row>
          <Row label="Coordonnées bancaires" hint="Affichées en pied de facture pour faciliter les virements.">
            <Field name="company.iban" value={v.iban} onChange={set("iban")} placeholder="IBAN (FR76 ...)" />
          </Row>

          <SectionFoot dirty={dirty} pending={pending} onCancel={() => setV(initial)} />
        </>
      )}
    </Panel>
  );
}

/* ---------- onglet Devis & factures ---------- */

function BillingPanel({
  settings,
  action,
}: {
  settings: AppSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const initial = {
    validityDays: settings.devis.validityDays,
    depositPct: settings.devis.depositPct,
    defaultVatRate: settings.devis.defaultVatRate,
    deliveryWeeks: settings.devis.deliveryWeeks,
    warranty: settings.devis.warranty,
    devisNotes: settings.devis.notes,
    paymentDelayDays: settings.factures.paymentDelayDays,
    facturesNotes: settings.factures.notes,
  };
  const [v, setV] = useState(initial);
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const setNum = (k: keyof typeof v) => (val: string) =>
    setV((s) => ({ ...s, [k]: Number(val) || 0 }));
  const setStr = (k: keyof typeof v) => (val: string) =>
    setV((s) => ({ ...s, [k]: val }));

  return (
    <Panel
      title="Conditions par défaut"
      description="Valeurs reprises automatiquement à la création de chaque devis et facture."
      action={action}
    >
      {({ pending }) => (
        <>
          <Row label="Taux de TVA par défaut" hint="Pré-rempli sur les nouvelles lignes, modifiable ligne par ligne.">
            <div style={{ display: "flex", gap: 8, maxWidth: 160, alignItems: "center" }}>
              <Field name="devis.defaultVatRate" type="number" step="0.5" value={v.defaultVatRate} onChange={setNum("defaultVatRate")} />
              <span style={{ color: "var(--ink-3)" }}>%</span>
            </div>
          </Row>
          <Row label="Acompte à la signature">
            <div style={{ display: "flex", gap: 8, maxWidth: 160, alignItems: "center" }}>
              <Field name="devis.depositPct" type="number" value={v.depositPct} onChange={setNum("depositPct")} />
              <span style={{ color: "var(--ink-3)" }}>%</span>
            </div>
          </Row>
          <Row label="Délai de pose" hint="Temps moyen annoncé entre signature et pose.">
            <div style={{ display: "flex", gap: 8, maxWidth: 160, alignItems: "center" }}>
              <Field name="devis.deliveryWeeks" type="number" value={v.deliveryWeeks} onChange={setNum("deliveryWeeks")} />
              <span style={{ color: "var(--ink-3)" }}>semaines</span>
            </div>
          </Row>
          <Row label="Validité des devis">
            <div style={{ display: "flex", gap: 8, maxWidth: 160, alignItems: "center" }}>
              <Field name="devis.validityDays" type="number" value={v.validityDays} onChange={setNum("validityDays")} />
              <span style={{ color: "var(--ink-3)" }}>jours</span>
            </div>
          </Row>
          <Row label="Délai de paiement des factures" hint="0 = paiement à réception.">
            <div style={{ display: "flex", gap: 8, maxWidth: 160, alignItems: "center" }}>
              <Field name="factures.paymentDelayDays" type="number" value={v.paymentDelayDays} onChange={setNum("paymentDelayDays")} />
              <span style={{ color: "var(--ink-3)" }}>jours</span>
            </div>
          </Row>
          <Row label="Garantie pose">
            <Field name="devis.warranty" value={v.warranty} onChange={setStr("warranty")} />
          </Row>
          <Row label="Mentions / conditions — devis">
            <textarea
              name="devis.notes"
              rows={3}
              value={v.devisNotes}
              onChange={(e) => setStr("devisNotes")(e.target.value)}
              placeholder="Conditions de règlement, garanties…"
              className="pro-field"
              style={{ resize: "vertical" }}
            />
          </Row>
          <Row label="Mentions / conditions — factures">
            <textarea
              name="factures.notes"
              rows={3}
              value={v.facturesNotes}
              onChange={(e) => setStr("facturesNotes")(e.target.value)}
              placeholder="Conditions de règlement, pénalités de retard…"
              className="pro-field"
              style={{ resize: "vertical" }}
            />
          </Row>

          <SectionFoot dirty={dirty} pending={pending} onCancel={() => setV(initial)} />
        </>
      )}
    </Panel>
  );
}

/* ---------- onglet Notifications ---------- */

const NOTIF_ITEMS = [
  {
    k: "emailNewLead" as const,
    label: "Nouvelle demande via le site",
    hint: "Alerte quand un formulaire de contact ou de devis est envoyé depuis la vitrine.",
  },
  {
    k: "emailQuoteSigned" as const,
    label: "Devis accepté",
    hint: "Alerte dès qu'un devis bascule en statut « Accepté ».",
  },
  {
    k: "emailInvoiceLate" as const,
    label: "Facture en retard",
    hint: "Rappel dès qu'une facture dépasse son échéance.",
  },
  {
    k: "smsReminder" as const,
    label: "SMS de rappel client",
    hint: "Rappel automatique avant un rendez-vous planifié (avec le module Chantiers).",
  },
];

function NotificationsPanel({
  settings,
  action,
}: {
  settings: AppSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const initial = settings.notifications;
  const [v, setV] = useState(initial);
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  return (
    <Panel
      title="Notifications"
      description="Choisissez les alertes que vous souhaitez recevoir. L'envoi automatique (email / SMS) sera branché avec le module concerné — ces préférences sont enregistrées dès maintenant."
      action={action}
    >
      {({ pending }) => (
        <>
          {NOTIF_ITEMS.map((it) => (
            <Row key={it.k} label={it.label} hint={it.hint}>
              <label className="pro-toggle">
                <input
                  type="checkbox"
                  name={`notifications.${it.k}`}
                  checked={v[it.k]}
                  onChange={(e) =>
                    setV((s) => ({ ...s, [it.k]: e.target.checked }))
                  }
                />
                <span className="track">
                  <span className="thumb" />
                </span>
                <span className="state">{v[it.k] ? "Activé" : "Désactivé"}</span>
              </label>
            </Row>
          ))}

          <SectionFoot dirty={dirty} pending={pending} onCancel={() => setV(initial)} />
        </>
      )}
    </Panel>
  );
}

/* ---------- onglet Données (lecture seule) ---------- */

function DataPanel({ stats }: { stats: SettingsStats }) {
  const items = [
    { l: "Clients", v: stats.clients },
    { l: "Devis", v: stats.devis },
    { l: "Factures", v: stats.factures },
    { l: "Demandes du site", v: stats.demandes },
  ];
  const total = items.reduce((s, it) => s + it.v, 0);

  return (
    <div className="pro-card" style={{ padding: "20px 22px" }}>
      <h3 style={{ fontSize: 20, marginBottom: 4 }}>Vos données</h3>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>
        Aperçu du volume de données enregistrées dans l&apos;espace pro.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((it) => (
          <div key={it.l} style={{ padding: 16, background: "var(--bg)", borderRadius: 8 }}>
            <div className="pro-lbl">{it.l}</div>
            <div style={{ fontFamily: "var(--pro-display)", fontSize: 28, lineHeight: 1, marginTop: 4 }}>
              {it.v}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "var(--bg)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--ink-2)",
        }}
      >
        {total} enregistrement{total > 1 ? "s" : ""} au total.
      </div>
    </div>
  );
}

/* ---------- composant racine ---------- */

export default function SettingsTabs({
  settings,
  stats,
  initialTab,
  companyAction,
  billingAction,
  notificationsAction,
}: {
  settings: AppSettings;
  stats: SettingsStats;
  initialTab?: string;
  companyAction: (formData: FormData) => Promise<void>;
  billingAction: (formData: FormData) => Promise<void>;
  notificationsAction: (formData: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? (initialTab as TabId) : "company"
  );

  return (
    <div>
      <Toast message="Paramètres enregistrés." />

      <div className="pro-tabbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "company" && <CompanyPanel settings={settings} action={companyAction} />}
      {tab === "billing" && <BillingPanel settings={settings} action={billingAction} />}
      {tab === "notifications" && (
        <NotificationsPanel settings={settings} action={notificationsAction} />
      )}
      {tab === "data" && <DataPanel stats={stats} />}
    </div>
  );
}
