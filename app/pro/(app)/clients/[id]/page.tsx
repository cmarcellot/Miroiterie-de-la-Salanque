import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft, Plus } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { CLIENT_TYPE_LABELS, type ClientType } from "@/lib/models/Client";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";
import Devis, { DEVIS_STATUS_LABELS, type DevisStatus } from "@/lib/models/Devis";
import Facture, {
  FACTURE_STATUS_LABELS,
  isFactureLate,
  type FactureStatus,
} from "@/lib/models/Facture";
import {
  clientDisplayName,
  formatEUR,
  formatPhone,
  initialsOf,
} from "@/lib/pro-enums";
import { deleteClient } from "@/lib/actions/clients";
import ClientModal from "@/components/pro/ClientModal";
import DeleteButton from "@/components/pro/DeleteButton";
import Toast from "@/components/pro/Toast";
import Kpis, { type Kpi } from "@/components/pro/Kpis";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectToDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = await Client.findById(params.id).lean();
  if (!c) notFound();
  const displayName = clientDisplayName(c);

  const [demandes, devis, factures] = await Promise.all([
    Message.find({ clientId: c._id }).sort({ createdAt: -1 }).lean(),
    Devis.find({ clientId: c._id }).sort({ seq: -1, year: -1 }).lean(),
    Facture.find({ clientId: c._id }).sort({ seq: -1, year: -1 }).lean(),
  ]);

  const signes = devis.filter((d: any) => d.status === "accepte");
  const enCours = devis.filter(
    (d: any) => d.status === "brouillon" || d.status === "envoye"
  );
  const montantSigne = signes.reduce(
    (s: number, d: any) => s + (d.totalTTC || 0),
    0
  );
  const montantEnCours = enCours.reduce(
    (s: number, d: any) => s + (d.totalTTC || 0),
    0
  );

  const clientDepuis = c.createdAt
    ? new Date(c.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const kpis: Kpi[] = [
    {
      label: "Devis",
      value: devis.length,
      hint: `${signes.length} accepté${signes.length > 1 ? "s" : ""}`,
    },
    {
      label: "Montant signé",
      value: montantSigne,
      display: formatEUR(montantSigne),
      hint: `${signes.length} devis accepté${signes.length > 1 ? "s" : ""}`,
      accent: "var(--ok)",
    },
    {
      label: "En attente",
      value: montantEnCours,
      display: formatEUR(montantEnCours),
      hint: `${enCours.length} devis en cours`,
    },
    {
      label: "Demandes du site",
      value: demandes.length,
      hint: "liées à cette fiche",
    },
  ];

  return (
    <div>
      <Toast param="created" message="Fiche client créée." />
      <Toast param="updated" message="Fiche client mise à jour." />

      <Link
        href="/pro/clients"
        className="pro-btn ghost"
        style={{ marginBottom: 14 }}
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="pro-phead">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            className="pro-avatar"
            style={{ width: 56, height: 56, fontSize: 18, flexShrink: 0 }}
          >
            {initialsOf(displayName)}
          </span>
          <div>
            <h1>{displayName}</h1>
            <div className="sub">
              {CLIENT_TYPE_LABELS[c.type as ClientType] ?? c.type}
              {c.city ? ` · ${c.city}` : ""}
              {clientDepuis ? ` · client depuis ${clientDepuis}` : ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <ClientModal
            client={{
              id: String(c._id),
              type: c.type,
              firstName: c.firstName,
              lastName: c.lastName,
              company: c.company,
              email: c.email,
              phone: c.phone,
              street: c.street,
              zip: c.zip,
              city: c.city,
              notes: c.notes,
            }}
          />
          <Link
            href={`/pro/devis/nouveau?client=${c._id}`}
            className="pro-btn solid"
          >
            <Plus className="h-4 w-4" /> Nouveau devis
          </Link>
        </div>
      </div>

      <Kpis items={kpis} />

      <div className="pro-card" style={{ marginTop: 14 }}>
        <div className="pro-chead">
          <h3>Coordonnées</h3>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            padding: 20,
          }}
        >
          <div>
            <div className="pro-lbl">Téléphone</div>
            {c.phone ? (
              <a href={`tel:${c.phone}`} style={{ fontSize: 14 }}>
                {formatPhone(c.phone)}
              </a>
            ) : (
              <span style={{ color: "var(--ink-3)" }}>—</span>
            )}
          </div>
          <div>
            <div className="pro-lbl">Email</div>
            {c.email ? (
              <a href={`mailto:${c.email}`} style={{ fontSize: 14 }}>
                {c.email}
              </a>
            ) : (
              <span style={{ color: "var(--ink-3)" }}>—</span>
            )}
          </div>
          <div>
            <div className="pro-lbl">Adresse</div>
            <div style={{ fontSize: 14 }}>
              {c.street || c.zip || c.city
                ? `${c.street ? c.street + ", " : ""}${[c.zip, c.city]
                    .filter(Boolean)
                    .join(" ")}`
                : "—"}
            </div>
          </div>
          <div>
            <div className="pro-lbl">Client depuis</div>
            <div style={{ fontSize: 14 }}>{clientDepuis ?? "—"}</div>
          </div>
        </div>
        {c.notes && (
          <div
            style={{
              margin: "0 20px 20px",
              paddingTop: 18,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div className="pro-lbl">Notes</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--ink-2)",
                whiteSpace: "pre-line",
                marginTop: 8,
              }}
            >
              {c.notes}
            </p>
          </div>
        )}
      </div>

      <div className="pro-card" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-chead">
          <h3>Devis · {devis.length}</h3>
          <Link
            href={`/pro/devis/nouveau?client=${c._id}`}
            className="pro-lab"
            style={{ color: "var(--ink-2)" }}
          >
            + Nouveau devis
          </Link>
        </div>
        {devis.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucun devis pour ce client.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Lignes</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {devis.map((d: any) => (
                <tr key={String(d._id)}>
                  <td className="num">
                    <Link href={`/pro/devis/${d._id}`}>{d.number}</Link>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {d.date
                      ? new Date(d.date).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>
                    {(d.items || []).length} ligne
                    {(d.items || []).length > 1 ? "s" : ""}
                  </td>
                  <td>
                    <span className={`pro-st devis-${d.status}`}>
                      <i />
                      {DEVIS_STATUS_LABELS[d.status as DevisStatus] ??
                        d.status}
                    </span>
                  </td>
                  <td className="pro-amt" style={{ textAlign: "right" }}>
                    {formatEUR(d.totalTTC || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pro-card" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-chead">
          <h3>Factures · {factures.length}</h3>
        </div>
        {factures.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucune facture pour ce client.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Émise</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f: any) => {
                const late = isFactureLate(f);
                return (
                  <tr key={String(f._id)}>
                    <td className="num">
                      <Link href={`/pro/factures/${f._id}`}>{f.number}</Link>
                    </td>
                    <td style={{ color: "var(--ink-3)" }}>
                      {f.date
                        ? new Date(f.date).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td style={{ color: late ? "var(--danger)" : "var(--ink-3)" }}>
                      {f.dueDate
                        ? new Date(f.dueDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <span className={`pro-st facture-${late ? "retard" : f.status}`}>
                        <i />
                        {late
                          ? "En retard"
                          : FACTURE_STATUS_LABELS[f.status as FactureStatus] ??
                            f.status}
                      </span>
                    </td>
                    <td className="pro-amt" style={{ textAlign: "right" }}>
                      {formatEUR(f.totalTTC || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="pro-card" style={{ marginTop: 14, overflowX: "auto" }}>
        <div className="pro-chead">
          <h3>Demandes du site · {demandes.length}</h3>
        </div>
        {demandes.length === 0 ? (
          <p style={{ padding: 24, color: "var(--ink-3)", fontSize: 13 }}>
            Aucune demande liée.
          </p>
        ) : (
          <table className="pro-table">
            <thead>
              <tr>
                <th>Origine</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Reçue le</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((m: any) => (
                <tr key={String(m._id)}>
                  <td className="num">
                    <Link href={`/pro/demandes/${m._id}`}>
                      {m.source === "devis" ? "Devis" : "Contact"}
                    </Link>
                  </td>
                  <td>
                    <span className={`pro-st ${m.status}`}>
                      <i />
                      {MESSAGE_STATUS_LABELS[
                        m.status as keyof typeof MESSAGE_STATUS_LABELS
                      ] ?? m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--ink-3)" }}>
                    {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pro-card" style={{ marginTop: 14, padding: "16px 20px" }}>
        <div className="pro-lab">Zone de danger</div>
        <p style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}>
          La suppression est définitive. Devis et demandes rattachés seront
          déliés mais conservés.
        </p>
        <DeleteButton
          action={deleteClient.bind(null, String(c._id))}
          confirmText={`Supprimer définitivement la fiche de ${displayName} ?`}
          label="Supprimer la fiche"
        />
      </div>
    </div>
  );
}
