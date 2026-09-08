import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Message, { MESSAGE_STATUS_LABELS } from "@/lib/models/Message";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import ClientForm from "@/components/pro/ClientForm";
import DeleteButton from "@/components/pro/DeleteButton";

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

  const demandes = await Message.find({ clientId: c._id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
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
          <div className="pro-lab">Fiche client</div>
          <h1>{c.name}</h1>
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
            name: c.name,
            type: c.type,
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
          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Demandes rattachées</div>
            {demandes.length === 0 ? (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "var(--ink-3)",
                }}
              >
                Aucune demande liée.
              </p>
            ) : (
              <ul style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {demandes.map((m: any) => (
                  <li key={String(m._id)}>
                    <Link
                      href={`/pro/demandes/${m._id}`}
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {m.source === "devis" ? "Devis" : "Contact"} —{" "}
                      {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                    </Link>
                    <span className="pro-lab" style={{ marginLeft: 6 }}>
                      {MESSAGE_STATUS_LABELS[
                        m.status as keyof typeof MESSAGE_STATUS_LABELS
                      ] ?? m.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pro-card" style={{ padding: "16px 20px" }}>
            <div className="pro-lab">Zone de danger</div>
            <p
              style={{ margin: "10px 0 12px", fontSize: 13, color: "var(--ink-3)" }}
            >
              La suppression est définitive. Les demandes rattachées seront
              déliées mais conservées.
            </p>
            <DeleteButton
              action={deleteClient.bind(null, String(c._id))}
              confirmText={`Supprimer définitivement la fiche de ${c.name} ?`}
              label="Supprimer la fiche"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
