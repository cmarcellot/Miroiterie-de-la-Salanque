import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { CLIENT_TYPE_LABELS, type ClientType } from "@/lib/models/Client";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";
import Devis, { DEVIS_STATUS_LABELS, type DevisStatus } from "@/lib/models/Devis";
import { clientDisplayName, formatEUR } from "@/lib/pro-enums";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import ClientForm from "@/components/pro/ClientForm";
import DeleteButton from "@/components/pro/DeleteButton";
import Toast from "@/components/pro/Toast";

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

  const [demandes, devis] = await Promise.all([
    Message.find({ clientId: c._id }).sort({ createdAt: -1 }).lean(),
    Devis.find({ clientId: c._id }).sort({ seq: -1 }).lean(),
  ]);

  return (
    <div>
      <Toast param="created" message="Fiche client créée." />
      <Toast param="updated" message="Fiche client mise à jour." />

      <Link
        href="/pro/clients"
        className="pro-lab"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--cyan)",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux clients
      </Link>

      <div className="pro-phead" style={{ marginTop: 10 }}>
        <div>
          <h1>{displayName}</h1>
          <div className="sub">
            {CLIENT_TYPE_LABELS[c.type as ClientType] ?? c.type}
            {c.city ? ` · ${c.city}` : ""}
          </div>
        </div>
        <Link
          href={`/pro/devis/nouveau?client=${c._id}`}
          className="pro-btn solid"
        >
          Nouveau devis
        </Link>
      </div>

      <div
        className="pro-detail-grid"
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
          alignItems: "start",
        }}
      >
        <ClientForm
          action={updateClient.bind(null, String(c._id))}
          values={{
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
          cancelHref="/pro/clients"
          submitLabel="Enregistrer les modifications"
        />

        <div style={{ display: "grid", gap: 14 }}>
          <div className="pro-card pro-rel" style={{ padding: "16px 20px" }}>
            <h5>Devis</h5>
            {devis.length === 0 ? (
              <p className="pro-rel-empty">Aucun devis pour ce client.</p>
            ) : (
              devis.map((d: any) => (
                <Link
                  key={String(d._id)}
                  href={`/pro/devis/${d._id}`}
                  className="pro-rel-item"
                >
                  <span className="nm">{d.number}</span>
                  <span className={`pro-st devis-${d.status}`}>
                    <i />
                    {DEVIS_STATUS_LABELS[d.status as DevisStatus] ?? d.status}
                  </span>
                  <span className="mt">{formatEUR(d.totalTTC || 0)}</span>
                </Link>
              ))
            )}
          </div>

          <div className="pro-card pro-rel" style={{ padding: "16px 20px" }}>
            <h5>Factures</h5>
            <p className="pro-rel-empty">Module factures à venir.</p>
          </div>

          <div className="pro-card pro-rel" style={{ padding: "16px 20px" }}>
            <h5>Demandes du site</h5>
            {demandes.length === 0 ? (
              <p className="pro-rel-empty">Aucune demande liée.</p>
            ) : (
              demandes.map((m: any) => (
                <Link
                  key={String(m._id)}
                  href={`/pro/demandes/${m._id}`}
                  className="pro-rel-item"
                >
                  <span className="nm">
                    {m.source === "devis" ? "Devis" : "Contact"}
                  </span>
                  <span className={`pro-st ${m.status}`}>
                    <i />
                    {MESSAGE_STATUS_LABELS[
                      m.status as keyof typeof MESSAGE_STATUS_LABELS
                    ] ?? m.status}
                  </span>
                  <span className="mt">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Zone de danger</div>
            <p
              style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}
            >
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
      </div>
    </div>
  );
}
